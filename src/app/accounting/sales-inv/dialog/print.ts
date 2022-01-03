import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-print-sales',
    templateUrl: './print.html',
    styleUrls: ['../sales-inv.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SalesDialogPrintComponent implements OnInit {

    WaitPrint: boolean;
    GrandTotal: number;
    PPN: number;
    PPH: number;
    Discount: number;
    List: any[] = [{
        i: 0
    }];
    SupplierList: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};
    PO: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<SalesDialogPrintComponent>
    ) {
    }


    ngOnInit() {
        if(this.form.inclusive_ppn == 1){
            this.form.dp_amount = Math.round(((this.form.sold_price * this.form.qty) / 1.1) / 100 * this.form.dp);
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
        this.form.ppn_amount = Math.round(this.form.tax_base * Number(this.form.ppn) / 100);
        this.form.grand_total = this.form.tax_base + this.form.ppn_amount;
    }

    toFixed(value, precision) {
        var precision = precision || 0,
            power = Math.pow(10, precision),
            absValue = Math.abs(Math.round(value * power)),
            result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

        if (precision > 0) {
            var fraction = String(absValue % power),
                padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
            result += '.' + padding + fraction;
        }
        return result;
    }

    /**
     * Print
     */
    Print() {

        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'SALES INVOICE DP NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);

    }
    // => / END : Print

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
                    
                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                this.core.Sharing('reload', 'reload');

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
    //=> / END : Verify

    rupiah(val) {
        return this.core.rupiah(val);
    }

}
