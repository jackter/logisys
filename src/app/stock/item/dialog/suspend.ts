import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
@Component({
    selector: 'dialog-suspand',
    templateUrl: './suspend.html',
    styleUrls: ['../item.component.scss']
})
export class SuspendFormDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<SuspendFormDialogComponent>
    ) { }

    ngOnInit() {

    }

    /**
     * Simpan
     */
    Simpan() {

        this.Busy = true;
        this.core.Do(this.ComUrl + 'suspend', this.form).subscribe(
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
