import { Component } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { GIHistoryDetailDialogComponent } from './detail';

@Component({
    selector: 'dialog-form-gi-history',
    templateUrl: './history.html'
})
export class GIHistoryDialogComponent {
    form: any;
    Busy;

    constructor(
        private dialog: MatDialog
    ) {

    }

    /**
     * Dialog History Detail
     */
    dialogDetail: MatDialogRef<GIHistoryDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };

    Delay;

    ShowDetail(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            this.dialogDetail = this.dialog.open(
                GIHistoryDetailDialogComponent,
                this.dialogDetailConfig
            );

            this.dialogDetail.componentInstance.form = this.form;
            this.dialogDetail.componentInstance.item = item;

            this.dialogDetail.afterClosed().subscribe(result => {

            });

        }, 150);

    }
    // => / END : Dialog History Detail

}
