import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';

import { TransactionPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-contract',
    templateUrl: './form.html',
    styleUrls: ['../transaction.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TrxFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    isSync;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<TrxFormDialogComponent>
    ) {

    }

    ngOnInit() {
    }

    Simpan() {

    }

    /**
     * Print
     */
    dialogPrint: MatDialogRef<TransactionPrintDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    Print() {
        // var Params = {
        //     id: this.form.id
        // };
        // this.core.Do(this.ComUrl + 'print', Params).subscribe(
        //     result => {
        //         if (result) {
        //             this.form = result.data;
        //             this.ShowPrint();
        //         }
        //     },
        // );
        this.dialogPrint = this.dialog.open(
            TransactionPrintDialogComponent,
            this.dialogRefConfig
        );

        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Com = this.Com;
        this.dialogPrint.componentInstance.form = this.form;

        this.dialogPrint.afterOpened().subscribe(result => {
            this.dialogRef.close();
        });
    }
    // => END : Print

}
