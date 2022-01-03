import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { PRPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-direct',
    templateUrl: './direct.html'
})
export class DirectPRFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    List: any[] = [{
        i: 0
    }];

    minDate = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DirectPRFormDialogComponent>
    ) { }

    ngOnInit() {

        this.Company = this.Default.company;

        /**
         * Check Company
         * 
         * Jika Company hanya 1, maka system akan melakukan Autoselect
         * dan Mematikan fungsi Auto Complete
         */
        this.CompanyLen = Object.keys(this.Company).length;
        if (this.CompanyLen == 1) {
            this.form.company = this.Company[0].id;
            this.form.company_abbr = this.Company[0].abbr;
            this.form.company_nama = this.Company[0].nama;

            this.Dept = this.Company[0].dept;
            this.DeptKeep = this.Company[0].dept;

            this.DeptLen = Object.keys(this.Dept).length;
            if (this.DeptLen == 1) {
                this.form.dept = this.Dept[0].id;
                this.form.dept_nama = this.Dept[0].nama;
                this.form.dept_abbr = this.Dept[0].abbr;

                this.DeptReady = true;
            }
        }
        // => / Check Company

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;
            }

            if (this.form.date_target) {
                this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD');
            }

            this.DeptReady = true;

        }
        // => / END : Form Edit

    }

    /**
     * FocusCompany
     */
    FocusCompany() {
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 100);
    }
    // => / END : FocusCompany

    /**
     * Focus To
     */
    FocusTo(target) {
        setTimeout(() => {
            $(target).focus();
        }, 100);
    }
    // => / END : Focus To

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        var val = this.form.company_nama;

        if (val != this.CompanyLast) {
            this.form.company = null;
            this.form.company_abbr = null;

            this.form.dept = null;
            this.form.dept_abbr = null;
            this.form.dept_nama = null;
        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.company) {

                var Combine = item.nama + ' (' + item.abbr + ')';
                if (
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Company = Filtered;

        } else {
            this.Company = this.Default.company;
        }

    }
    CompanySelect(e, item) {

        if (e.isUserInput) {
        
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;
    
            this.CompanyLast = item.nama;
    
            this.Dept = item.dept;
            this.DeptKeep = item.dept;
    
            setTimeout(() => {
                $('*[name="dept_nama"]').focus();
            }, 100);
        }
    }
    CompanyReset(){

        this.form.company = null; 
        this.form.company_nama = null; 
        this.form.company_abbr = null;

        this.form.dept = null;
        this.form.dept_nama = null;
        this.form.dept_abbr = null;

        this.form.cost = null;
        this.form.cost_kode = null;
        this.form.cost_nama = null;
    }
    // => / END : AC Company

    /**
     * AC Dept
     */
    Dept: any = [];
    DeptLen: number;
    DeptLast;
    DeptReady: boolean = false;
    DeptKeep: any = [];
    DeptTemp: any = {};
    DelayDept;

    DeptFilter() {

        this.DeptReady = false;

        var val = this.form.dept_nama;

        if (val != this.DeptLast) {
            this.form.dept = null;
            this.form.dept_abbr = null;

            this.Dept = this.DeptKeep;
        }

        if (val && this.DeptKeep) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.DeptKeep) {

                var Combine = item.abbr + ' : ' + item.nama;
                if (
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Dept = Filtered;

        }

        // clearTimeout(this.Delay);
        // this.Delay = setTimeout(() => {
        //     // if(Object.keys(this.Dept).length <= 0){
        //     if (_.size(this.Dept) <= 0) {
        //         if (val) {

        //             if (this.perm.add_dept) {

        //                 swal({
        //                     title: 'Create new Department?',
        //                     html: '<div>No Department Found, do you want to create new Department/Plant?</div>',
        //                     type: 'warning',
        //                     reverseButtons: true,
        //                     focusCancel: true,
        //                     showCancelButton: true,
        //                     confirmButtonText: 'Yes',
        //                     cancelButtonText: 'Cancel'
        //                 }).then(
        //                     result => {

        //                         if (result.value) {
        //                             this.form.dept_abbr = null;
        //                             this.DeptReady = true;

        //                             setTimeout(() => {
        //                                 $('*[name="dept_abbr"]').focus();
        //                             }, 500);
        //                         }

        //                     }
        //                 );

        //             } else {

        //                 var Alert = {
        //                     title: 'Dept/Plant Not Found',
        //                     msg: 'You dont have permissions to Create New Department, Please Call System Administrator to help you!'
        //                 };

        //                 this.core.OpenAlert(Alert);

        //             }

        //         }
        //     }
        // }, 1500);

    }

    DeptSelect(e, item) {
        if (e.isUserInput) {
            this.form.dept = item.id;
            this.form.dept_nama = item.nama;
            this.form.dept_abbr = item.abbr;

            this.DeptLast = item.nama;

            setTimeout(() => {
                this.DeptReady = true;
            }, 500);

            setTimeout(() => {
                $('*[name="note"]').focus();
            }, 100);
        }
    }
    // => / END : AC Dept

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
     * Simpan
     */
    Simpan() {

        this.form.dept_nama = this.form.dept_nama.toUpperCase();
        this.form.dept_abbr = this.form.dept_abbr.toUpperCase();

        this.form.date_target_send = moment(this.form.date_target).format('YYYY-MM-DD');

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add.direct';
        }
        // this.form.list = this.List;
        this.form.list = JSON.stringify(this.List);

        console.log(this.form);
        


        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Request Saved',
                        msg: 'Please Verify your input to confirm and continue the process!'
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
                this.Busy = false;

                console.error('Simpan', error);
            }
        );

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
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    /**
                     * Verify Continue
                     */
                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
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

                                this.core.send({
                                    info: 'PR Verified'
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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );
                    // => / END : Verify Continue
                }
            }
        );
    }
    // => / END : Verify

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
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Material Request Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MR Rejected'
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
     * Approve
     */
    Approve() {
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
                        kode: this.form.kode,
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
                                    info: 'PR Approved'
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

}
