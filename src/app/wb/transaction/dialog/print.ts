import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-transaction',
    templateUrl: './print.html',
    styleUrls: [
        '../transaction.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class TransactionPrintDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<TransactionPrintDialogComponent>
    ) {

    }

    ngOnInit() {
        this.form.tgl_src = moment(this.form.date_src).format('DD/MM/YYYY');
        this.form.tgl_sbi = moment(this.form.create_date).format('DD/MM/YYYY');
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'TRANSACTION NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

    rupiah(val) {
        return this.core.rupiah(val);
    }

    absolute(val) {
        var Abs = Math.abs(val);
        return this.core.rupiah(Abs);
    }

}
