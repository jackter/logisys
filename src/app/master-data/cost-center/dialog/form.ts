import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-cost-center',
    templateUrl: './form.html'
})

export class CostCenterDialogFormComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;

    Busy;

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<CostCenterDialogFormComponent>,
        private dialog: MatDialog
    ) {}

    ngOnInit() {

    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    /*AC Company*/
    Company: any = [];
    CompanyLast;

    CompanyFilter(val) {
        var val = this.form.company_nama;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.company) {

                var Combine = item.nama + ' (' + item.abbr + ')';
                if (
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Company = Filtered;
        } else {
            this.Company = this.Default.company;
        }
    }

    CompanySelect(e, item) {
        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            setTimeout(() => {
                $('*[name="abbr"]').focus();
            }, 100);
        }
    }

    CompanyReset() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
    }

    /**
     * Simpan
     */
    Save() {
        swal(
            {
                title: 'Are You Sure!',
                html: '<div>Save This Data?</div><div><small><strong>' + this.form.nama + '</strong></small></div>',
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
                    let URL = this.ComUrl + 'edit';

                    if (this.form.id === 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.form.is_detail = true;
                                this.dialogRef.close(result);
                            } else {
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

}
