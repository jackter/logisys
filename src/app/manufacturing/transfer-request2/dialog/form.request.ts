import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { MRPDialogPrintComponent } from './print.request';

@Component({
    selector: 'app-tr-form-request',
    templateUrl: './form.request.html'
})
export class TrRequestFormComponent implements OnInit {

    ComUrl: any;
    Default: any;
    Com: any;
    perm: any;
    form: any;

    Busy;
    Material: any[];

    List: any[] = [{
        i: 0
    }];

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    constructor(
        private core: Core,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<TrRequestFormComponent>
    ) { }

    ngOnInit(): void {

        this.Material = this.Default.jo.material;

        if (this.form.id == 'add') {
            this.form.tanggal = this.DateToday;
        } else {
            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();

            /**
             * Startup edit Material & List
             */
            if (this.form.material) {
                this.Material = this.form.material;
            } else {
                this.Material = [];
            }
            if (this.form.list) {
                this.List = this.form.list;
            } else {
                this.List = [];
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
     * Edit
     */
    Edit() {
        if (this.Material.length <= 0) {
            this.Material = this.Default.jo.material;
        }
        if (this.List.length <= 0) {
            this.List = [{
                i: 0
            }];
        }

        setTimeout(() => {
            this.form.is_detail = null;

            this.Calculate();
        }, 100);

    }
    // => END : Edit

    /**
     * AC Item
     */
    Delay;
    Item: any;
    WaitItem: any[] = [];
    ItemFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitItem[i] = true;

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };

                this.core.Do('e/stock/item/inc/list.normal', Params).subscribe(
                    result => {

                        if (result) {
                            this.Item = result;
                        }

                        this.WaitItem[i] = false;

                    },
                    error => {
                        console.error('ItemFilter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }
                );

            }, 100);

        }

    }
    ItemSelect(e, item, i: number) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.List, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {

                    this.List[i] = item;
                    this.List[i]['i'] = i;

                    this.Item = [];

                    this.CreateList(i);

                    setTimeout(() => {
                        $('#qty_req-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    this.List[i].nama = '';

                    setTimeout(() => {
                        this.WaitItem[i] = false;
                        $('#qty_req-' + SelectExists).focus();
                    }, 250);
                }

            }, 0);

        }

    }
    // => / END : AC Item

    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            // => Check List
            if (!this.List[i].kode) {
                this.List[i] = {};
            }

            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.List[next]) {
                this.List.push(DataNext);
            }

        }, 100);

    }

    DeleteList(del) {

        swal({
            title: 'Delete List?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var DATA = Object.keys(this.List);

                    // => Delete
                    var NewList = [];
                    let index = 0;
                    for (let i = 0; i < DATA.length; i++) {
                        if (del == i) {

                            delete this.List[i];

                        } else {

                            this.List[i].i = index;

                            NewList[index] = this.List[i];
                            index++;
                        }
                    }

                    // => Recreaten
                    this.List = NewList;

                }

            }
        );

    }
    // => / END : List

    /**
     * Calculate
     */
    ReadytoSave: boolean = false;
    Calculate() {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            /**
             * Loop Material
             */
            for (let material of this.Material) {

                this.ReadytoSave = false;
                if (Number(material.qty_req) > 0) {
                    this.ReadytoSave = true;
                    break;
                }

            }
            // => / END : Loop Material

            /**
             * Loop Others
             */
            if (!this.ReadytoSave) {
                for (let item of this.List) {

                    if (Number(item.qty_req) > 0) {
                        this.ReadytoSave = true;
                        break;
                    }

                }
            }
            // => / END : Loop Others

        }, 100);
    }
    // => / END : Calculate

    /**
     * Submit
     */
    Submit() {

        /**
         * Prepare Data
         */
        var Material: any[] = [];
        for (let item of this.Material) {
            if (Number(item.qty_req) > 0) {
                Material.push(item);
            }
        }

        var List: any[] = [];
        for (let item of this.List) {
            if (Number(item.qty_req) > 0) {
                List.push(item);
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

        var URL = this.ComUrl + 'request/edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'request/add';
        }

        // console.log(URL);
        // console.log(this.form);

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
                        kode: this.form.kode,
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'request/verify', Params).subscribe(
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
                    this.core.Do(this.ComUrl + 'request/approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Job Order now available for Actual Production'
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
                    this.core.Do(this.ComUrl + 'request/reject', Params).subscribe(
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

    OpenFormIssued() {

        /**
         * Check Unapproved
         */
        if (this.form.unapproved > 0) {

            this.core.OpenAlert({
                title: 'Action Rejected!',
                msg: `
                    <div>
                        Please Finish all outstanding Request Issued Data before create a new one.
                    </div>
                    <br>
                    <div>
                        Check unapproved sounding on the list.
                    </div>
                `,
                width: 400
            });

            return false;

        }

        this.dialogRef.close({
            openIssued: true,
            request: this.form
        });
    }

    /**
     * Print MRP
     */
    dialogPrint: MatDialogRef<MRPDialogPrintComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {

        this.dialogPrint = this.dialog.open(
            MRPDialogPrintComponent,
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
