import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { GIHistoryDialogComponent } from './history';

@Component({
    selector: 'dialog-form-gi',
    templateUrl: './form.html'
})
export class GIFormDialogComponent implements OnInit {

    List: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    ReceiptState;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<GIFormDialogComponent>
    ) {
    }

    ngOnInit() {

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;
            }

            if (this.form.date_target) {
                this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');
            }

            this.form.remarks = this.form.note;
        }

        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
        }

        // => / END : Form Edit
    }

    /**
     * AC Cost center
     */
    Cost: any;
    CostFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.cost', Params).subscribe(
                result => {

                    if (result) {
                        this.Cost = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);
    }
    CostSelect(e, item) {

        if (e.isUserInput) {

            this.form.cost = item.id;
            this.form.cost_kode = item.kode;
            this.form.cost_nama = item.nama;

            setTimeout(() => {
                $('*[name="remarks"]').focus();
            }, 100);

        }
    }
    // => End : Cost Center

    /**
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocKeep: any = [];
    StorelocLast: any = [];
    async StorelocFilter(val: string, i: number) {

        this.Storeloc = this.List[i].storeloc_list;
        this.StorelocKeep = this.List[i].storeloc_list;

        setTimeout(() => {
            if ($('#item-storeloc-' + i).not(':focus')) {
                $('#item-storeloc-' + i).focus();
            }
        }, 100);

        if (val != this.StorelocLast[i]) {

            this.List[i].storeloc = null;
            this.List[i].storeloc_nama = null;

            this.List[i].stock = null;
            this.List[i].stock_def = null;
            this.List[i].price = null;
            this.List[i].qty_gi = null;

            this.List[i].qty_outstanding = this.List[i].qty_outstanding_def;

            this.CheckTotal();

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            if (this.StorelocKeep) {
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
            }

            this.Storeloc = Filtered;

        } else {
            this.Storeloc = this.StorelocKeep;
        }

    }
    StorelocSelect(e, item, i) {
        if (e.isUserInput) {

            setTimeout(() => {

                this.List[i].storeloc = item.id;
                this.List[i].storeloc_nama = item.nama;
                this.List[i].storeloc_kode = item.kode;

                this.List[i].stock = item.stock;
                this.List[i].stock_def = item.stock;
                this.List[i].price = item.price;

                // console.log(this.List[i]);

                this.StorelocLast[i] = item.kode;

                $('#qty_gi-' + i).focus();
            }, 200);

        }
    }
    // => / END : AC Storeloc

    /**
     * CheckQty
     */
    CheckQty(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var GI: number = item.qty_gi;
            var Approved: number = item.qty_approved;
            var Stock: number = item.stock_def;
            var Outstanding: number = item.qty_outstanding_def;

            var Max: any = [
                Approved,
                Stock,
                Outstanding
            ];
            Max = Math.min(...Max);

            item.qty_outstanding = Outstanding - GI;
            item.stock = Stock - GI;

            if (GI > Max) {
                item.qty_gi = Max;
                item.qty_outstanding = Outstanding - Max;
                item.stock = Stock - Max;
            }

            this.CheckTotal();

        }, 100);

    }
    // => / END : CheckQty

    /**
     * Check Total
     */
    ReadyToSave: number = 0;
    CheckTotal() {
        this.ReadyToSave = 0;
        this.form.all_outstanding = 0;

        for (let item of this.List) {
            if (item.storeloc) {

                if (item.qty_gi > 0) {
                    this.ReadyToSave++;
                }

            }

            this.form.all_outstanding += Number(item.qty_outstanding);

        }
    }
    // => / END : Check Total

    /**
     * Simpan
     */
    Simpan() {

        swal({
            title: 'Please Confirm to Save?',
            html: '<div>This transaction will use each Stock on Selected Store Locations and can not be undone.<br>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            width: 400
        }).then(
            result => {

                if (result.value) {

                    var CheckIDList = [];
                    // for (let item of this.List) {
                    //     CheckIDList.push({
                    //         id: item.id,
                    //         kode: item.kode,
                    //         nama: item.nama
                    //     });
                    // }

                    for (let item of this.List) {
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

                        this.form.detail = JSON.stringify(this.List);

                        if(this.form.tanggal){
                            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                        }

                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'save', this.form).subscribe(
                            result => {

                                if (result.status == 1) {

                                    this.core.Sharing('reload', 'reload');

                                    var Success = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Transaction Success',
                                        msg: 'Goods Issued for ' + this.form.kode + ' success!'
                                    };
                                    this.core.OpenAlert(Success);

                                    this.core.send({
                                        info: 'GI Saved'
                                    });

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
                                console.error('Save', error);
                                this.Busy = false;
                            }
                        );

                    });

                }

            }
        );

    }
    // => / END : Simpan

    /**
     * Dialog History GI
     */
    dialogHistory: MatDialogRef<GIHistoryDialogComponent>;
    dialogHistoryConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };

    ShowHistory() {

        this.dialogHistory = this.dialog.open(
            GIHistoryDialogComponent,
            this.dialogHistoryConfig
        );

        this.dialogHistory.componentInstance.form = this.form;

        this.dialogHistory.afterClosed().subscribe(result => {

        });

    }
    // => / END : Dialog History GI

    /**
     * Force Close
     */
    ForceClose() {
        swal({
            title: 'Are you sure?',
            html: '<div>This action cannot be undone?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Force Close',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'close', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Success',
                                    msg: 'Force Close Success!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MR Close'
                                });

                                this.dialogRef.close(result);

                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);

                                this.Busy = false;
                            }

                        },
                        error => {
                            console.error('Force Close', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => END : Force Close

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
                            <div>Please call Accounting Dept to complete COA for the following items:</div>
                            <ol>
                        `;
                        for (let item of result.items) {
                            MSG += `
                                <li>
                                    <strong>${item.kode}</strong> : ${item.nama}
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
                        title: 'Item COA Not Available',
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
