import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Core } from '../../../../providers/core';

@Component({
    selector: 'form-perm-dialog',
    templateUrl: './form.html',
    encapsulation: ViewEncapsulation.None
})
export class PermDialogComponent implements OnInit {

    ComUrl;
    form;
    perm;

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<PermDialogComponent>
    ) {}

    ngOnInit() {}

    /**
     * Simpan
     * 
     * fungsi yang digunakan untuk menyimpan data ke database
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {
                    this.dialogRef.close(result);
                } else {
                    var Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);
                }
            },
            error => {
                console.error(error);
                this.core.OpenNotif(error);
            }
        );
    }
    //=> / END : Simpan

}
