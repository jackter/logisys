import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from "providers/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import Swal from 'sweetalert2';


@Component({
    selector: 'dialog-form-print',
    templateUrl: './print.html',
    styleUrls: ['../invoice.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PrintFormDialogComponent implements OnInit {

    WaitPrint: boolean;

    form: any = {};
    perm: any = {};
    Default: any = {};

    Checkedlist: any = [];

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate;

    GrandTotal: number;
    PPN: number;
    PPH: number;
    ProporsiDP: number = 0;

    List: any[] = [{
        i: 0
    }];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PrintFormDialogComponent>
    ) { }


    ngOnInit() {
        this.form.ref_kode = this.form.ref_kode.toString();  
        this.List = this.form.expense;
        this.Calculate();
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

                if(list.check_list && list.inv == this.form.id){
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
    
                        var nilai_ppn: number = item.ppn;
                        var nilai_pph: number = item.pph;
    
                        OtherCost += (item.other_cost / this.form.total_qty_po) * item.qty;
                        PPBKB += (item.ppbkb / this.form.total_qty_po) * item.qty;
    
                    }
                }

                PPN = Tax_Base * Number(nilai_ppn) / 100;

                PPH = TotalPPh * Number(nilai_pph) / 100;

                // var GrandTotal: number = SubTotal + PPN - PPH;
                // GrandTotal = GrandTotal + OtherCost + PPBKB;

                list.disc = Discount;
                list.ppn = PPN;
                list.Other_cost = OtherCost;
                list.PPBKB = PPBKB;
                list.tax_base = Tax_Base;
                if(PPH < 0){
                    list.pph = PPH * -1;
                }
                else{
                    list.pph = PPH;
                }
                list.subtotal = SubTotal;
                list.grandtotal = Tax_Base + PPN - PPH + OtherCost + PPBKB;

            }
            
        }

        this.getSelected();        

    }
    // => End: calculate


    rupiah(val) {
        return this.core.rupiah(val);
    }
    
    getSelected() {
        var Amount: number = 0;
        if(this.form.expense){
            for (let item of this.List) {
                Amount += Number(item.amount);
            }
        }
        this.form.totalExpAmount = Amount;

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
            if (this.form.list[i].check_list && this.form.list[i].inv == this.form.id) {

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
     * Veriry
     */
    Verify() {
        Swal({
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
                        po: this.form.po,
                        third_party_tank: this.form.third_party_tank
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    icon: 'success',
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

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'INVOICE DOWN PAYMENT NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

    /**
     * Reload Form
     */
    ReloadForm() {
        var Params = {
            id: this.form.id
        };

        this.core.Do(this.ComUrl + 'get', Params).subscribe(
            result => {

                if (result) {
                    this.form = result.data;
                    this.form.is_detail = true;

                    this.Calculate();

                    // console.log(this.form);
                }

            },
            error => {
                console.error('Reload GetForm', error);
                this.core.OpenNotif(error);
            }
        );
    }
    //=> / END : Reload Form

    round(value){
        return Math.round(value);
    }
}