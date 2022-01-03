import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-invoice-dp',
    templateUrl: './print.html',
    styleUrls: [
        '../invoice-dp.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class InvoiceDPPrintDialogComponent implements OnInit {

    WaitPrint: boolean;
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<InvoiceDPPrintDialogComponent>

    ) {

    }

    ngOnInit() {
        this.form.ref_kode = this.form.ref_kode.toString();  
        this.Calculate();
    }

    Calculate() {

        if (this.form.tipe == 1) {
            var Discount: number = (Number(this.form.total) * Number(this.form.disc)) / 100;
            var Subtotal: number = Number(this.form.total) - Discount;
            var PPN: number = Subtotal * Number(this.form.ppn) / 100;

            var TotalPPh = 0;
            for (let detail of this.form.list) {
                if (detail.pph == 1) {
                    TotalPPh += detail.qty * (detail.price / 100 * (100 - Number(this.form.disc)));
                }
            }
            var PPH: number = TotalPPh * Number(this.form.pph) / 100;
            var DP: number = Number(this.form.grand_total) * Number(this.form.dp_pct) / 100;

            this.form.disc_amount = Discount / 100 * this.form.dp_pct;
            this.form.tax_base = this.form.tax_base / 100 * this.form.dp_pct;
            this.form.subtotal = this.form.total / 100 * this.form.dp_pct;
            this.form.ppn_amount = PPN / 100 * this.form.dp_pct;
            this.form.pph_amount = PPH / 100 * this.form.dp_pct;
            this.form.other_cost_amount = (Number(this.form.other_cost) + Number(this.form.ppbkb)) / 100 * this.form.dp_pct;
            this.form.grand_total = DP;
        } else
            if (this.form.tipe == 2 || this.form.tipe == 3) {
                for (let detail of this.form.list) {
                    if (this.form.inclusive_ppn == 1) {
                        detail.price = detail.price / 1.1;
                    }
                }
                var Subtotal = 0;
                var TotalPPh = 0;
                var TotalQty = 0;
                var TotalMaxQty = 0;

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
                this.form.tax_base_bef = this.form.subtotal - this.form.disc_amount;
                this.form.dp_amount = (this.form.subtotal - this.form.disc_amount) / 100 * this.form.dp;
                this.form.tax_base = this.form.tax_base_bef - this.form.dp_amount;
                this.form.ppn_amount = this.form.tax_base * Number(this.form.ppn) / 100;
                this.form.pph_amount = TotalPPh * Number(this.form.pph) / 100;
                this.form.other_cost_amount = (Number(this.form.other_cost) + Number(this.form.ppbkb)) / TotalMaxQty * TotalQty;
                this.form.grand_total = Math.round(this.form.tax_base + this.form.ppn_amount - this.form.pph_amount + this.form.other_cost_amount);
            }
    }

    round(value) {
        return Math.round(value);
    }

    floor(value) {
        return Math.floor(value);
    }

    date_indo(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        } else {
            return '-';
        }
    }

    /**
     * Verify
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
                        tipe: this.form.tipe,
                        po: this.form.po,
                        supplier: this.form.supplier,
                        company: this.form.company,
                        enable_journal: this.form.enable_journal
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
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
    // => / END : Verify

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            if (this.form.tipe == 1) {
                $('.print-area').print({
                    globalStyle: true,
                    mediaPrint: true,
                    title: 'INVOICE DOWN PAYMENT NO# ' + this.form.kode,
                    timeout: 60000,
                });
            }
            else {
                $('.print-area').print({
                    globalStyle: true,
                    mediaPrint: true,
                    title: 'INVOICE SUPPLIER BASED NO# ' + this.form.kode,
                    timeout: 60000,
                });
            }

            this.WaitPrint = false;

        }, 1000);
    }

    rupiah(val) {
        return this.core.rupiah(val);
    }

    /**
     * Reload Form
     */
    ReloadForm() {
        var Params = {
            id: this.form.id
        };

        this.core.Do(this.ComUrl + 'print', Params).subscribe(
            result => {

                if (result) {
                    this.form = result.data;
                    this.form.is_detail = true;

                    this.Calculate();
                }

            },
            error => {
                console.error('Reload GetForm', error);
                this.core.OpenNotif(error);
            }
        );
    }
    // => / END : Reload Form

}
