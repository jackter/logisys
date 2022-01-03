import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { ShippingHistoryDetailDialogComponent } from './detail';

@Component({
    selector: 'dialog-form-gi',
    templateUrl: './form.html'
})
export class ShippingFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl: any;
    Com: any;
    Busy: any;

    Delay: any;

    ReadyVerify;

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<ShippingFormDialogComponent>
    ) { }

    ngOnInit() {

        if (this.Default) {
            if (this.form.id == 'add') {
                var ID = this.form.id;
                this.form = JSON.parse(JSON.stringify(this.Default.sales_order));
                this.form.id = ID;
                this.form.tanggal = this.DateToday;
            } else {
                if (this.form.tanggal) {
                    this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DD/MM/YYYY');
                }

                if (this.form.date_target) {
                    this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');
                }
            }

            this.Storeloc = this.Default.list_storeloc;
        }
    }

    Edit() {
        this.form.is_detail = null;
    }

    setDate(val, model) {
        if (val) {
            this.form[model] = moment(val, 'DD/MM/YYYY').format('DDMMYYYY').toString();

            setTimeout(() => {
                $('*[name="company_nama"]').focus();
            }, 100);
        }
    }

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

    /**
     * AC Storeloc
     */
    Storeloc: any = [];

    StorelocFilter(val: string) {

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            if (this.Default.list_storeloc) {
                for (let item of this.Default.list_storeloc) {

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
            this.Storeloc = this.Default.list_storeloc;
        }

    }

    StorelocSelect(e, item) {
        if (e.isUserInput) {

            setTimeout(() => {

                this.form.storeloc = item.id;
                this.form.storeloc_nama = item.nama;
                this.form.storeloc_kode = item.kode;

                this.form.stock = item.stock;
                this.form.stock_def = item.stock;
                this.form.price = item.price;
                this.form.storeloc_grup = item.grup;
                this.form.storeloc_grup_nama = item.grup_nama;

                setTimeout(() => {
                    $('*[name="qty_delivery"]').focus();
                }, 100);
            }, 200);

        }
    }
    StorelocRemove() {
        this.form.storeloc = null;
        this.form.storeloc_nama = null;
        this.form.storeloc_kode = null;

        this.form.stock = null;
        this.form.stock_def = null;
        this.form.price = null;
        this.form.grup = null;
        this.form.grup_nama = null;
    }
    // => / END : AC Storeloc

    /**
     * CheckQty
     */
    CheckQty() {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Delivery: number = this.form.qty_delivery;
            var Qty: number = this.form.qty_so;
            var Stock: number = this.Storeloc.stock_def;
            var Outstanding: number = this.Storeloc.qty_outstanding_def;

            var Max: any = [
                Qty,
                Stock,
                Outstanding
            ];
            Max = Math.min(...Max);

            this.form.qty_outstanding = Outstanding - Delivery;
            this.form.stock = Stock - Delivery;

            if (Delivery > Max) {
                this.form.qty_delivery = Max;
                this.form.qty_outstanding = Outstanding - Max;
                this.form.stock = Stock - Max;
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

        for (let item of this.Storeloc) {
            if (item.id) {

                if (this.form.qty_delivery > 0) {
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

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'save';
                    }

                    this.form.so_kode = this.form.kode;

                    if (this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');
                    }

                    this.Busy = true;

                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Transaction Success',
                                    msg: 'Shipment for ' + this.form.kode + ' success!'
                                };
                                this.core.OpenAlert(Success);

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

                    // });
                }
            }
        );
    }
    // => / END : Simpan

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

                            if (Exists.length <= 0) {

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

                if (result.value) {

                    var Params = {
                        id: this.form.id
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> / END : Verify

    /**
    * Approve
    */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Approve',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {
                    this.form.tanggal_send = moment(this.form.tanggal, 'DD/MM/YYYY').format('YYYY-MM-DD').toString();

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'Your Request Approval Success!'
                                };
                                this.core.OpenAlert(Success);

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
                            console.error('Approve', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> / END : Approve

    /**
    * Reject
    */
    Reject() {
        swal({
            title: 'Please Confirm to Reject?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Reject Complete',
                                    msg: 'Your Request Has Been Rejected'
                                };
                                this.core.OpenAlert(Success);

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
                            console.error('Reject', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> / END : Reject

    /**
     * Dialog History Detail
     */
    dialogDetail: MatDialogRef<ShippingHistoryDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    ShowDetail() {

        this.dialogDetail = this.dialog.open(
            ShippingHistoryDetailDialogComponent,
            this.dialogDetailConfig
        );

        this.dialogDetail.componentInstance.form = this.form;
        // this.dialogDetail.componentInstance.Com = this.Com;
        this.dialogDetail.componentInstance.ComUrl = this.ComUrl;

        // console.log(item);


        this.dialogDetail.afterOpened().subscribe(result => {
            this.dialogRef.close();
        });

    }
    //=> / END : Dialog History Detail

    date(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

}
