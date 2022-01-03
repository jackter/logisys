import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-rgr_create',
    templateUrl: './create.html',
    styleUrls: ['../rgr.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RGRCreateFormDialogComponent implements OnInit {

    ComUrl: string;
    Com;
    Busy;
    form: any = {};
    perm: any = {};
    Delay: any;
    Default: any = {};

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<RGRCreateFormDialogComponent>,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
        }
    }

    /**
     * Calculate Class
     */
    ReadySave: number = 0;
    Calculate(item) {

        this.ReadySave = 0;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Receipt: number = item.qty_max_return_def;

            item.qty_max_return = Receipt - item.qty_return;

            if (item.qty_return > Receipt) {
                item.qty_return = Receipt;
                item.qty_max_return = 0;
            }

            let i = 0;
            for (let detail of this.form.list) {
                if (detail.qty_return > 0) {
                    this.ReadySave += detail.qty_return;
                }
                else {
                    this.form.list[i].qty_return = 0;
                }

                i++;
            }


        }, 100);

    }
    // => / END : Class

    /**
     * AC RGR Code
     */
    GRCode: any;
    GRCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.gr', Params).subscribe(
                result => {

                    if (result) {
                        this.GRCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);

    }
    GRCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.gr_kode = item.kode;
            this.form.gr = item.id;
            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;
            this.form.list = item.list;
            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.supplier_nama;
            this.form.gr_date = item.tanggal;
            this.form.po = item.po;
            this.form.po_kode = item.po_kode;
            this.form.currency = item.currency;
            this.form.other_cost = item.other_cost;
            this.form.sum_qty_po = item.sum_qty_po;
            this.form.inclusive_ppn = item.inclusive_ppn;
            this.form.enable_journal = item.enable_journal;

            setTimeout(() => {
                $('*[name="tanggal"]').focus();
            }, 100);

        }

    }
    GRCodeRemove() {

        this.form.gr_kode = null;
        this.form.gr = null;
        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;
        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
        this.form.list = null;
        this.form.enable_journal = null;
    }
    // => END : AC RGR Code

    /**
     * Simpan
     */
    Simpan() {

        swal({
            title: 'Please Confirm to Verify?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel'
        }).then(
            result => {
                if (result.value) {
                    /**
                     * Check COA
                     */
                    var CheckIDList = [];
                    for (let item of this.form.list) {
                        CheckIDList.push({
                            grup: item.grup,
                            grup_nama: item.grup_nama
                        });
                    }

                    var ParamsCheck: any = {
                        company: this.form.company,
                        list: JSON.stringify(CheckIDList),
                    };

                    this.CheckCOA(ParamsCheck, () => {
                        this.form.list_send = JSON.stringify(this.form.list);
                        if(this.form.tanggal){
                            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                        }

                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'partial.rgr', this.form).subscribe(
                            result => {

                                if(result.pihakketiga_coa == 0){
                                    var Alert = {
                                        msg: result.error_msg
                                    };
                                    this.core.OpenAlert(Alert);
    
                                    this.Busy = false;
                                }
                                else if (result.status == 1) {

                                    this.core.Sharing('reload', 'reload');

                                    this.dialogRef.close(result);

                                } else {
                                    this.Busy = false;

                                    var Alert = {
                                        msg: result.error_msg
                                    };
                                    this.core.OpenAlert(Alert);
                                }

                            },
                            error => {
                                this.Busy = false;
                                this.core.OpenNotif(error);
                            }
                        );

                    });
                }
            }
        );
    }
    // => END : Simpan

    /**
     * Check COA
     */
    CheckCOA(params, cb) {

        this.core.Do('e/stock/item/check.coa', params).subscribe(
            result => {

                if (result.status != 1 && this.form.enable_journal == 1) {

                    /**
                     * Create MSG
                     */
                    var MSG = '';
                    if (result.items) {
                        MSG = `
                        <div style="text-align: left!important">
                            <div>To verify this transaction</div>
                            <div>Please call Accounting Dept to complete COA for the following group items:</div>
                            <ol>
                        `;
                        var arrGrup = [];

                        for (let item of result.items) {
                            var Exists = this.core.FJSON2(arrGrup, 'grup', item.grup);

                            if(Exists.length <= 0){

                                arrGrup.push({
                                    grup: item.grup,
                                    grup_nama: item.grup_nama
                                });           
                    
                            }
                        }

                        for (let item of arrGrup) {
                            MSG += `
                                <li>
                                    ${item.grup_nama}
                                </li>
                            `;
                        }
                        MSG += `
                            </ol>
                        </div>
                        `;
                    }
                    // => / END : Create MSG

                    this.core.OpenAlert({
                        title: 'Item Group COA Not Available',
                        msg: MSG,
                        width: 600
                    });

                } else {
                    cb();
                }

            }
            
        );

    }

    // => / END : Check COA

}
