import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-rgi',
    templateUrl: './print.html',
    styleUrls: ['../rgi.component.scss'],
})
export class RGIPrintDialogComponent implements OnInit {

    form: any = {};
    ComUrl: string;
    perm: any;
    Delay: any;
    Default: any;

    WaitPrint: boolean;

    Com;
    Busy;

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<RGIPrintDialogComponent>
    ) {

    }

    ngOnInit() {

    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'RETURN GOODS ISSUED NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
