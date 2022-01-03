import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-contract-request',
    templateUrl: './print.html',
    styleUrls: ['../contract-request.component.scss']
})
export class ContractRequestDialogPrintComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Com: any;

    WaitPrint: boolean;
    Busy: boolean;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<ContractRequestDialogPrintComponent>
    ) { }

    ngOnInit(): void {

    }

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

    date_indo(val): any {
        return moment(val).locale('id').format('LL');
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'CONTRACT REQUEST NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }
}
