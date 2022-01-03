import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-reject',
    templateUrl: './reject.html',
    styleUrls: ['../pr.component.scss']
})
export class PRRejectFormDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<PRRejectFormDialogComponent>
    ) { }

    ngOnInit() {
        // console.log(this.form);
        
    }

    /**
     * Simpan
     */
    Simpan() {

        var Params = {
            id: this.form.id,
            pr_kode: this.form.pr_kode,
            kode: this.form.pr_kode,
            mr: this.form.mr,
            lvl: this.form.lvl,
            keterangan: this.form.reject_remarks
        };
        
        this.Busy = true;
        this.core.Do(this.ComUrl + 'reject', Params).subscribe(
            result => {

                if (result.status == 1) {

                    var Success = {
                        type: 'error',
                        showConfirmButton: false,
                        title: 'Request Rejected',
                        msg: 'Purchase Request Rejected!'
                    };
                    this.core.OpenAlert(Success);

                    this.core.send({
                        info: 'PR Rejected (LVL-' + this.form.lvl + ')'
                    });

                    this.dialogRef.close(result);

                } else {
                    var Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);

                    this.Busy = false;
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
