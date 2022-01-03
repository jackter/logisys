import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from "providers/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
    selector: 'print-inv-aging',
    templateUrl: './print.html',
    styleUrls: ['../inv-aging.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PrintInvAgingDialogComponent implements OnInit {

    WaitPrint: boolean;

    form: any = {};
    Data;
    ComUrl;

    Busy;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PrintInvAgingDialogComponent>
    ) { }


    ngOnInit() {
        
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'INVOICE AGING',
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

    date_indo(val) {
        if(val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

    rupiah(val) {
        if(val) {
            return this.core.rupiah(val, 0);
        } else {
            return 0;
        }
    }
}