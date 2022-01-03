import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';
import swal from 'sweetalert2';

import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-transporter',
    templateUrl: './form.html'
})
export class TransporterFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;
    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<TransporterFormDialogComponent>
    ){

    }

    ngOnInit(){

    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    /**
     * Simpan
     */
    Simpan() {

        swal({
            title: 'Please Confirm to Submit?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {
                if (result.value) {
                    var URL = this.ComUrl + 'edit';
                    if (this.form.id === 'add') {
                        URL = this.ComUrl + 'add';
                    }
            
                    this.core.Do(URL, this.form).subscribe(
                        result => {
                            if (result.status == 1) {
                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Submitted',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);
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
                            this.core.OpenNotif(error);
                        }
                    );
                }
            }
        );
    }
    //=> END : Simpan

}