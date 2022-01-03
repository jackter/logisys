import { Component, ViewEncapsulation, OnInit } from "@angular/core";
import { Core } from 'providers/core';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-gi-history_detail',
    templateUrl: './print.html'
})
export class BLPrintDialogComponent implements OnInit {
    ComUrl;

    form: any;
    item: any;
    Data: any[] = [];
    WaitPrint: boolean;
    Busy;

    constructor(
        private core: Core
    ) {

    }

    ngOnInit() {
        this.form.tanggal_format = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');        
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'BL NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}