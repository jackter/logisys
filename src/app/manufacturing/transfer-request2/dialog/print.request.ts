import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-mrp',
    templateUrl: './print.request.html',
    styleUrls: [
        '../transfer-request2.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class MRPDialogPrintComponent implements OnInit {

    WaitPrint: boolean;
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl: any;

    Busy;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<MRPDialogPrintComponent>
    ) { }

    ngOnInit() {
        if (this.form.tanggal) {
            this.form.tanggal_show = moment(this.form.tanggal, 'DDMMYYYY').format('DD/MM/YYYY');
        }

    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'MATERIAL REQUEST PRODUCTION NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }
}