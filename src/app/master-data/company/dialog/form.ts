import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-company',
    templateUrl: './form.html'
})

export class CompanyDialogFormComponent implements OnInit {

    form: any = {};
    perm: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<CompanyDialogFormComponent>,
        private broadcaster: BroadcasterService
    ) { }

    ngOnInit() { 

    }

    /*Edit*/
    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }
    // => END : Edit

    /*Simpan*/
    Save() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
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
                console.error('Save', error);
            }
        );
    }
    // => END : Simpan
}
