import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'dialog-stock-adj',
    templateUrl: './print.html',
    styleUrls: ['../adjustment.component.scss']
})
export class StockAdjPrintDialogComponent {

    form: any = {};
    WaitPrint: boolean;

    ngOnInit() {

    }

    date_indo(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }
    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'STOCK ADJUSTMENT # ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }
}
