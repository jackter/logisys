import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-mr',
    templateUrl: './print.html',
    styleUrls: [
        '../mr.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class MRPrintDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<MRPrintDialogComponent>
    ) {

    }

    ngOnInit() {

        // this.form.date_target_show = this.form.date_target;
        if (this.form.date_target) {
            // this.form.date_target_show = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');
            this.form.date_target_show = moment(this.form.date_target).format('DD/ MM/YYYY');
        }

    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'MATERIAL REQUEST NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
