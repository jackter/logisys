import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-job-alocation',
    templateUrl: './form.html'
})
export class JobAlocationFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;
    Detail;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<JobAlocationFormDialogComponent>
    ) {

    }

    ngOnInit() {

    }

    /**
     * Edit
     */
    Edit() {
        this.form.is_detail = null;
    }
    // => / END : Edit */

    /**
     * Simpan
     */
    Simpan() {

        swal(
            {
                title: 'Please Confirm to Save?',
                html: '<div>Are you sure to continue?',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {

                    var Params = {
                        company: this.Detail.company,
                        company_abbr: this.Detail.company_abbr,
                        company_nama: this.Detail.company_nama,
                        coa: this.Detail.id,
                        coa_kode: this.Detail.kode,
                        coa_nama: this.Detail.nama,
                        nama: this.form.nama
                    }

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    this.Busy = true;
                    this.core.Do(URL, Params).subscribe(
                        result => {
                            if (result.status == 1) {

                                if (this.form.id == 'add') {
                                    var ADD = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Saved Successfully',
                                        msg: ''
                                    };
                                    this.core.OpenAlert(ADD);
                                } else {
                                    this.form.is_detail = true;
                                    this.Busy = false;

                                    var EDIT = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Updated Successfully',
                                        msg: ''
                                    };
                                    this.core.OpenAlert(EDIT);
                                }
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
                            console.error('Simpan', error);
                        }
                    );
                }
            }
        );
    }
    // => / END : Simpan

}
