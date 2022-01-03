import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-jo',
    templateUrl: './print.html',
    styleUrls: ['../jo.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class JOPrintDialogComponent implements OnInit {

    ComUrl: any;
    Default: any = {};
    perm: any = {};
    form: any = {};
    InfOrder: any;

    Busy: any;
    WaitPrint: boolean;
    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<JOPrintDialogComponent>
    ) { }

    ngOnInit(): void {

        if (this.form.start_date) {
            this.form.start_date_show = moment(this.form.start_date).format('DD MMM YY');
        }

        if (this.form.end_date) {
            this.form.end_date_show = moment(this.form.end_date).format('DD MMM YY');
        }

        if (this.form.inforder) {
            this.InfOrder = JSON.parse(this.form.inforder);
        }
    }

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'JOB ORDER NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}