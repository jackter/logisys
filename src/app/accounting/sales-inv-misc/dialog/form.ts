import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-sales-inv-misc',
    templateUrl: './form.html',
    styleUrls: ['../sales-inv-misc.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SalesMiscDialogFormComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl: any;
    Com: any;
    Busy: any;

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    Delay: any;

    List: any[] = [{
        i: 0
    }];

    Term: any = [];

    Currency: any;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<SalesMiscDialogFormComponent>,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Currency = this.Default.currency;

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
            this.List = this.form.list;            

            if(this.Default.sales_invoice) {
                var Find = _.find(this.Default.sales_invoice, {
                    company: this.form.company
                });            
                
                this.Term = Find.term;
            }
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

            this.InitCompanyBankFilter();

            if(this.Default.sales_invoice) {
                var Find = _.find(this.Default.sales_invoice, {
                    company: this.form.company
                });            
                
                this.Term = Find.term;
            }
            
            setTimeout(() => {
                $('*[name="other_invoice_type"]').click();
                $('*[name="other_invoice_type"]').focus();
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

    InitCompanyBankFilter() {
        let i = 0;
        let Filtered = [];
        for (let item of this.Default.bank) {

            if (this.form.company == item.company) {
                Filtered[i] = item;
                i++;
            }

        }
        this.Bank = Filtered;
    }

    /**
     * Bank
     */
    Bank: any = [];
    BankLast;
    BankFilter() {

        var val = this.form.company_bank_nama;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.bank) {

                if (item) {
                    var Combine = item.nama_bank + ' (' + item.no_rekening + ')';
                    if (
                        (item.nama_bank.toString().toLowerCase().indexOf(val) != -1 ||
                            item.no_rekening.toString().toLowerCase().indexOf(val) != -1 ||
                            Combine.toString().toLowerCase().indexOf(val) != -1) &&
                        (item.company == this.form.company)
                    ) {
                        Filtered[i] = item;
                        i++;
                    }
                }

            }
            this.Bank = Filtered;

        } else {
            this.InitCompanyBankFilter();
        }

    }
    BankSelect(e, item) {
        if (e.isUserInput) {
            this.form.company_bank_id = item.id;
            this.form.company_bank = item.nama_rekening;
            this.form.company_bank_nama = item.nama_bank;
            this.form.company_rek = item.no_rekening;

            console.log(item);
            
            console.log(this.form);
            

            this.BankLast = item.nama_rekening;

            setTimeout(() => {
                $('#item_nama').focus();
            }, 100);
        }
    }
    BankRemove() {

        this.form.company_bank_id = null;
        this.form.company_bank = null;
        this.form.company_bank_nama = null;
        this.form.company_rek = null;

        this.Bank = this.Default.bank;

        setTimeout(() => {
            $('#company_bank_nama').blur();
            setTimeout(() => {
                $('#company_bank_nama').focus();
            }, 100);
            // this.CompanyFilter();
        }, 100);
    }
    // => End Bank

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
        },100);
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
     * AC COA
     */
    COA: any;
    COAFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.coa', Params).subscribe(
                result => {

                    if (result.coa) {
                        this.COA = result.coa;
                    }
                },
                error => {
                    console.error('Coa Filter', error);
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    COASelect(e, item, i: number) {

        if (e.isUserInput) {
            setTimeout(() => {
                this.List[i].coa = item.id;
                this.List[i].coa_kode = item.kode;
                this.List[i].coa_nama = item.nama;

                this.COA = [];

                this.CreateList(i);

                setTimeout(() => {
                    $('#amount-' + i).focus();
                }, 100);
            }, 0);

            this.COA = [];
        }
    }

    COARemove(item, i: number) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            this.List[i].coa = null;
            this.List[i].coa_kode = null;
            this.List[i].coa_nama = null;
        }, 100);
    }
    // => END : AC COA

    CreateList(i) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            // => Check Next Input
            let next = Object.keys(this.List).length + 1;
            let DataNext = {
                i: next
            };
            if (!this.List[next]) {
                this.List.push(DataNext);
            }

        }, 100);
    }

    DeleteList(i, item) {
        let x = Swal({
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
                    if (x) {
                        let DATA = Object.keys(this.List);
                        // => Delete
                        let NewDetail = [];
                        let index = 0;
                        for (let j = 0; j < DATA.length; j++) {
                            if (j == i) {
                                delete this.List[j];
                            } else {
                                this.List[j].i = index;
                                NewDetail[index] = this.List[j];
                                index++;
                            }
                        }
                        // => Recreaten
                        this.List = NewDetail;
                        // this.CalculateMisc();                       
                    }
                }
            }
        );
    }

    GetTotal() {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Total: number = 0;
            for (let item of this.List) {
                if (item.amount) {
                    Total += Number(item.amount);
                }
            }
            this.form.total_amount = Total;
        }, 100);
    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    /**
     * Submit
     */
    Submit() {

        Swal({
            title: 'Submit Invoice Down Payment?',
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
                    this.form.ship_tgl_send = moment(this.form.ship_tgl).format('YYYY-MM-DD');                    

                    this.form.list_send = JSON.stringify(this.List);

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
                                    icon: 'success',
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