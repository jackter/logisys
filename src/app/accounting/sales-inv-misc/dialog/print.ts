import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-print-sales-inv-misc',
    templateUrl: './print.html',
    styleUrls: ['../sales-inv-misc.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SalesMiscDialogPrintComponent implements OnInit {

    WaitPrint: boolean;
    GrandTotal: number;
    PPN: number;
    PPH: number;
    Discount: number;
    List: any[] = [];
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
        public dialogRef: MatDialogRef<SalesMiscDialogPrintComponent>
    ) {
    }


    ngOnInit() {
        this.form.grand_total = this.form.amount;

        // Terbilang
        this.form.terbilang = this.core.terbilang_koma(this.toFixed(this.form.grand_total, 0), this.form.currency);
        this.form.terbilangEng = this.core.inWords(this.toFixed(this.form.grand_total, 0));

        this.form.company_alamat = this.form.company_alamat.split("\\\\n").join("<br/>");

        if(this.Default.sales_invoice) {
            var Find = _.find(this.Default.sales_invoice, {
                company: this.form.company
            });            
            
            this.form.signature_nama = Find.signature.nama;        
            this.form.signature_jabatan = Find.signature.jabatan; 
            
            var Term = _.find(Find.term, {
                id: this.form.term
            });

            this.form.term_kode = Term.kode;
        }   
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
                        sc: this.form.sc,
                        company: this.form.company,
                        cust: this.form.cust,
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

    rupiah(val) {
        if(val) {
            return this.core.rupiah(val);
        }
    }

    date_indo(val) {
        if(val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

}
