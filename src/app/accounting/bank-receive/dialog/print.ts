import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-sp3',
    templateUrl: './print.html',
    styleUrls: ['../bank-receive.component.scss']
})
export class BankReceiveDialogPrintComponent implements OnInit {

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
        public dialogRef: MatDialogRef<BankReceiveDialogPrintComponent>
    ) { }

    ngOnInit() {

        if (this.form.reff_type) {
            if (this.form.reff_type == 1) {
                this.form.reff_nama = 'AR';
            }
       
            if (this.form.reff_type == 2) {
                this.form.reff_nama = 'Cash Book';
            }
       
        }
    }

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val);
        }
    }

    date_indo(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

    Print() {
        this.WaitPrint = true;
        setTimeout(() => {
            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'BANK RECEIVE NO# ' + this.form.kode,
                timeout: 60000,
            });
            this.WaitPrint = false;
        }, 500);
    }

}
