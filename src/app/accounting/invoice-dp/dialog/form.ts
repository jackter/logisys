import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BroadcasterService } from 'ng-broadcaster';
import Swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-invoice_dp',
    templateUrl: './form.html',
    styleUrls: ['../invoice-dp.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InvoiceDPFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;
    Detail: any[] = [{
        i: 0
    }];

    List: any[] = [{
        i: 0
    }];

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();


    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();
    Currency: any;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<InvoiceDPFormDialogComponent>,
        private dialog: MatDialog,
        private broadcaster: BroadcasterService
    ) { }

    ngOnInit() {

        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
        }

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
            
            var Discount: number = (Number(this.form.total) * Number(this.form.disc)) / 100;
            this.form.disc_amount = Discount;

            var Subtotal: number = Number(this.form.total) - Discount;

            var PPN: number = Subtotal * Number(this.form.ppn) / 100;
            this.form.ppn_amount = PPN;

            var TotalPPh: number = 0;
            for (let detail of this.form.list) {
                if (detail.pph == 1) {
                    TotalPPh += detail.qty * (detail.price / 100 * (100 - Number(this.form.disc)));
                }
            }
            var PPH: number = TotalPPh * Number(this.form.pph) / 100;

            this.form.pph_amount = PPH;

            var DP: number = Number(this.form.grand_total) * Number(this.form.dp) / 100;
            this.form.dp_amount = DP;

            this.CalculateDP();

            this.Edit();
            
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
                $('*[name="supplier_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.po = null;
        this.form.po_kode = null;
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;
        this.form.total = null;
        this.form.list = null;
        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
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
        this.form.po = null;
        this.form.po_kode = null;
        this.POCode = null;
        this.form.list = null;
        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
    }
    //=> END : AC Supplier

    /**
     * AC PO Code
     */
    POCode: any = [];
    POCodeFilter(val: string) {

        if(this.form.company && this.form.supplier) {
            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
    
                var Params = {
                    NoLoader: 1,
                    keyword: val,
                    company: this.form.company,
                    supplier: this.form.supplier
                };
    
                this.core.Do(this.ComUrl + 'list.po', Params).subscribe(
                    result => {
                        if (result.po) {
                            this.POCode = result.po;

                            console.log(this.POCode);
                            
                        }
                    },
                    error => {
                        this.core.OpenNotif(error);
                    }
                );
            }, 0);
        }
    }
    POCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.po = item.id;
            this.form.po_kode = item.kode;
            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;
            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.supplier_nama;
            this.form.total = item.total;
            this.form.list = item.list;
            this.form.dp = item.dp;
            this.form.os_dp = item.os_dp;
            this.form.disc = item.disc;
            this.form.other_cost = item.other_cost;
            this.form.ppbkb = item.ppbkb;
            this.form.tax_base = item.tax_base;
            this.form.ppn = item.ppn;
            this.form.inclusive_ppn = item.inclusive_ppn;
            this.form.customs = item.customs;
            this.form.pph = item.pph;
            this.form.pph_code = item.pph_code;
            this.form.grand_total = item.grand_total;

            var Discount: number = (Number(this.form.total) * Number(this.form.disc)) / 100;
            this.form.disc_amount = Discount;

            var Subtotal: number = Number(this.form.total);

            var PPN: number = (Subtotal - Discount) * Number(this.form.ppn) / 100;
            this.form.ppn_amount = PPN;

            var TotalPPh: number = 0;
            for (let detail of this.form.list) {
                if(this.form.inclusive_ppn == 1) {
                    detail.price = detail.price / 1.1;
                }

                detail.max_qty = detail.qty;

                if (detail.pph == 1) {
                    TotalPPh += detail.qty * (detail.price / 100 * (100 - Number(this.form.disc)));
                }
            }
            var PPH: number = TotalPPh * Number(this.form.pph) / 100;

            this.form.pph_amount = PPH;

            var DP: number = Number(this.form.grand_total) * Number(this.form.dp) / 100;
            this.form.dp_amount = DP;

            this.form.subtotal = Subtotal / 100 * this.form.dp;
            this.form.disc_amount = Discount / 100 * this.form.dp;
            this.form.tax_base = (Subtotal - Discount) / 100 * this.form.dp;
            this.form.ppn_amount = PPN / 100 * this.form.dp;
            this.form.pph_amount = PPH / 100 * this.form.dp;
            this.form.other_cost_amount = (Number(this.form.other_cost) + Number(this.form.ppbkb)) / 100 * this.form.dp;
            this.form.grand_total = this.form.grand_total / 100 * this.form.dp;
            
            this.CalculateDP();

            setTimeout(() => {
                $('*[name="inv_tgl"]').focus();
            }, 100);

        }
    }
    POCodeRemove() {
        this.form.po_kode = null;
        this.form.po = null;
        this.form.total = null;
        this.form.list = null;
        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;

        this.form.list = null;
    }
    //=> END : AC PO Code

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

            var Find = this.core.FJSON(this.Detail, 'coa', item.id);

            setTimeout(() => {
                if(Find.length <= 0) {
                    this.Detail[i].coa = item.id;
                    this.Detail[i].coa_kode = item.kode;
                    this.Detail[i].coa_nama = item.nama;

                    this.COA = [];

                    this.CreateList(i);

                    setTimeout(() => {
                        $('#amount-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    this.Detail[i].coa = null;
                    this.Detail[i].coa_kode = null;
                    this.Detail[i].coa_nama = null;

                    setTimeout(() => {
                        $('#amount-' + SelectExists).focus();
                    }, 250);
                }
            }, 0);

            this.COA = [];
        }
    }

    COARemove(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            item.coa = null;
            item.kode = null;
            item.nama = null;
        }, 100);
    }
    //=> END : AC COA

    InvoiceTypeChange(){
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;
        this.form.po_kode = null;
        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
    }

    round(value){
        return Math.round(value);
    }

    floor(value){
        return Math.floor(value);
    }

    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if(item.qty > item.max_qty){
                item.qty = item.max_qty;
            }

            var Subtotal: number = 0;
            var TotalPPh: number = 0;
            var TotalQty: number = 0;
            var TotalMaxQty: number = 0;

            for (let detail of this.form.list) {             
                TotalQty += detail.qty;
                TotalMaxQty += detail.max_qty;
                Subtotal += detail.qty * detail.price;
                if (detail.pph == 1) {
                    TotalPPh += detail.qty * (detail.price / 100 * (100 - Number(this.form.disc)));
                }         
            }
            
            this.form.subtotal = Subtotal;
            this.form.disc_amount = Subtotal / 100 * this.form.disc;
            this.form.tax_base = this.form.subtotal - this.form.disc_amount;
            this.form.ppn_amount = this.form.tax_base * Number(this.form.ppn) / 100;
            this.form.pph_amount = TotalPPh * Number(this.form.pph) / 100;
            this.form.other_cost_amount = (Number(this.form.other_cost) + Number(this.form.ppbkb)) / TotalMaxQty * TotalQty;
            this.form.grand_total = Math.round(this.form.tax_base + this.form.ppn_amount - this.form.pph_amount + this.form.other_cost_amount);
            this.form.dp_amount = this.form.grand_total / 100 * this.form.dp;
            this.form.grand_total -= this.form.dp_amount;
            
        }, 100);

    }

    CreateList(i) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            // => Check Next Input
            let next = Object.keys(this.Detail).length + 1;
            let DataNext = {
                i: next
            };
            if (!this.Detail[next]) {
                this.Detail.push(DataNext);
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
                        let DATA = Object.keys(this.Detail);
                        // => Delete
                        let NewDetail = [];
                        let index = 0;
                        for (let j = 0; j < DATA.length; j++) {
                            if (j == i) {
                                delete this.Detail[j];
                            } else {
                                this.Detail[j].i = index;
                                NewDetail[index] = this.Detail[j];
                                index++;
                            }
                        }
                        // => Recreaten
                        this.Detail = NewDetail;
                        // this.CalculateMisc();                       
                    }
                }
            }
        );
    }

    CalculateDP() {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if(this.form.dp > this.form.os_dp){
                this.form.dp = this.form.os_dp;
            }

            var Subtotal: number = 0;
            var TotalPPh: number = 0;

            for (let detail of this.form.list) {
                Subtotal += detail.qty * detail.price;
                if (detail.pph == 1) {
                    TotalPPh += detail.qty * (detail.price / 100 * (100 - Number(this.form.disc)));
                }         
            }
            
            this.form.subtotal = Subtotal / 100 * this.form.dp;
            this.form.disc_amount = this.form.subtotal / 100 * this.form.disc;
            this.form.tax_base = this.form.subtotal - this.form.disc_amount;
            this.form.ppn_amount = this.form.tax_base * Number(this.form.ppn) / 100;
            this.form.pph_amount = (TotalPPh * Number(this.form.pph) / 100) / 100 * this.form.dp;
            this.form.other_cost_amount = (Number(this.form.other_cost) + Number(this.form.ppbkb)) / 100 * this.form.dp;
            this.form.grand_total = this.form.tax_base + this.form.ppn_amount - this.form.pph_amount + this.form.other_cost_amount;
            this.form.dp_amount = this.form.grand_total;            

        }, 100)        

    }
    // => / END : Class

    GetTotal() {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Total: number = 0;
            for(let item of this.Detail) {
                if(item.amount) {
                    Total += Number(item.amount);
                }
            }
            this.form.total_amount = Total;
        }, 100); 
    }

    /**
     * Disc Change
     */
    // DiscChange(type) {

    //     var Subtotal: number =  this.form.subtotal;

    //     if (type == 'percent') {
    //         this.form.disc_amount = Subtotal * this.form.disc / 100;
    //     } else 
    //     if (type == 'amount') {
    //         this.form.disc = this.form.disc_amount / Subtotal * 100;
    //     }

    //     if(this.form.disc_amount) {
    //         this.form.tax_base = Subtotal - this.form.disc_amount;
    //     }

    //     this.CalculateMisc();
    // }
    // => / END : Disc Change

    // CalculateMisc() {

    //     clearTimeout(this.Delay);
    //     this.Delay = setTimeout(() => { 

    //         var SubTotal: number = 0;

    //         for(let item of this.Detail) {
    //             item.total = Number(item.qty * item.price);
    //             SubTotal += Number(item.qty * item.price);
    //         }
    //         this.form.subtotal = SubTotal;

    //         var Discount: number = 0;
    //         if(this.form.disc) {
    //             Discount = SubTotal * this.form.disc / 100;
    //         }
    //         this.form.disc_amount = Discount;

    //         var TaxBase = SubTotal - Discount;
    //         this.form.tax_base = TaxBase;

    //         var PPN: number = 0;
    //         if(this.form.ppn == 10) {
    //             PPN = TaxBase * 0.1;
    //         }
    //         this.form.ppn_amount = PPN;

    //         var OtherCost: number = 0;
    //         if(this.form.other_cost_amount) {
    //             OtherCost = this.form.other_cost_amount;
    //         }

    //         this.form.grand_total = TaxBase + PPN + OtherCost;

    //     }, 100);
    // }


    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    /**
     * Submit
     */
    Submit() {

        Swal({
            title: 'Submit Invoice ?',
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

                    if(this.form.inv_tgl){
                        this.form.tanggal_inv_send = moment(this.form.inv_tgl).format('YYYY-MM-DD');
                    }
                    if (this.form.ref_tgl) {
                        this.form.ref_tgl_send = moment(this.form.ref_tgl).format('YYYY-MM-DD');
                    }                    
                    if (this.form.pajak_tgl) {
                        this.form.pajak_tgl_send = moment(this.form.pajak_tgl).format('YYYY-MM-DD');
                    }
                    if (this.form.tgl_jatuh_tempo) {
                        this.form.tgl_jatuh_tempo_send = moment(this.form.tgl_jatuh_tempo).format('YYYY-MM-DD');
                    }

                    this.form.list_send = JSON.stringify(this.form.list);

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