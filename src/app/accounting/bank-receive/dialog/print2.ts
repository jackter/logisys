import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print',
    templateUrl: './print2.html',
    styleUrls: ['../bank-receive.component.scss']
})
export class PenerimaanDialogPrintComponent implements OnInit {

    WaitPrint: boolean;
    form: any;
    ComUrl: any;
    Com: any;

    data;
    Busy;
    AutoPrint;
    Terbilang;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<PenerimaanDialogPrintComponent>
    ) { }

    ngOnInit() {

        if (this.AutoPrint) {
            setTimeout(() => {
                this.Print();
            }, 1000);
        }
        this.form.tanggal_show = moment(this.form.tanggal).format('DD/MM/YYYY');

        if (this.form.bank_currency == 'IDR') {
            this.form.jumlah_show = this.core.rupiah(this.form.total, 0);
        } else {
            this.form.jumlah_show = this.core.rupiah(this.form.total, 2, true);
        }

        if (this.form.bank_currency) {
            if (this.form.currency != this.form.bank_currency) {
                this.form.exchange_terbilang = this.core.terbilang_koma((this.form.total / this.form.rate).toFixed(2), this.form.bank_currency);
            }
        }

    }

    Logo(currency) {
        var Return = '';

        if (currency == 'IDR') {
            Return = 'Rp. ';
        } else if (currency == 'EUR') {
            Return = '€ ';
        } else if (currency == 'CHF') {
            Return = '₣ ';
        } else if (currency == 'CNH' || currency == 'CNY') {
            Return = '¥ ';
        } else if (currency == 'GBP') {
            Return = '£ ';
        } else if (currency == 'YEN') {
            Return = '¥ ';
        } else if (currency == 'WON') {
            Return = '₩ ';
        } else if (currency == 'EUR') {
            Return = '€ ';
        } else if (currency == 'KWD') {
            Return = 'د.ك ';
        } else if (currency == 'LAK') {
            Return = '₭ ';
        } else if (currency == 'MYR') {
            Return = 'RM ';
        } else if (currency == 'NOK' || currency == 'SEK' || currency == 'DKK') {
            Return = 'kr ';
        } else if (currency == 'PGK') {
            Return = 'K ';
        } else if (currency == 'PHP') {
            Return = '₱ ';
        } else if (currency == 'SAR') {
            Return = 'ر.س ';
        } else if (currency == 'THB') {
            Return = '฿ ';
        } else if (currency == 'VND') {
            Return = '₫ ';
        } else {
            Return = '$ ';
        }

        return Return;
    }

    Print() {
        this.WaitPrint = true;
        setTimeout(() => {
            $('.print-area2').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'Bukti Pengeluaran Uang - e-Downstream System',
                timeout: 60000,
            });
            this.WaitPrint = false;
        }, 500);
    }

}
