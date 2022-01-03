import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Core } from 'providers/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';
import { GIPDialogPrintComponent } from './print.issued';

@Component({
    selector: 'app-tr-form-issued',
    templateUrl: './form.issued.html'
})
export class TrIssuedFormComponent implements OnInit {

    ComUrl: any;
    Default: any;
    perm: any;
    form: any;
    Request: any;

    Busy;
    Material: any[];
    List: any[];

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    Delay;

    constructor(
        private core: Core,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<TrIssuedFormComponent>
    ) { }

    ngOnInit() {

        if (this.Request.material) {
            this.Material = this.Request.material;
        }
        if (this.Request.list) {
            this.List = this.Request.list;
        }

        if (this.form.id == 'add') {
            this.form.tanggal = this.DateToday;
        } else {
            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();

            /**
             * Startup edit Material & List
             */
            if (this.form.material) {
                this.Material = this.form.material;
            }
            if (this.form.list) {
                this.List = this.form.list;
            }
            // => / Startup edit Material & List
        }

    }

    setDate(val, model) {
        if (val) {
            this.form[model] = moment(val, 'DD/MM/YYYY').format('DDMMYYYY').toString();
        }
    }

    /**
     * Calculate
     */
    ReadytoSave: boolean = false;

    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            this.ReadytoSave = false;

            if (Number(item.qty_issued) > 0) {

                var Outstanding = item.outstanding_def - item.qty_issued;
                var Stock = item.stock_def - item.qty_issued;

                if (item.qty_issued > item.outstanding_def) {
                    item.qty_issued = item.outstanding_def;
                    Stock = item.stock_def - item.qty_issued;
                    Outstanding = 0;
                } else
                    if (item.qty_issued > item.stock_def) {
                        item.qty_issued = item.stock_def;
                        Outstanding = item.outstanding_def - item.qty_issued;
                        Stock = 0;
                    }

                item.outstanding = Outstanding;
                item.stock = Stock;

                this.ReadytoSave = true;
            }
        });


    }
    // => / END : Calculate

    /**
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocKeep: any = [];
    StorelocLast: any = [];
    // async StorelocFilter(val: string, i: number) {
    async StorelocFilter(val, item, i: number) {

        this.Storeloc = item.storeloc_list;
        this.StorelocKeep = item.storeloc_list;

        // setTimeout(() => {
        //     if ($('#item-storeloc-' + i).not(':focus')) {
        //         $('#item-storeloc-' + i).focus();
        //     }
        // }, 100);

        if (val != this.StorelocLast[i]) {

            item.storeloc = null;
            item.storeloc_nama = null;

            item.stock = null;
            item.stock_def = null;
            item.price = null;
            item.qty_issued = null;

            item.outstanding = item.outstanding_def;

            // this.CheckTotal();

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
    StorelocSelect(e, item, store, i, selector) {
        if (e.isUserInput) {

            setTimeout(() => {

                item.storeloc = store.id;
                item.storeloc_nama = store.nama;
                item.storeloc_kode = store.kode;

                item.stock = store.stock;
                item.stock_def = store.stock;
                item.price = store.price;

                // console.log(item);

                this.StorelocLast[i] = store.kode;

                $('#' + selector + '-' + i).focus();
            }, 200);

        }
    }
    // => / END : AC Storeloc

    /**
 * Edit
 */
    Edit() {
        if (this.Material && this.Material.length <= 0) {
            this.Material = this.Default.jo.material;
        }
        if (this.List && this.List.length <= 0) {
            this.List = [{
                i: 0
            }];
        }

        setTimeout(() => {
            this.form.is_detail = null;
        }, 100);

    }
    // => END : Edit

    /**
     * Submit
     */
    Submit() {

        /**
         * Prepare Data
         */
        var Material: any[] = [];
        if (this.Material && this.Material.length > 0) {
            for (let item of this.Material) {
                if (Number(item.qty_issued) > 0) {
                    Material.push(item);
                }
            }
        }

        var List: any[] = [];
        if (this.List && this.List.length > 0) {
            for (let item of this.List) {
                if (Number(item.qty_issued) > 0) {
                    List.push(item);
                }
            }
        }

        if (Material.length > 0) {
            this.form.material = JSON.stringify(Material);
        }
        if (List.length > 0) {
            this.form.list = JSON.stringify(List);
        }

        this.form.jo = this.Default.jo.id;
        this.form.jo_kode = this.Default.jo.kode;

        this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');
        // => / END : Prepare Data

        this.form.mrp = this.Request.id;
        this.form.mrp_kode = this.Request.kode;

        var URL = this.ComUrl + 'deliver/edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'deliver/add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.OpenAlert({
                        type: 'success',
                        title: 'Success',
                        msg: `
                            Your Request has been saved as draft. Please verify and approve the request to continue the process.
                        `
                    });

                    this.core.Sharing('reload', 'reload');

                    this.dialogRef.close(result);
                } else {
                    this.Busy = false;

                    this.core.OpenAlert({
                        msg: result.error_msg
                    });
                }
            },
            error => {
                this.Busy = false;

                this.core.OpenNotif(error);
                console.error('Simpan', error);
            }
        );

    }
    // => / END : Submit

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
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'deliver/verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

                                this.core.Sharing('reload', 'reload');
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
    // => / END : Verify

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

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'deliver/approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This request will continue to Approval by Production Plant'
                                };
                                this.core.OpenAlert(Success);

                                this.core.Sharing('reload', 'reload');
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
    // => / END : Approve

    /**
     * Reject
     */
    Reject() {
        swal({
            title: 'Please Confirm to Reject?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'deliver/reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Transfer Rejected',
                                    msg: 'Material Transfer Request Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MTR Rejected'
                                });

                                this.core.Sharing('reload', 'reload');

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
    // => / END : Reject

    /**
     * Approve
     */
    Approve2() {

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

                    var Params: any = {
                        id: this.form.id,
                        kode: this.form.kode,
                        notimeout: 1,
                        company: this.form.company,
                        dept: this.form.dept,
                        storeloc: this.form.storeloc,
                        tanggal: moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD').toString()
                    };

                    if (this.form.material) {
                        Params.material = JSON.stringify(this.form.material);
                    }
                    if (this.form.list) {
                        Params.list = JSON.stringify(this.form.list);
                    }

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'deliver/approve2', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Request has been successfull'
                                };
                                this.core.OpenAlert(Success);

                                this.core.Sharing('reload', 'reload_global');
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
    // => / END : Approve

    /**
     * Print MRP
     */
    dialogPrint: MatDialogRef<GIPDialogPrintComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {

        this.dialogPrint = this.dialog.open(
            GIPDialogPrintComponent,
            this.dialogPrintConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Default = this.Default;
        this.dialogPrint.componentInstance.perm = this.perm;
        this.dialogPrint.componentInstance.form = this.form;
        // => / END : Inject Data to Print Dialog

        /**
         * After Dialog Close
         */
        this.dialogPrint.afterClosed().subscribe(result => {

            this.dialogPrint = null;

            if (result) {
            }
        });
        // => / END : After Dialog Close
    }
    // => / END : Print MR

}
