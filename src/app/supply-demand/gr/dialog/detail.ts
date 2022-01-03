import { Component } from '@angular/core';

@Component({
    selector: 'dialog-detail-gr',
    templateUrl: './detail.html',
    styleUrls: ['../gr.component.scss']
})
export class GRDetailDialogComponent {

    Title: any;
    Data: any;
    form: any;
    GRDate: any;
    WaitPrint: boolean;

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'GOODS RECEIPT NOTES # ' + this.Data.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
