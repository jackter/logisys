import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-print-mr',
    templateUrl: './print.html',
    styleUrls: [
        '../mr2.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class MR2PrintDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<MR2PrintDialogComponent>
    ) {

    }

    ngOnInit() {

        this.form.date_target_show = this.form.date_target;
        if (this.form.date_target) {
            // this.form.date_target_show = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');
            this.form.date_target_show = this.form.date_target;
        }

        this.form.cost_center_nama = this.form.list[0]['cost_center_nama'];

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
