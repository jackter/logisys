import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-contract-agreement',
    templateUrl: './print.html',
    styleUrls: ['../contract-agreement.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContractAgreementPrintDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    WaitPrint: boolean;

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialogRef: MatDialogRef<ContractAgreementPrintDialogComponent>
    ) {

    }

    ngOnInit() {

    }

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

    date_indo(val) {
        return moment(val).locale('id').format('LL');
    }

    date(val) {
        return moment(val).format('DD/MM/YYYY');
    }


    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'CONTRACT AGREEMENT NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
