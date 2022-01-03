import { Component, OnInit } from "@angular/core";
import { Core } from "providers/core";
import { MatDialogRef, MatDialog } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-Poting',
    templateUrl: './form.html'
})
export class JournalFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    List: any[] = [{
        i: 0
    }];

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate;
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();


    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<JournalFormDialogComponent>
    ) {

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
        //=> / Check Company

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            this.List = this.form.list;

            if (this.form.tanggal) {
                this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD');
            }

        }
        //=> / END : Form Edit

    }
    ChangeValue() {
        var Credit: number = 0;
        var Debit: number = 0;
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            for (let item of this.List) {
                if (item.debit) {
                    Debit += item.debit;
                }
                if (item.credit) {
                    Credit += item.credit;
                }
            }

            this.form.debitTotal = Debit;
            this.form.creditTotal = Credit;

        }, 100);
    }

    /**
    * FocusCompany
    */
    FocusCompany() {
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 100);
    }
    //=> / END : FocusCompany

    /**
    * Focus To
    */
    FocusTo(target) {
        console.log(target);
        setTimeout(() => {
            $(target).focus();
        }, 100);
    }
    //=> / END : Focus To

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    /**
    * AC COA
    */
    COA: any;
    WaitItem: any[] = [];
    async COAFilter(val: string, i: number) {

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

            var Find = this.core.FJSON(this.List, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {
                    this.List[i] = item;
                    this.List[i]['i'] = i;

                    this.COA = [];

                    this.CreateList(i);

                    if(this.form.ref_type == 1){
                        setTimeout(() => {
                            $('#ref_cip_kode-' + i).focus();
                        }, 100);
                    }
                    else{
                        setTimeout(() => {
                            $('#debit-' + i).focus();
                        }, 100);
                    }
                } else {
                    var SelectExists = Find[0].i;

                    this.List[i].nama = '';

                    if(this.form.ref_type == 1){
                        setTimeout(() => {
                            $('#ref_cip_kode-' + i).focus();
                        }, 100);
                    }
                    else{
                        setTimeout(() => {
                            this.WaitItem[i] = false;
                            $('#credit-' + SelectExists).focus();
                        }, 250);
                    }
                }

            }, 0);

        }

    }
    // => End AC COA

    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            //=> Check List
            if (!this.List[i].kode) {
                this.List[i] = {};
            }

            //=> Check Next Input
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

                    //=> Delete
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

                    //=> Recreaten
                    this.List = NewList;

                    this.ChangeValue();
                }

            }
        );

    }
    //=> / END : List

    /**
     * Veriry
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
                        kode: this.form.kode,
                        company: this.form.company,
                        tanggal: moment(this.form.tanggal).format('YYYY-MM-DD'),
                        ref_type: this.form.ref_type,
                        list: JSON.stringify(this.form.list)
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "Invoice Verified"
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

                }

            }
        );
    }
    //=> End : Verify

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

            setTimeout(() => {
                $('*[name="ref_type"]').focus();
            }, 100);
        }
    }
    //=> / END : AC Company

    /**
    * AC CIPCode
    */
   CIP: any;
   CIPFilter(val: string) {

       clearTimeout(this.Delay);
       this.Delay = setTimeout(() => {

           var Params = {
               NoLoader: 1,
               keyword: val,
               company: this.form.company
           };

           this.core.Do(this.ComUrl + 'list.cip', Params).subscribe(
               result => {

                   if (result) {
                       this.CIP = result;
                   }

               },
               error => {
                   this.core.OpenNotif(error);
               }
           );
       });
   }
   CIPSelect(e, item, i) {

       if (e.isUserInput) {

           this.List[i].ref_cip = item.id;
           this.List[i].ref_cip_kode = item.kode;

           setTimeout(() => {
               $('*[name="ref_tgl"]').focus();
           }, 100);

       }

   }
   //=> / END : AC CIPCode


    /**
     * Simpan
     */
    Simpan() {

        if (this.form.debitTotal != this.form.creditTotal) {
            this.core.OpenAlert({
                title: 'Debit/Credit Not Balace',
                msg: '<div>Debit Total is not balance with Credit Total.</div>',
                width: 400
            });
        }
        else {
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

            var URL = this.ComUrl + 'edit';
            if (this.form.id == 'add') {
                URL = this.ComUrl + 'add';
            }

            this.form.list = JSON.stringify(this.List);        

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

    }
    //=> / END : Simpan



}