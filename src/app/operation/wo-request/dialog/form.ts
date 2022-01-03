import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as _ from 'lodash';
import { WorkOrderPrintDialogComponent } from 'app/operation/work-order/dialog/print';

@Component({
    selector: 'dialog-form-work-order-req',
    templateUrl: './form.html',
    styleUrls: ['../wo-request.component.scss']
})
export class WORequestFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    Maintenance: any = {};
    DeptSection: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    PIC: any = [];

    JobTitle: any[] = [{
        i: 0
    }];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<WORequestFormDialogComponent>,
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;

        if (this.Default.maintenance) {
            this.Maintenance = this.Default.maintenance.value;
        }

        if (this.form.id != 'add') {

            if(this.form.job_title) {
                this.JobTitle = JSON.parse(this.form.job_title);

                console.log(this.JobTitle);
                
             
                if(this.form.job_title) {
                    this.JobTitle = JSON.parse(this.form.job_title);
                 
                    if(!this.form.is_detail) {
                        if(this.form.approved != 1) {
                            this.JobTitle.push({i: 0});
                        }
                    }
                }
            }

        }

        if (this.Default.dept_section) {
            this.DeptSection = _.orderBy(this.Default.dept_section.value, 'nama', ['asc']);
        }
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
    }

    AutoFocus(key){

        setTimeout(() => {
            $(key).focus();
        }, 100);

    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        setTimeout(() => {

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

        }, 0);

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
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
    }
    // => / END : AC Company

    /**
     * AC Dept
     */
    Dept: any = [];
    DeptKeep: any = [];
    DeptLast;
    DeptReady = false;
    DeptLen: number;

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

        } else {

        }

    }

    DeptSelect(e, item) {
        if (e.isUserInput) {
            this.form.dept = item.id;
            this.form.dept_nama = item.nama;
            this.form.dept_abbr = item.abbr;

            this.DeptLast = item.nama;

            setTimeout(() => {
                $('*[name="dept_section_nama"]').focus();
            }, 100);

        }
    }
    DeptRemove() {
        this.form.dept = null;
        this.form.dept_nama = null;
        this.form.dept_abbr = null;

        this.DeptFilter();
    }
    // END: AC Dept

    SelectDeptSection(item) {

        this.form.dept_section_abbr = item.kode;
        
    }

    /**
     * AC Equipment
     */
    Equipment = [];
    FilterEquipment(val: string) {
        
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.equipment', Params).subscribe(
                result => {
                    if (result.list_equipment) {
                        this.Equipment = result.list_equipment;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    SelectEquipment(e, item) {
        if(e.isUserInput) {
            this.form.equipment = item.id;
            this.form.equipment_kode = item.kode;
            this.form.equipment_remarks = item.remarks;
        }
    }

    RemoveEquipment() {
        this.form.equipment = null;
        this.form.equipment_kode = null;
        this.form.equipment_remarks = null;
    }
    // => END : AC Equipment

      /**
     * AC lokasi
     */
    Lokasi = [];
    FilterLokasi(val: string) {
        
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.lokasi', Params).subscribe(
                result => {
                    if (result.list_lokasi) {
                        this.Lokasi = result.list_lokasi;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    SelectLokasi(e, item) {
        if(e.isUserInput) {
            this.form.lokasi = item.id;
            this.form.lokasi_nama = item.nama;
        }
    }

    RemoveLokasi() {
        this.form.lokasi = null;
        this.form.lokasi_nama = null;
    }
    // => END : AC Lokasi

    /**
     * Create List
     */
    CreateList(i, type: number) {

        if (type == 3) {
            if (!this.JobTitle[i].job_title) {
                this.JobTitle[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.JobTitle[next]) {
                this.JobTitle.push(DataNext);
            }
        }
    }
    // => / END : List
    
    /**
     * Simpan
     */
    Simpan() {

        swal(
            {
                title: 'Please Confirm to Save?',
                html: '<div>Are you sure to continue?',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    if(this.perm.submit && this.form.approved == 1 && this.form.submited != 1) {
                        this.form.submited = 1;
                    }

                    if(this.form.approved == 1) {
                        this.form.create_kode = 1;
                    }
                    
                    if (this.form.order_date) {
                        this.form.order_date_show = moment(this.form.order_date).format('YYYY-MM-DD');
                    }

                    if (this.form.est_date) {
                        this.form.est_date_show = moment(this.form.est_date).format('YYYY-MM-DD');
                    }

                    var JobTitle = [];
                    for(let item of this.JobTitle) {
                        if(item.job_title) {
                            JobTitle.push(item);
                        }
                    }
                    this.form.job_title = JSON.stringify(JobTitle);

                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                if(this.form.id == 'add' && this.form.approved != 1) {
                                    var ADD = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Saved Successfully',
                                        msg: 'Your Request will Continue to Approval Process'
                                    };
                                    this.core.OpenAlert(ADD);
                                }

                                this.dialogRef.close(result);
                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }
                        },
                        error => {
                            this.core.OpenNotif(error);
                        }
                    );
                }
            }
        );
    }
    // => / END : Simpan

    /**
     * Edit
     */
    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }
    // => END : Edit

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
                        notimeout: 1,
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
                        id: this.form.id
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Approved Rejected'
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
    // => / END : Reject

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
                        notimeout: 1,
                        lvl: lvl
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
     * Dialog
    */
   dialogDetail: MatDialogRef<WorkOrderPrintDialogComponent>;
   dialogDetailConfig: MatDialogConfig = {
       disableClose: false,
       panelClass: 'event-form-dialog'
   };
   Print() {

       this.dialogDetail = this.dialog.open(
           WorkOrderPrintDialogComponent,
           this.dialogDetailConfig
       );

       this.dialogDetail.componentInstance.form = this.form;
       this.dialogDetail.componentInstance.Com = this.Com;

       /**
        * After Close
        */
       this.dialogDetail.afterClosed().subscribe(result => {

           this.dialogDetail = null;

       });

   }
   // => / END : Dialog

}
