import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MR2PrintDialogComponent } from './print';
import { MR2RejectFormDialogComponent } from './reject';
import { CompanyComponent } from '../../../_shared/ac/company/company.component';

@Component({
    selector: 'dialog-form-location',
    templateUrl: './form.html'
})
export class MR2FormDialogComponent implements AfterViewInit {

    @ViewChild(CompanyComponent, { static: false }) SHCompany;
    testaja;

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
        public dialogRef: MatDialogRef<MR2FormDialogComponent>
    ) { }

    ngAfterViewInit() {

        if(this.Default.company) {
            this.Company = this.Default.company;
        }

        if(this.Default.params.alokasi_coa.value) {
            this.Alokasi = this.Default.params.alokasi_coa.value;        
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

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;
            }

            // if (this.form.date_target) {
            //     this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD');
            // }

            this.DeptReady = true;

            // if(this.form.ref_type == 3) {
            //     this.RefFilter('');
            // }

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

    // CompanyFilter() {

    //     var val = this.form.company_nama;

    //     if (val != this.CompanyLast) {
    //         this.form.company = null;
    //         this.form.company_abbr = null;

    //         this.form.dept = null;
    //         this.form.dept_abbr = null;
    //         this.form.dept_nama = null;
    //     }

    //     if (val) {

    //         val = val.toString().toLowerCase();

    //         let i = 0;
    //         let Filtered = [];
    //         for (let item of this.Default.company) {

    //             var Combine = item.nama + ' (' + item.abbr + ')';
    //             if (
    //                 item.abbr.toLowerCase().indexOf(val) != -1 ||
    //                 item.nama.toLowerCase().indexOf(val) != -1 ||
    //                 Combine.toLowerCase().indexOf(val) != -1
    //             ) {
    //                 Filtered[i] = item;
    //                 i++;
    //             }

    //         }
    //         this.Company = Filtered;

    //     } else {
    //         this.Company = this.Default.company;
    //     }

    // }

    // CompanySelect(e, item) {
    CompanySelect(item){

        this.form.company = item.id;
        this.form.company_nama = item.nama;
        this.form.company_abbr = item.abbr;

        this.CompanyLast = item.nama;

        this.Dept = item.dept;
        this.DeptKeep = item.dept;

        setTimeout(() => {
            $('*[name="dept_nama"]').focus();
        }, 100);

        // if (e.isUserInput) {
        //     this.form.company = item.id;
        //     this.form.company_nama = item.nama;
        //     this.form.company_abbr = item.abbr;

        //     this.CompanyLast = item.nama;

        //     this.Dept = item.dept;
        //     this.DeptKeep = item.dept;

        //     setTimeout(() => {
        //         $('*[name="dept_nama"]').focus();
        //     }, 100);
        // }
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

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            // if(Object.keys(this.Dept).length <= 0){
            if (_.size(this.Dept) <= 0) {
                if (val) {

                    if (this.perm.add_dept) {

                        swal({
                            title: 'Create new Department?',
                            html: '<div>No Department Found, do you want to create new Department/Plant?</div>',
                            type: 'warning',
                            reverseButtons: true,
                            focusCancel: true,
                            showCancelButton: true,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'Cancel'
                        }).then(
                            result => {

                                if (result.value) {
                                    this.form.dept_abbr = null;
                                    this.DeptReady = true;

                                    setTimeout(() => {
                                        $('*[name="dept_abbr"]').focus();
                                    }, 500);
                                }

                            }
                        );

                    } else {

                        var Alert = {
                            title: 'Dept/Plant Not Found',
                            msg: 'You dont have permissions to Create New Department, Please Call System Administrator to help you!'
                        };

                        this.core.OpenAlert(Alert);

                    }

                }
            }
        }, 1500);

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
                // $('*[name="cost_nama"]').focus();
                $('*[name="ref_type"]').focus();
            }, 100);
        }
    }
    // => / END : AC Dept

    /**
     * Ref. Kode
     */
    Ref: any;
    RefFilter(val) {

        this.Ref = [];

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            var table;
            if(this.form.ref_type == 2) {
                table = 'wo';
            } else 
            if(this.form.ref_type == 3) {
                table = 'jo';
            } else 
            if(this.form.ref_type == 4) {
                table = 'ast';
            } 
    
            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                dept: this.form.dept,
                table: table
            };
    
            this.core.Do(this.ComUrl + 'list.ref', Params).subscribe(
                result => {
    
                    if (result.ref) {
                        this.Ref = result.ref;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 250);
    }

    RefSelect(e, item) {
        if (e.isUserInput) {
            this.form.ref = item.id;
            this.form.ref_kode = item.kode;

            /**
             * Selain WBS
             */
            if(this.form.ref_type != 4) {
                this.form.dept = item.dept;
                this.form.dept_abbr = item.dept_abbr;
                this.form.dept_nama = item.dept_nama;
            }

            /**
             * JO
             */
            if(this.form.ref_type == 3) {
                this.List = item.list;
            }

            setTimeout(() => {
                $('*[name="note"]').focus();
            }, 100);
        }
    }

    RefRemove() {
        this.form.ref        = null;
        this.form.ref_kode   = null;

        this.List = [{
            i : 0
        }];
    }
    //=> END : Ref. Kode

    RefreshList () {

        this.List = [{
            i : 0
        }];

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

            var i = 0;
            for (let item of this.List) {

                if (i < this.List.length - 1) {
                    item.cost_center = this.form.cost;
                    item.cost_center_kode = this.form.cost_kode;
                    item.cost_center_nama = this.form.cost_nama;
                }

                i++;

            }

            setTimeout(() => {
                $('*[name="ref_type"]').focus();
            }, 100);

        }
    }
    removeCostCenter(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            item.cost_center = 0;
            item.cost_center_kode = null;
            item.cost_center_nama = null;
        }, 100);
    }
    // => End : Cost Center

    /**
     * AC Cost center
     */
    CostD: any;
    WaitCostD: any[] = [];

    CostFilterD(val: string, i: number) {

        this.List[i].cost_center = null;
        this.List[i].cost_center_kode = null;

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
                        this.CostD = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);
    }

    CostSelectD(e, item, i: number) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.List[i].cost_center = item.id;
                this.List[i].cost_center_kode = item.kode;
                this.List[i].cost_center_nama = item.nama;

                setTimeout(() => {
                    this.WaitCostD[i] = false;

                    $('#coa_alokasi_nama-' + i).focus();
                }, 250);

            }, 0);

        }
    }
    // => End : Cost Center

    /**
     * AC Item
     */
    Item: any = [];
    WaitItem: any[] = [];

    ItemFilter(val: string, i: number) {

        this.Item = [];

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
                            if(this.form.ref_type == 1) {
                                this.Item = _.filter(result, {
                                    item_type : 2,
                                    sub_item_type : this.form.sub_ref_type
                                });
                            } else {
                                this.Item = result;
                            }
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

                this.List[i].cost_center = this.form.cost;
                this.List[i].cost_center_kode = this.form.cost_kode;
                this.List[i].cost_center_nama = this.form.cost_nama;

            }, 0);

        }

    }
    // => / END : AC Item

    /**
     * AC COA Alokasi
     */

    Alokasi: any = [];
    COAAlokasiFilter(val: string, i: number) {

        if(val){
            
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            
            for (let item of this.Default.params.alokasi_coa.value) {

                var Combine = item.nama + ' (' + item.kode + ')';

                if (Combine.toLowerCase().indexOf(val) != -1){
                    Filtered[i] = item;
                    i++;                 
                }

            }
            this.Alokasi = Filtered;
            this.WaitItem[i] = false;
        } else {
            this.Alokasi = this.Default.params.alokasi_coa.value;
        }

    }
    COAAlokasiSelect(e, item, i) {

        if (e.isUserInput) {

            this.List[i].coa_alokasi = item.id;
            this.List[i].coa_alokasi_nama = item.nama;            

            setTimeout(() => {
                this.Alokasi = this.Default.params.alokasi_coa.value;
            }, 100);
        }

    }
    RemoveCoaAlokasi(i) {
        this.List[i].coa_alokasi = null;
        this.List[i].coa_alokasi_nama = null;

        this.List[i].coa = null;
        this.List[i].coa_kode = null;
        this.List[i].coa_nama = null;

        setTimeout(() => {
            this.COA = [];
        }, 250);
    }

    // => / END : AC COA Alokasi

    /**
     * AC COA
     */
    COA: any;
    COAFilter(val: string, alokasi: string, i: number) {

        this.COA = [];
        
        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    alokasi: alokasi,
                    keyword: val
                };               

                this.core.Do(this.ComUrl + 'coa.list', Params).subscribe(
                    result => {

                        if (result) {
                            this.COA = result;
                        }

                        this.WaitItem[i] = false;
                    },
                    error => {
                        console.error('Coa Filter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }

                );

            }, 100);

        }

    }
    COASelect(e, item, i: number) {

        if (e.isUserInput) {

            this.List[i].coa = item.id;
            this.List[i].coa_kode = item.kode;
            this.List[i].coa_nama = item.nama;            

            setTimeout(() => {
                this.COA = [];
            }, 250);
   
        }
    }
    RemoveCoa(i) {
        this.List[i].coa = null;
        this.List[i].coa_kode = null;
        this.List[i].coa_nama = null;

        setTimeout(() => {
            this.COA = [];
        }, 250);
    }
    // => End AC COA

    /**
     * AC Job Alocation
     */
    JobAlocation: any = [];
    FilterJobAlocation(val: string, i: number) {
        this.JobAlocation = [];
        
        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };               

                this.core.Do(this.ComUrl + 'list.job', Params).subscribe(
                    result => {

                        if (result.job_alocation) {
                            this.JobAlocation = result.job_alocation;
                        }

                        this.WaitItem[i] = false;
                    },
                    error => {
                        console.error('Coa Filter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }

                );

            }, 100);

        }

    }

    SelectJobAlocation(e, item, i: number) {
        if (e.isUserInput) {

            this.List[i].job_alocation = item.id;
            this.List[i].job_alocation_nama = item.nama;
            this.List[i].coa = item.coa;
            this.List[i].coa_kode = item.coa_kode;
            this.List[i].coa_nama = item.coa_nama;            

            setTimeout(() => {
                this.JobAlocation = [];
            }, 250);
   
        }
    }

    RemoveJobAlocation(i) {
        this.List[i].job_alocation = null
        this.List[i].job_alocation_nama = null;
        this.List[i].coa = null;
        this.List[i].coa_kode = null;
        this.List[i].coa_nama = null;
        setTimeout(() => {
            this.JobAlocation = [];
        }, 250);
    }
    //=> END : AC Job Alocation

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
     * Print MR
     */
    dialogPrint: MatDialogRef<MR2PrintDialogComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {

        this.dialogPrint = this.dialog.open(
            MR2PrintDialogComponent,
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

    /**
     * Reject MR
     */
    dialogReject: MatDialogRef<MR2RejectFormDialogComponent>;
    dialogRejectConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowRejectDialog() {

        this.dialogReject = this.dialog.open(
            MR2RejectFormDialogComponent,
            this.dialogRejectConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogReject.componentInstance.ComUrl = this.ComUrl;
        this.dialogReject.componentInstance.Default = this.Default;
        this.dialogReject.componentInstance.perm = this.perm;
        this.dialogReject.componentInstance.form = this.form;
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
    // => / END : Reject MR

    /**
     * Simpan
     */
    Simpan() {

        this.form.dept_nama = this.form.dept_nama.toUpperCase();
        this.form.dept_abbr = this.form.dept_abbr.toUpperCase();

        this.form.date_target_send = moment(this.form.date_target).format('YYYY-MM-DD');

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        // this.form.list = "NE---" + JSON.stringify(this.List);
        this.form.list = JSON.stringify(this.List);
        
        var checkCost = 1;
        for (let item of this.List) {
            if (item.id && !item.cost_center) {
                checkCost = 0;
                this.core.OpenAlert({
                    title: 'Item ' + item.nama + ' Cost Center Code is not defined',
                    msg: '<div>To create MR, please complete the <strong>Cost Center</strong> according to cost center list which is displayed by system.</div>',
                    width: 500
                });
            }
        }

        if (checkCost == 1) {
            this.Busy = true;
            this.core.Do(URL, this.form).subscribe(
                result => {

                    if (result.status == 1) {

                        this.core.Sharing('reload', 'reload');

                        if(this.form.id == 'add') {
                            var Success = {
                                type: 'success',
                                showConfirmButton: false,
                                title: 'Saved Successfully',
                                msg: 'Please Verify your input to confirm and continue the process!'
                            };
                            this.core.OpenAlert(Success);
                        } else {
                            var Update = {
                                type: 'success',
                                showConfirmButton: false,
                                title: 'Updated Successfully',
                                msg: 'Please Verify your input to confirm and continue the process!'
                            };
                            this.core.OpenAlert(Update);
                        }

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
                     * Check COA
                     */
                    // var CheckIDList = [];
                    // for(let item of this.form.list){
                    //     CheckIDList.push({
                    //         id: item.id,
                    //         kode: item.kode,
                    //         nama: item.nama
                    //     });
                    // }

                    // var ParamsCheck: any = {
                    //     company: this.form.company,
                    //     list: JSON.stringify(CheckIDList),
                    //     NoLoader: 1
                    // }
                    // this.core.Do('e/stock/item/check.coa', ParamsCheck).subscribe(
                    //     result => {

                    //         if(result.status != 1){

                    //             /**
                    //              * Create MSG
                    //              */
                    //             var MSG = '';
                    //             if(result.items){
                    //                 MSG = `
                    //                 <div style="text-align: left!important">
                    //                     <div>To verify transaction ref. <strong>${this.form.kode}</strong></div>
                    //                     <div>Please call Accounting Dept to complete COA for the following items:</div>
                    //                     <ol>
                    //                 `;
                    //                 for(let item of result.items){
                    //                     MSG += `
                    //                         <li>
                    //                             <strong>${item.kode}</strong> : ${item.nama}
                    //                         </li>
                    //                     `;
                    //                 }
                    //                 MSG += `
                    //                     </ol>
                    //                 </div>
                    //                 `;
                    //             }
                    //             //=> / END : Create MSG

                    //             this.core.OpenAlert({
                    //                 title: 'Item COA Not Available',
                    //                 msg: MSG,
                    //                 width: 600
                    //             });
                    //         }else{

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
                                    info: 'MR Verified'
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

                    //         }

                    //     },
                    //     error => {
                    //         console.error('Check COA', error);
                    //         this.core.OpenNotif(error);

                    //         this.Busy=false;
                    //     }
                    // );
                    // => / END : Check COA

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
                                    info: 'MR Approved'
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
     * Validated
     */
    Validated() {
        swal({
            title: 'Please Confirm to Validated?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Validated',
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
                    this.core.Do(this.ComUrl + 'validated', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Validated',
                                    msg: 'Validated Success!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MR Validated'
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
                            console.error('Validated', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => / END : Validated

}
