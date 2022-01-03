import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-mti',
    templateUrl: './print.html',
    styleUrls: [
        '../mti.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class MTIPrintDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<MTIPrintDialogComponent>
    ) {

    }

    ngOnInit() {

        this.form.tanggal = moment(this.form.tanggal).format('DD/MM/YYYY');
        
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'MATERIAL TRANSFER IN NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
