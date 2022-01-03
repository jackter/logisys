import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from "providers/core";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';
import Swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-debit-note',
    templateUrl: './form.html',
    styleUrls: ['../debit-note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DebitNoteFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    disabled: boolean = false;

    List: any[] = [{
        i: 0
    }];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DebitNoteFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {


    }


    ngOnInit() {

        this.Company = this.Default.company;

        if (this.Default.day_subs) {
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
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

        }
        //=> / Check Company

        if(this.form.id != 'add'){
            this.List = this.form.list;

            this.ChangeValue();
        }


    }


    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (!this.List) {
                this.List = [{
                    i: 0
                }];
            }
            else {
                let next = Object.keys(this.List).length + 1;
                let DataNext = {
                    id: next
                };
                if (!this.List[next]) {
                    this.List.push(DataNext);
                }
            }

        }, 100);

    }

    DeleteList(del) {

        Swal({
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

    // Totalsisa: number = 0;
    ChangeValue() {
        var TotalAmount: number = 0;
        var AmountINV: number = this.form.amount;
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            for (let item of this.List) {

                if(item.amount > AmountINV){
                    item.amount = AmountINV;
                }

                TotalAmount += Number(item.amount);
            }

            this.form.totalExpAmount = TotalAmount;

            
        }, 100);
    }

    /**
     * Simpan
     */
    Simpan() {

        if (this.form.tanggal) {
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
        }

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.form.list_send = JSON.stringify(this.List);


        console.log(this.form);
        

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

                    this.dialogRef.close(result);

                } else {
                    var Alert = {
                        error_msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);

                    this.Busy = false;
                }

            },
            error => {
                this.Busy = false;
                this.core.OpenNotif(error);
            }
        );

    }
    //=> / END : Simpan


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
                $('*[name="supplier_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {

        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.list = null;

        this.SupplierRemove();
        this.INVCodeRemove();
    }
    //=> / END : AC Company


    /**
     * AC Supplier
     */
    Supplier: any;
    SupplierFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.supplier', Params).subscribe(
                result => {

                    if (result) {
                        this.Supplier = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    SupplierSelect(e, item) {

        if (e.isUserInput) {

            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.supplier_nama;

            setTimeout(() => {
                $('*[name="po_kode"]').focus();
            }, 100);

        }
    }
    SupplierRemove() {
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.inv = null;
        this.form.inv_kode = null;
        this.form.inv_nama = null;
    }
    //=> END : AC Supplier

    /**
     * AC Supplier
     */
    INVCode: any;
    INVCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                supplier: this.form.supplier,
                tanggal: moment(this.form.tanggal).format('YYYY-MM-DD')
            };

            this.core.Do(this.ComUrl + 'list.inv', Params).subscribe(
                result => {

                    if (result) {
                        this.INVCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    INVCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.inv = item.id;
            this.form.inv_kode = item.kode;
            this.form.inv_nama = item.nama;
            this.form.amount = item.amount;
            this.form.amount_def = item.amount;
            this.form.currency = item.currency;

            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.supplier_nama;

            setTimeout(() => {
                $('*[name="po_kode"]').focus();
            }, 100);

        }
    }
    INVCodeRemove() {
        this.form.inv = null;
        this.form.inv_kode = null;
        this.form.inv_nama = null;
        this.form.amount = null;
        this.form.currency = null;

        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;
    }
    //=> END : AC Supplier

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
 
             this.List[i].coa = item.id;
             this.List[i].kode = item.kode;
             this.List[i].nama = item.nama;
 
             this.COA = [];
         }
     }
     removeCoa(item) {
         clearTimeout(this.Delay);
         this.Delay = setTimeout(() => {
             item.coa = null;
             item.kode = null;
             item.nama = null;
         }, 100);
     }
     // => End AC COA

    round(value) {
        return Math.round(value);
    }

}