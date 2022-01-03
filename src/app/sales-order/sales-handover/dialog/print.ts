import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-form-sales-handover',
    templateUrl: './print.html'
})
export class SalesHandoverDialogPrintComponent implements OnInit {
    
    form: any = {};
    
    ComUrl: string;
    WaitPrint: boolean;
    Busy: boolean;
    Com: any;

    constructor(
        private core: Core
    ) {

    }

    ngOnInit() {
        this.form.tanggal_format = moment(this.form.tanggal, 'DDMMYYYY').format('DD/MM/YYYY');
    }

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val, 0, true);
        }
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'SH NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
