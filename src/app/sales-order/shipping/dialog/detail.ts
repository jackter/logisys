import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Core } from 'providers/core';

@Component({
    selector: 'dialog-form-gi-history_detail',
    templateUrl: './detail.html'
})
export class ShippingHistoryDetailDialogComponent implements OnInit {
    ComUrl;

    form: any;
    // item: any;
    Data;
    WaitPrint: boolean;
    Busy;

    constructor(
        private core: Core
    ) { }

    ngOnInit() {
        if (this.form.tanggal) {
            this.form.tanggal_show = moment(this.form.tanggal, 'DDMMYYYY').format('DD/MM/YYYY');
        }
    }

    rupiah(val) {
        return this.core.rupiah(val, 0, true);
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'SHIPPING NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }
}
