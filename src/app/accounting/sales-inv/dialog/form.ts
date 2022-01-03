import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MatDialog } from '@angular/material';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-sales-invoice',
    templateUrl: './form.html',
    styleUrls: ['../sales-inv.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SalesInvoiceFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl: any;
    Com: any;
    Busy: any;
    List: any[] = [];

    // minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    Delay: any;
    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<SalesInvoiceFormDialogComponent>,
        private dialog: MatDialog
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

        }
        //=> / Check Company

        if (this.form.id != 'add') {
            if(this.form.ppn == 10 && this.form.inclusive_ppn == 0){
                this.form.dp_amount = ((this.form.sold_price * this.form.qty) / 100 * this.form.dp) * 1.1;
            }
            else{
                this.form.dp_amount = (this.form.sold_price * this.form.qty) / 100 * this.form.dp;
            }
            this.form.list = this.form.accrued;

            var Subtotal: number = 0;
            for (let detail of this.form.list) {
                detail.sold_price = detail.price;
                if(this.form.inclusive_ppn == 1) {
                    detail.price = detail.price / 1.1;
                }

                Subtotal += detail.qty * detail.price;       
            }
            
            this.form.subtotal = Subtotal;
            this.form.tax_base = Subtotal - this.form.dp_amount;
            if(this.form.inclusive_ppn == 1){
                this.form.tax_base = Subtotal - Math.round(this.form.dp_amount / 1.1);
            }
            this.form.ppn_amount = this.form.tax_base * Number(this.form.ppn) / 100;
            this.form.grand_total = this.form.tax_base + this.form.ppn_amount;
        }
    }

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
                $('*[name="cust_nama"]').click();
                $('*[name="cust_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.sc = null;
        this.form.sc_kode = null;
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
        this.form.cust = null;
        this.form.cust_kode = null;
        this.form.cust_nama = null;
        this.form.cust_abbr = null;
        this.form.total = null;
        this.form.list = null;
        this.form.inv_kode = null;
        this.form.inv_tgl = null;
    }
    //=> / END : AC Company

    /**
     * AC Customer
     */
    Customer: any;
    CustomerFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.customer', Params).subscribe(
                result => {

                    if (result) {
                        this.Customer = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    CustomerSelect(e, item) {

        if (e.isUserInput) {

            this.form.cust = item.cust;
            this.form.cust_kode = item.cust_kode;
            this.form.cust_nama = item.cust_nama;
            this.form.cust_abbr = item.cust_abbr;

            setTimeout(() => {
                $('*[name="sc_kode"]').focus();
            }, 100);

        }
    }
    CustomerRemove() {
        this.form.cust = null;
        this.form.cust_kode = null;
        this.form.cust_nama = null;
        this.form.sc = null;
        this.form.sc_kode = null;
        this.form.inv_tgl = null;
    }
    //=> END : AC Customer

    /**
     * AC PO Code
     */
    SCCode: any;
    SCCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                cust: this.form.cust,
                tipe: this.form.other_invoice_type
            };            

            this.core.Do(this.ComUrl + 'list.sc', Params).subscribe(
                result => {

                    if (result) {
                        this.SCCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    SCCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.currency = item.currency;
            this.form.sc_kode = item.kode;
            this.form.sc = item.id;
            this.form.inclusive_ppn = item.inclusive_ppn;
            this.form.ppn = item.ppn;
            this.form.dp = item.dp;
            this.form.sold_price = item.sold_price;
            this.form.qty = item.qty;
            
            if(this.form.inclusive_ppn == 1){
                this.form.dp_amount = Math.round(((this.form.sold_price * this.form.qty) / 1.1) / 100 * this.form.dp);
            }
            else{
                this.form.dp_amount = (this.form.sold_price * this.form.qty) / 100 * this.form.dp;
            }
            
            this.form.list = item.accrued;

            var Subtotal: number = 0;
            for (let detail of this.form.list) {
                detail.sold_price = detail.price;
                if(this.form.inclusive_ppn == 1) {
                    detail.price = detail.price / 1.1;
                }

                Subtotal += detail.qty * detail.price;       
            }
            
            this.form.subtotal = Subtotal;
            this.form.tax_base = Subtotal - this.form.dp_amount;
            this.form.ppn_amount = Math.round(this.form.tax_base * Number(this.form.ppn) / 100);
            this.form.grand_total = this.form.tax_base + this.form.ppn_amount;

            setTimeout(() => {
                $('*[name="inv_tgl"]').focus();
            }, 100);

        }
    }
    SCCodeRemove() {
        this.form.sc_kode = null;
        this.form.sc = null;
        this.form.inclusive_ppn = null;
        this.form.ppn = null;
        this.form.dp_amount = null;
        this.form.list = null;
        this.form.subtotal = null;
        this.form.tax_base = null;
        this.form.ppn_amount = null;
        this.form.grand_total = null;
    }
    //=> END : AC PO Code
    
    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    /**
     * Submit
     */
    Submit() {

        swal({
            title: 'Submit Sales Invoice?',
            html: '<div>Please confirm to Continue Submit?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    this.form.inv_tgl_send = moment(this.form.inv_tgl).format('YYYY-MM-DD');

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

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
                            console.error("Submit", error);
                        }
                    );

                }

            }
        );

    }
    //=> / END : Submit

    rupiah(val) {
        return this.core.rupiah(val);
    }

}