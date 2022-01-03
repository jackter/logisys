import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog, MatChipInputEvent } from '@angular/material';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { PRFormDialogComponent } from '../../pr/dialog/form';
import { GIFormDialogComponent } from '../../gi/dialog/form';
import { PMRFormDialogComponent } from './form';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'dialog-form-location',
    templateUrl: './formmulti.html'
})
export class PRMultiMRFormDialogComponent implements OnInit {

    List: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};
    DelayAutocomplete;

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate;

    ReceiptState;
    MRComUrl: string;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PMRFormDialogComponent>
    ) {
        this.minDate = moment(new Date()).format('DD/MM/YYYY');
    }

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
        }
        // => / Check Company

        // this.form.kode = 'MR/CBU-ACC/19/VI/0001';
        // this.form.company = 3;
        // this.form.company_abbr = 'CBU';
        // this.form.company_nama = 'PT Citra Borneo Utama';

        // this.form.dept = 58;
        // this.form.dept_abbr = 'ACC';
        // this.form.dept_nama = 'ACCOUNTING';

        // this.form.note = '-';

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

            this.DeptReady = true;

        }
        // => / END : Form Edit

    }

    CompanySelected = [];
    removable = true;
    selectable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    Company;
    LastCompany;
    CompanyFilter(val: string) {

        if (val) {
            this.Company = this._filterCompany(this.Default.company, val);
        } else {
            this.Company = this.Default.company;
        }

        /*if(val != this.LastCompany){

            //=> Clear If Company Change
            this.form.company = null;
            this.form.company_abbr = null;

        }

        if(val){

            //this.LastCompany = val;
            this.Company = this._filterCompany(this.Default.company, val);
            
        }else{
            this.Company = this.Default.company;
        }*/

    }
    private _filterCompany(Data, val: string) {
        const filterValue = val.toLowerCase();
        if (Data) {
            return Data.filter(
                item => item.nama.toLowerCase().indexOf(val) > -1 || item.abbr.toLowerCase().indexOf(val) > -1
            );
        }
    }
    private CompanySelect(event, e) {
        if (event.isUserInput) {
            clearTimeout(this.DelayAutocomplete);
            this.DelayAutocomplete = setTimeout(() => {

                var Exists = this.core.FJSON2(this.CompanySelected, 'id', e.id);
                if (Exists.length <= 0) {

                    this.CompanySelected.push({
                        id: e.id,
                        nama: e.nama,
                        abbr: e.abbr
                    });

                }

                $('*[name="company_nama"]').val('');

                /*var Semua = this.core.FJSON2(this.CompanySelected, 'id', 'X');
                    
                if(Exists.length <= 0 && Semua.length <= 0){

                    var ID = e.id;
                    if(ID == 0){
                        ID = 'X';
                    }

                    if(ID == 'X'){
                        this.CompanySelected = [];
                    }

                    this.CompanySelected.push({
                        id: ID,
                        nama: e.nama,
                        abbr: e.abbr
                    });

                }
                $('*[name="company_nama"]').val('');*/

            }, 100);
        }
    }

    add(event: MatChipInputEvent): void {

        $('*[name="company_nama"]').val('');
        this.CompanyFilter('');

    }

    remove(company: string): void {
        const index = this.CompanySelected.indexOf(company);

        if (index >= 0) {
            this.CompanySelected.splice(index, 1);
        }
    }
    // => / END : Autocomplete Company

    /**
     * AC Company
     */
    // Company: any = [];
    CompanyLen: number;
    // CompanyLast;
    // CompanyFilter(){

    //     var val = this.form.company_nama;

    //     if(val != this.CompanyLast){
    //         this.form.company = null;
    //         this.form.company_abbr = null;

    //         this.form.dept = null;
    //         this.form.dept_abbr = null;
    //         this.form.dept_nama = null;
    //     }

    //     if(val){

    //         val = val.toString().toLowerCase();

    //         let i = 0;
    //         let Filtered = [];
    //         for(let item of this.Default.company){

    //             var Combine = item.nama + ' (' + item.abbr + ')';
    //             if(
    //                 item.abbr.toLowerCase().indexOf(val) != -1 ||
    //                 item.nama.toLowerCase().indexOf(val) != -1 || 
    //                 Combine.toLowerCase().indexOf(val) != -1
    //             ){
    //                 Filtered[i] = item;
    //                 i++;
    //             }

    //         }
    //         this.Company = Filtered;

    //     }else{
    //         this.Company = this.Default.company;
    //     }

    // }
    // CompanySelect(e, item){
    //     if(e.isUserInput){
    //         this.form.company = item.id;
    //         this.form.company_nama = item.nama;
    //         this.form.company_abbr = item.abbr;

    //         this.CompanyLast = item.nama;

    //         this.Dept = item.dept;
    //         this.DeptKeep = item.dept;

    //         setTimeout(() => {
    //             $('*[name="dept_nama"]').focus();
    //         }, 100);
    //     }
    // }
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

        if (val) {

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
            var Len = Object.keys(this.Dept).length;

            if (Len <= 0) {
                if (val) {
                    this.form.dept_abbr = null;
                    this.DeptReady = true;

                    setTimeout(() => {
                        $('*[name="dept_abbr"]').focus();
                    }, 100);
                }
            }
        }, 1000);

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
     * Receipt State
     */
    ChangeReceiptState() {
        this.ReceiptState = 1;

        setTimeout(() => {
            $('#qty_approved-0').focus();
        }, 100);
    }
    // => / END : Receipt State

    /**
     * CheckQty
     */
    CheckQty(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            let Qty = this.List[i].qty;
            let Stock = this.List[i].stock;
            let Approved = this.List[i].qty_approved;

            // console.log(Qty, Stock, Approved);

            let QtyApproved = Approved;

            /*if(Number(Approved) > Number(Stock)){
                QtyApproved = Stock;
            }*/
            if (Number(QtyApproved) > Number(Qty)) {
                QtyApproved = Qty;
            }

            if (QtyApproved > 0) {
                this.List[i].qty_approved = QtyApproved;
            }

        }, 100);

    }
    // => / END : CheckQty

    /**
     * ResetQty
     */
    ResetQty() {
        this.ReceiptState = null;
        for (let item of this.List) {
            item.qty_approved = null;
        }
    }
    // => / END : ResetQty

    /**
     * Simpan
     */
    Simpan() {

        swal({
            title: 'Please Confirm to SUBMIT?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var URL;
                    if (this.ReceiptState) {
                        URL = this.ComUrl + 'submit';
                    }

                    this.form.date_target = moment(this.form.date_target, 'DD/MM/YYYY').format('YYYY-MM-DD');

                    this.form.list = JSON.stringify(this.List);

                    this.Busy = true;
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                this.core.Sharing('reload', 'reload');

                                result.reopen = 1;
                                this.dialogRef.close(result);

                                this.core.send({
                                    info: 'MR (Submit) Processed to GI/PR'
                                });

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

                    this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');

                }

            }
        );

    }
    // => / END : Simpan

    /**
     * GI Dialog
     */
    dialogGI: MatDialogRef<GIFormDialogComponent>;
    dialogGIConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowGIDialog() {

        var Params = {
            id: this.form.id,
            is_detail: this.form.is_detail,
            // is_process: true,
            is_gi: true
        };

        this.core.Do('e/snd/mr/get', Params).subscribe(
            result => {

                if (result) {

                    this.dialogGI = this.dialog.open(
                        GIFormDialogComponent,
                        this.dialogGIConfig
                    );

                    result.data.is_gi = 1;

                    /**
                     * Inject Data to Dialog
                     */
                    this.dialogGI.componentInstance.ComUrl = 'e/snd/gi/';
                    this.dialogGI.componentInstance.Default = this.Default;
                    this.dialogGI.componentInstance.Com = {
                        name: 'Goods Issued',
                        title: 'Material Request to be Issued',
                        icon: 'local_shipping',
                    };
                    this.dialogGI.componentInstance.perm = this.perm;
                    this.dialogGI.componentInstance.form = result.data;
                    // => / END : Inject Data to Dialog

                    /**
                     * After Dialog Close
                     */
                    this.dialogGI.afterClosed().subscribe(result => {

                        this.dialogGI = null;

                        var Reload = 0;

                        this.core.GetSharing('reload').subscribe(
                            result => {
                                if (result) {
                                    Reload = 1;
                                }
                            }
                        );

                        if (result || Reload == 1) {
                            this.form.is_process = 1;
                            this.core.Do(this.MRComUrl + 'get', this.form).subscribe(
                                result => {

                                    if (result) {
                                        this.form = result.data;

                                        this.form.is_detail = true;

                                        // => Update List
                                        if (Object.keys(this.form.list).length > 0) {
                                            this.List = this.form.list;
                                        }
                                    }

                                },
                                error => {
                                    console.error('GetForm', error);
                                    this.core.OpenNotif(error);
                                }
                            );
                        }

                    });
                    // => / END : After Dialog Close

                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : GI Dialog

    /**
     * PR Dialog
     */
    dialogPR: MatDialogRef<PRFormDialogComponent>;
    dialogPRConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPRDialog() {

        if (this.perm.pr) {

            this.dialogPR = this.dialog.open(
                PRFormDialogComponent,
                this.dialogPRConfig
            );

            /**
             * Inject Data to Dialog
             */
            this.dialogPR.componentInstance.ComUrl = 'e/snd/pr/';
            this.dialogPR.componentInstance.Default = this.Default;
            this.dialogPR.componentInstance.Com = {
                name: 'Purchase Request',
                title: 'Create Purchase Request'
            };
            this.dialogPR.componentInstance.perm = this.perm;
            this.dialogPR.componentInstance.form = this.form;
            // => / END : Inject Data to Dialog

            /**
             * After dialog close
             */
            this.dialogPR.afterClosed().subscribe(result => {

                this.dialogPR = null;

                if (result) {

                }

            });
            // => / END : After dialog close

        }
    }
    // => / END : PR Dialog

}
