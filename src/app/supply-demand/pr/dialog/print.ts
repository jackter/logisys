import { ViewEncapsulation, Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'dialog-print-pr',
    templateUrl: './print.html',
    styleUrls: ['../pr.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PRPrintDialogComponent implements OnInit {

    WaitPrint: boolean;
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    constructor(
        private core: Core,
        private dialog: MatDialog
    ) {

    }

    ngOnInit() {        
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'MATERIAL REQUEST NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
