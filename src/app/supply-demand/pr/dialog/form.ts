import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import swal from 'sweetalert2';
import { PQFormDialogComponent } from '../../pq/dialog/form';
import { PRPrintDialogComponent } from './print';
import { PRRejectFormDialogComponent } from './reject';

@Component({
    selector: 'dialog-form-pr',
    templateUrl: './form.html'
})
export class PRFormDialogComponent implements OnInit {

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

    minDate;

    ReceiptState;

    /* PERMISSIONS
    [
        {
            "id":1,
            "text":"View",
            "act":"view"
        },
        {
            "id":2,
            "text":"Add",
            "act":"add"
        },
        {
            "id":3,
            "text":"Edit",
            "act":"edit"
        },
        {
            "id":4,
            "text":"Hapus",
            "act":"hapus"
        }
    ]
    */

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PRFormDialogComponent>
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

        }
        // => / END : Form Edit
    }

    /**
     * AC Item
     */
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
                        $('#qty-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    this.List[i].nama = '';

                    setTimeout(() => {
                        this.WaitItem[i] = false;
                        $('#qty-' + SelectExists).focus();
                    }, 250);
                }

            }, 0);

        }

    }

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

    /**
     * Edit
     */
    Edit() {
        this.form.is_detail = null;
        setTimeout(() => {
            $('#est_price-0').focus();
        }, 100);
    }
    // => / END : Edit

    /**
     * Simpan
     */
    Simpan() {

        this.form.list = JSON.stringify(this.List);

        var URL = this.ComUrl + 'add';
        if (this.form.from_pr && this.form.pr_kode) {
            URL = this.ComUrl + 'edit';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    if (!this.form.from_pr) {
                        this.form.purchased = 1;

                        this.core.Sharing('reload', 'reload');

                        var Success = {
                            type: 'success',
                            showConfirmButton: false,
                            title: 'Purchase Order Created',
                            msg: 'Please go to Purchase Request page to Continue the Process!'
                        };
                        this.core.OpenAlert(Success);

                        this.core.send({
                            info: 'PR Created'
                        });

                        this.dialogRef.close(result);
                    } else {
                        this.form.is_detail = true;

                        this.Busy = false;
                    }

                } else {

                    var Alert = {
                        error_msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);

                    this.Busy = false;
                }

            },
            error => {
                console.error('add', error);
                this.core.OpenNotif(error);

                this.Busy = false;
            }
        );

    }
    // => / END : Simpan

    /**
     * Check Estimate
     */
    Estimated: number;
    StillZero: boolean;
    CheckEstimate() {
        /**
         * Check Estimated
         */
        this.StillZero = false;
        for (let item of this.List) {
            if (Number(item.est_price) <= 0) {
                this.StillZero = true;
                break;
            }
        }
        // => / END : Check Estimated

        if (this.StillZero) {
            swal({
                title: 'Estimated Price are not set?',
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
                        this.Verify();
                    }

                }
            );
        } else {
            this.Verify();
        }

    }
    // => / END : Check Estimate

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
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        pr_kode: this.form.pr_kode,
                        kode: this.form.kode,
                        mr: this.form.mr
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                // this.dialogRef.close(result);
                                this.form.verified = 1;

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Request Verified',
                                    msg: 'Waiting for Approval!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'PR Verified'
                                });

                                this.Busy = false;

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
    Approve(lvl) {

        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
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
                        pr_kode: this.form.pr_kode,
                        kode: this.form.kode,
                        mr: this.form.mr,
                        lvl: lvl,
                        apvd: this.form.apvd,
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'PR Approved (LVL-' + lvl + ')'
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
    Reject(lvl) {
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
                        pr_kode: this.form.pr_kode,
                        kode: this.form.pr_kode,
                        mr: this.form.mr,
                        lvl: lvl
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Purchase Request Rejected!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'PR Rejected (LVL-' + lvl + ')'
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

    /**
     * Reject PR
     */
    dialogReject: MatDialogRef<PRRejectFormDialogComponent>;
    dialogRejectConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    RejectDialog(lvl) {

        this.dialogReject = this.dialog.open(
            PRRejectFormDialogComponent,
            this.dialogRejectConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogReject.componentInstance.ComUrl = this.ComUrl;
        this.dialogReject.componentInstance.Default = this.Default;
        this.dialogReject.componentInstance.perm = this.perm;
        this.dialogReject.componentInstance.form = this.form;
        this.dialogReject.componentInstance.form.lvl = lvl;
        // => / END : Inject Data to Print Dialog

        /**
         * After Dialog Close
         */
        this.dialogReject.afterClosed().subscribe(result => {

            this.dialogReject = null;

            if (result) {
                this.dialogRef.close(result);
            }

        });
        // => / END : After Dialog Close

    }
    //=> END : Reject PR

    /**
     * Print PR
     */
    dialogPrint: MatDialogRef<PRPrintDialogComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {

        this.dialogPrint = this.dialog.open(
            PRPrintDialogComponent,
            this.dialogPrintConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Default = this.Default;
        this.dialogPrint.componentInstance.perm = this.perm;
        this.dialogPrint.componentInstance.form = this.form;
        // console.log(this.form);
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
    // => / END : Print PR

    /**
     * PQ Dialog
     */
    dialogPQ: MatDialogRef<PQFormDialogComponent>;
    dialogPQConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPQDialog() {

        if (this.perm.create_quotation) {

            this.dialogPQ = this.dialog.open(
                PQFormDialogComponent,
                this.dialogPQConfig
            );

            /**
             * Inject Data to Dialog
             */
            this.dialogPQ.componentInstance.ComUrl = 'e/snd/pq/';
            this.dialogPQ.componentInstance.Default = this.Default;
            this.dialogPQ.componentInstance.Com = {
                name: 'Purchase Quotations',
                title: 'Create Purchase Quotations'
            };
            this.dialogPQ.componentInstance.perm = this.perm;
            this.dialogPQ.componentInstance.form = this.form;
            // => / END : Inject Data to Dialog

            /**
             * After dialog close
             */
            this.dialogPQ.afterClosed().subscribe(result => {

                this.dialogPQ = null;

                if (result) {

                }

            });
            // => / END : After dialog close

        }
    }
    // => / END : PQ Dialog

}
