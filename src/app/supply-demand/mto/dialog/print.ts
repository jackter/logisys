import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-mto',
    templateUrl: './print.html',
    styleUrls: ['../mto.component.scss']
})
export class MTOPrintDialogComponent {

    Title: any;
    Data: any;
    WaitPrint: boolean;

    ngOnInit() {
        this.Data.tanggal = moment(this.Data.tanggal).format('DD/MM/YYYY');
	}

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'MATRIAL TRANSFER OUT # ' + this.Data.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
