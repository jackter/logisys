import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-sp3',
    templateUrl: './print.html',
    styleUrls: ['../bank-payment.component.scss']
})
export class BankPaymentDialogPrintComponent implements OnInit {

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
        public dialogRef: MatDialogRef<BankPaymentDialogPrintComponent>
    ) { }

    ngOnInit() {

        if (this.form.reff_type) {
            if (this.form.reff_type == 1) {
                this.form.reff_nama = 'AP';
            }
            if (this.form.reff_type == 2) {
                this.form.reff_nama = 'Non AP';
            }
            if (this.form.reff_type == 3) {
                this.form.reff_nama = 'Cash Book';
            }
            if (this.form.reff_type == 4) {
                this.form.reff_nama = 'AP Misc';
            }
        }

        this.form.terbilang = this.core.terbilang_koma(Number(this.form.total), this.form.currency);

    }

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val);
        }
    }

    Print() {

        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'BANK PAYMENT NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);

    }

    date_indo(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

}
