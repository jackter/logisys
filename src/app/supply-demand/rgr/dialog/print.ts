import { Component } from '@angular/core';

@Component({
    selector: 'dialog-print-rgr',
    templateUrl: './print.html',
    styleUrls: ['../rgr.component.scss']
})
export class RGRPrintDialogComponent {

    Data: any;
    form: any = {};
    perm: any = {};
    Default: any = {};
    Com: any = {};
    ComUrl: any = {};

    Busy;

    WaitPrint: boolean;

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'RETURN GOODS RECEIPT # ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
