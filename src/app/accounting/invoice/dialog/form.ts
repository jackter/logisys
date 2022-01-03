import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from "providers/core";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';
import Swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-invoice',
    templateUrl: './form.html',
    styleUrls: ['../invoice.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InvoiceFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    Checkedlist: any = [];

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    GrandTotal: number;
    PPN: number;
    PPH: number;
    ProporsiDP: number = 0;
    DPAmount: number = 0;

    disabled: boolean = false;

    List: any[] = [{
        i: 0
    }];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<InvoiceFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {


    }


    ngOnInit() {

        this.Company = this.Default.company;

        if(this.Default.day_subs){
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

        /**
         * clear data
         */
        this.form.GrandTotal = 0;
        this.form.ppnTotal = 0;
        this.form.pphTotal = 0;
        this.form.AmountTotal = 0;
        this.form.OtherTotal = 0;
        this.form.DiscTotal = 0;
        this.form.tax_baseTotal = 0;
        this.form.GTAmount = 0;
        this.form.DP_AmountReceipt = 0;
        this.form.DP_Disc = 0;
        this.form.DP_TaxBase = 0;
        this.form.DP_PPN = 0;
        this.form.DP_PPh = 0;
        this.form.DP_Othercost = 0;
        this.form.DPAmount = 0;
        this.form.totalExpAmount = 0;
        this.Calculate();

        if (this.form.id != 'add') {
            this.List = this.form.expense;
            if(this.List){
                this.ChangeValue();
            }
            this.getSelected();
            // this.disabled = true;
        }
    }
    /**
     * calculte
     */
    Calculate() {

        if (this.form.list) {
            for (let list of this.form.list) {

                var SubTotal: number = 0;
                var Tax_Base: number = 0;
                var Discount: number = 0;
                var PPN: number = 0;
                var PPH: number = 0;
                var TotalPPh: number = 0;
                var OtherCost: number = 0;
                var PPBKB: number = 0;

                var nilai_ppn: number = 0;
                var nilai_pph: number = 0;                

                for (let item of list.item) {

                    if(item.inclusive_ppn == 1){
                        item.price = item.price / 1.1;
                        SubTotal += item.qty * item.price;
                    }
                    else{
                        SubTotal += item.qty * item.price;
                    }

                    Discount = (SubTotal * Number(item.disc)) / 100;

                    Tax_Base = SubTotal - Discount;

                    if (item.pph_flag == 1) {
                        TotalPPh += item.qty * (item.price / 100 * (100 - Number(item.disc)));
                    }

                    nilai_ppn = item.ppn;
                    nilai_pph = item.pph;

                    OtherCost += (item.other_cost / this.form.total_qty_po) * item.qty;
                    PPBKB += (item.ppbkb / this.form.total_qty_po) * item.qty;
                    
                }

                PPN = Tax_Base * nilai_ppn / 100;
                PPH = TotalPPh * nilai_pph / 100;                              

                // var GrandTotal: number = SubTotal + PPN - PPH;
                // GrandTotal = GrandTotal + OtherCost + PPBKB;

                list.disc = Discount;
                list.ppn = PPN;
                list.Other_cost = OtherCost;
                list.PPBKB = PPBKB;
                list.tax_base = Tax_Base;
                list.pph = PPH;
                list.subtotal = SubTotal;
                list.grandtotal = Tax_Base + PPN - PPH + OtherCost + PPBKB;

            }            
        }

    }
    // => End: calculate


    rupiah(val) {
        return this.core.rupiah(val);
    }

    /**
     * fungsi checkbox dinamis
     */
    Uncheckall() {
        for (var i = 0; i < this.form.list.length; i++) {
            this.form.list[i].check_list = this.form.check_all;
        }

        this.getSelected();
    }
    checkAllSelect() {
        this.form.check_all = this.form.list.every(function (item: any) {
            return item.check_list == true;
        });
        this.getSelected();
    }

    getSelected() {
        this.Checkedlist = [];
        this.form.check = null;

        var GrandTotal: number = 0;
        var Amount: number = 0;
        var PPN: number = 0;
        var PPh: number = 0;
        var other_cost: number = 0;
        var ppbkb: number = 0;
        var disc: number = 0;
        var tax_base: number = 0;

        for (var i = 0; i < this.form.list.length; i++) {
            if (this.form.list[i].check_list) {

                this.Checkedlist.push(this.form.list[i]);
                this.form.check = true;

                /**
                 * calculate grand total
                 */
                GrandTotal += this.form.list[i].grandtotal;
                Amount += this.form.list[i].subtotal;
                PPN += this.form.list[i].ppn;
                PPh += this.form.list[i].pph;
                other_cost += this.form.list[i].Other_cost;
                ppbkb += this.form.list[i].PPBKB;
                disc += this.form.list[i].disc;
                tax_base += this.form.list[i].tax_base;
            }
        }

        this.form.DP_AmountReceipt = 0;
        this.form.DP_Disc = 0;
        this.form.DP_TaxBase = 0;
        this.form.DP_PPN = 0;
        this.form.DP_PPh = 0;
        this.form.DP_Othercost = 0;
        this.form.DPAmount = 0;

        if(this.form.data_dp && this.form.dp_amount == null){
            for (var i = 0; i < this.form.data_dp.length; i++) {
                this.form.data_dp[i].price_calc = this.form.data_dp[i].price;
                if(this.form.inclusive_ppn == 1){
                    this.form.data_dp[i].price_calc = this.form.data_dp[i].price / 1.1;
                }
                this.form.DP_AmountReceipt += (this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].dp;
                this.form.DP_Disc += ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc) / 100 * this.form.data_dp[i].dp;
                this.form.DP_TaxBase +=  ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) - ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc))  / 100 * this.form.data_dp[i].dp;
                this.form.DP_PPN +=  ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) - ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc)) / 100 * this.form.data_dp[i].ppn / 100 * this.form.data_dp[i].dp;
                this.form.DP_PPh +=  ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) - ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc)) / 100 * this.form.data_dp[i].pph / 100 * this.form.data_dp[i].dp;
                this.form.DP_Othercost =  (this.form.data_dp[i].other_cost + this.form.data_dp[i].ppbkb) / 100 * this.form.data_dp[i].dp;
            }
        }
        else if(this.form.data_dp && this.form.dp_amount > 0){
            for (var i = 0; i < this.form.data_dp.length; i++) {
                this.form.data_dp[i].price_calc = this.form.data_dp[i].price;
                if(this.form.inclusive_ppn == 1){
                    this.form.data_dp[i].price_calc = this.form.data_dp[i].price / 1.1;
                }
                this.form.DP_AmountReceipt += (this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].dp;
                this.form.DP_Disc += ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc) / 100 * this.form.data_dp[i].dp;
                this.form.DP_TaxBase +=  ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) - ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc))  / 100 * this.form.data_dp[i].dp;
                this.form.DP_PPN +=  ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) - ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc)) / 100 * this.form.data_dp[i].ppn / 100 * this.form.data_dp[i].dp;
                this.form.DP_PPh +=  ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) - ((this.form.data_dp[i].qty * this.form.data_dp[i].price_calc) / 100 * this.form.data_dp[i].disc)) / 100 * this.form.data_dp[i].pph / 100 * this.form.data_dp[i].dp;
                this.form.DP_Othercost =  (this.form.data_dp[i].other_cost + this.form.data_dp[i].ppbkb) / 100 * this.form.data_dp[i].dp;
            }
        }

        this.form.DPAmount = this.form.DP_TaxBase + this.form.DP_PPN - this.form.DP_PPh + this.form.DP_Othercost;

        this.form.GrandTotal = GrandTotal;
        this.form.ppnTotal = PPN;
        this.form.pphTotal = PPh;
        this.form.AmountTotal = Amount;
        this.form.OtherTotal = other_cost + ppbkb;
        this.form.DiscTotal = disc;
        this.form.tax_baseTotal = tax_base;

        this.Checkedlist = JSON.stringify(this.Checkedlist);

        /**
         * Kalkulasi seluruh DP Amount pada masing-masing GRN
         */
        this.form.GTAmount = GrandTotal - this.form.DPAmount + this.form.totalExpAmount;        
    }
    // end fungsi checkbox dinamis

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

    ChangeValue() {
        var Amount: number = 0;
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            for (let item of this.List) {
                Amount += Number(item.amount);
            }

            this.form.totalExpAmount = Amount;

            this.getSelected();

        }, 100);
    }

    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if(!this.List){
                this.List = [{
                    i: 0
                }];
            }
            else{
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

    /**
     * Simpan
     */
    Simpan() {

        this.form.list_send = this.Checkedlist;

        if(this.form.inv_tgl){
            this.form.tanggal_inv_send = moment(this.form.inv_tgl).format('YYYY-MM-DD');
        }
        if (this.form.pajak_tgl) {
            this.form.tanggal_tax_send = moment(this.form.pajak_tgl).format('YYYY-MM-DD');
        }
        if (this.form.tgl_jatuh_tempo) {
            this.form.tgl_jatuh_tempo_send = moment(this.form.tgl_jatuh_tempo).format('YYYY-MM-DD');
        }
        if(this.form.ref_tgl){
            this.form.tanggal_ref_send = moment(this.form.ref_tgl).format('YYYY-MM-DD');
        }

        this.form.list_exp_send = JSON.stringify(this.List);

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'save';
        }     

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

        this.form.list = null;

        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
        this.form.note = null;
    }
    //=> / END : AC Company

    /**
    * AC poCode
    */
    POCode: any;
    POCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                supplier: this.form.supplier
            };

            this.core.Do(this.ComUrl + 'po.list', Params).subscribe(
                result => {

                    if (result) {
                        this.POCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    POCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.po_kode = item.kode;
            this.form.po = item.po;

            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;

            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.supplier_nama;

            this.form.dp = item.dp;
            this.form.inclusive_ppn = item.inclusive_ppn;
            this.form.customs = item.customs;

            this.form.list = item.list;
            this.form.data_dp = item.data_dp;
            this.form.total_qty_po = item.total_qty_po;

            this.form.is_gr = item.is_gr;


            this.Calculate();

            setTimeout(() => {
                $('*[name="inv_tgl"]').focus();
            }, 100);

        }

    }
    POCodeRemove() {

        this.form.po_kode = null;
        this.form.po = null;

        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;

        this.form.list = null;

        this.form.ref_kode = null,
            this.form.ref_tgl = null;

        this.form.pajak_no = null,
            this.form.pajak_tgl = null;

        this.form.note = null;

        this.Checkedlist = null;
        this.form.check_all = null;

    }
    //=> / END : AC poCode

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

        this.form.po_kode = null;
        this.form.po = null;

        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
        this.form.note = null;
    }
    //=> END : AC Supplier

    round(value){
        return Math.round(value);
    }

}