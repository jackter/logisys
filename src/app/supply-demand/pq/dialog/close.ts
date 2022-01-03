import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';

@Component({
    selector: 'dialog-close-pq',
    templateUrl: './close.html',
    styleUrls: ['../pq.component.scss']
})
export class PQCloseDialogFormComponent implements OnInit {

    Default: any = {};
    perm: any = {};
    Com;

    Initial;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PQCloseDialogFormComponent>
    ) { }

    ngOnInit() {

    }

    /*Simpan*/
    ComUrl;
    Busy;
    form: any = {};

    Simpan() {

        this.Busy = true;

        if (this.Initial == 1) {
            this.core.Do(this.ComUrl + 'backtopr', this.form).subscribe(
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
        } else {
            this.core.Do(this.ComUrl + 'close.pq', this.form).subscribe(
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
    }
}
