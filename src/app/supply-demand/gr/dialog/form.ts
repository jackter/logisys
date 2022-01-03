import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { GRDetailDialogComponent } from './detail';
import { RGRCreateFormDialogComponent } from 'app/supply-demand/rgr/dialog/create';

@Component({
    selector: 'dialog-form-gr',
    templateUrl: './form.html',
})
export class GRFormDialogComponent implements OnInit {

    Busy: boolean;
    Delay;
    form: any;
    perm: any;
    Default: any;
    ComUrl: string;

    History: any;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<GRFormDialogComponent>,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
        }

        /**
         * Set Storeloc by Company
         */
        var Find: any = _.find(this.Default.company, {
            id: this.form.company
        });
        if (Object.keys(Find).length > 0) {
            this.Storeloc = Find.store;
            this.StorelocKeep = Find.store;
        }
        // => / END

        for(let item of this.form.detail){
            item.outstanding = item.outstanding - item.qty_canceled;
            item.outstanding_def = item.outstanding_def - item.qty_canceled;
        }

    }

    /**
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocKeep: any = [];
    StorelocLast;
    async StorelocFilter(val: string) {

        if (val != this.StorelocLast) {

            this.form.storeloc = null;
            this.form.storeloc_kode = null;

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.StorelocKeep) {

                var Combine = item.kode + ' : ' + item.nama;
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Storeloc = Filtered;

        } else {
            this.Storeloc = this.StorelocKeep;
        }

    }
    StorelocSelect(e, item, i) {
        if (e.isUserInput) {

            this.form.detail[i].storeloc = item.id;
            this.form.detail[i].storeloc_nama = item.nama;
            this.form.detail[i].storeloc_kode = item.kode;

            this.StorelocLast = item.nama;

            setTimeout(() => {
                $('*[name="description"]').focus();
            }, 100);

        }
    }
    // => / END : AC Storeloc

    /**
     * Calculate Class
     */
    ReadySave: number;
    Calculate(item) {

        this.ReadySave = null;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Outstanding: number = item.outstanding_def;

            item.outstanding = Outstanding - item.qty_receipt;

            if (item.qty_receipt > Outstanding) {
                item.qty_receipt = Outstanding;
                item.outstanding = 0;
            }

            for (let detail of this.form.detail) {
                if (detail.qty_receipt > 0) {
                    this.ReadySave += detail.qty_receipt;
                }
            }

        }, 100);

    }
    // => / END : Class

    /**
     * Receipt
     */
    Receipt() {
        this.form.is_detail = null;
        this.ReadySave = null;

        setTimeout(() => {
            $('*[name="tanggal"]').focus();
        }, 250);
    }
    // => / END : Receipt

    /**
     * Calculate HPP
     */

    CalcHPP() {
        var OtherCost: number = this.form.other_cost;
        var PPBKB: number = this.form.ppbkb;
        var sum_qty_po: number = 0;

        for (let item of this.form.detail) {
            item.price = item.price / 100 * (100 - this.form.disc);
            
            if(this.form.inclusive_ppn == 1){
                item.price = item.price / 1.1;
            }
            var QtyReceipt: number = item.qty_receipt;
            var QtyPO: number = item.qty_po;
            var Price: number = item.price;
            var QtyPrice: number = QtyReceipt * Price;

            var GetOtherCost: number = 0;
            var GetPPBKB: number = 0;

            sum_qty_po = sum_qty_po + (QtyPO * 1);

            if (OtherCost > 0) {
                GetOtherCost = (OtherCost / QtyPO) * QtyReceipt;
            }
            if (PPBKB > 0) {
                GetPPBKB = (PPBKB / QtyPO) * QtyReceipt;
            }

            var Total = (QtyPrice + GetOtherCost + GetPPBKB);
            var UnitPrice = Total / QtyReceipt;

            item.total_unit_price = Total;
            item.unit_price = UnitPrice;
        }

        this.form.sum_qty_po = sum_qty_po;
    }
    // => / END : Calculate HPP

    /**
     * Simpan
     */
    ReadyVerify;
    Simpan() {

        this.CalcHPP();
        this.ReadyVerify = true;

    }
    Edit() {
        this.ReadyVerify = false;

        setTimeout(() => {
            $('#item-receipt-0').focus();
        }, 100);
    }
    // => / END : Simpan

    /**
     * Verify
     */
    Verify() {

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
                
                // console.log(this.form.detail);

                if (result.value) {

                    /**
                     * Check COA
                     */
                    var CheckIDList = [];
                    for (let item of this.form.detail) {
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

                        if(this.form.tanggal){
                            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                        }

                        this.form.list = JSON.stringify(this.form.detail);

                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'save', this.form).subscribe(
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
                    // => / END : Check COA
                }

            }
        );

    }
    // => / END : Verify

    /**
     * Show Detail
     */
    dialogDetail: MatDialogRef<GRDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };

    ShowDetail(item) {

        this.dialogDetail = this.dialog.open(
            GRDetailDialogComponent,
            this.dialogDetailConfig
        );

        this.dialogDetail.componentInstance.Title = item.kode;
        this.dialogDetail.componentInstance.GRDate = item.tanggal;
        this.dialogDetail.componentInstance.Data = item;
        this.dialogDetail.componentInstance.form = this.form;

        this.dialogDetail.afterClosed().subscribe(result => {

            this.dialogDetail = null;

        });

    }
    // => / END : Show Detail

    /**
     * Create RGR (RGRForm)
     */
    dialogRGR: MatDialogRef<RGRCreateFormDialogComponent>;
    dialogRGRConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    
    CreateRGR(item) {
        if (item.inv == 0) {
            this.dialogRGR = this.dialog.open(
                RGRCreateFormDialogComponent,
                this.dialogRGRConfig
            );

            /**
             * Inject Data
             */
            this.form.gr = item.id;
            this.form.gr_kode = item.kode;
            this.form.po = item.po;
            this.form.po_kode = item.po_kode;
            this.form.gr_date = item.tanggal;
            this.form.list = item.detail;
            this.dialogRGR.componentInstance.ComUrl = 'e/snd/rgr/';
            this.dialogRGR.componentInstance.perm = this.perm;
            this.dialogRGR.componentInstance.form = this.form;
            // => / END : Inject Data

            /**
             * After Dialog Close
             */
            this.dialogRGR.afterOpened().subscribe(result => {

                this.dialogRGR = null;

                this.dialogRef.close();
            });
            // => / END : After Dialog Close
        }
        else {
            this.core.OpenAlert({
                title: 'GR has been invoiced',
                msg: '<div>GR cannot be returned because it has been invoiced.</div>',
                width: 400
            });
        }

    }
    // => / END : Create RGR (RGRForm)

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
                            <div>To verify transaction ref. <strong>${this.form.kode}</strong></div>
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
