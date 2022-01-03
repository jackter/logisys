import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-contract-agreement',
    templateUrl: './print.html',
    styleUrls: ['../contract-progress.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContractProgressPrintDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<ContractProgressPrintDialogComponent>
    ) {

    }

    ngOnInit(): void {
        for (let item of this.form.list) {
            item.total_progress = item.current_progress + item.progress;
        }
    }

    rupiah(val): string {
        return this.core.rupiah(val, 1, true);
    }

    date_indo(val): string {
        return moment(val).locale('id').format('LL');
    }

    date(val): string {
        return moment(val).format('DD/MM/YYYY');
    }


    Print(): void {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                // title: 'MATERIAL REQUEST NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
