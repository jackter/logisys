import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-close-po',
    templateUrl: './close.html',
    styleUrls: ['../pr.component.scss']
})
export class PRCloseFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PRCloseFormDialogComponent>
    ) { }

    ngOnInit() {
    }

    /**
     * Simpan
     */
    Simpan() {

        this.Busy = true;
        this.core.Do(this.ComUrl + 'close.pr', this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.dialogRef.close(result);

                } else {
                    this.Busy = false;

                    var Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);
                }

            },
            error => {
                this.Busy = false;

                this.core.OpenNotif(error);
                console.error('Submit', error);
            }
        );

    }
    // => / END : Simpan

}
