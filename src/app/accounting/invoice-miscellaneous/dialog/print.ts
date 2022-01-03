import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from "providers/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-invoice-miscellaneous',
    templateUrl: './print.html',
    styleUrls: [
        '../invoice-miscellaneous.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class InvoiceMiscellaneousPrintDialogComponent implements OnInit {

    WaitPrint: boolean;
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<InvoiceMiscellaneousPrintDialogComponent>,
    ) {

    }

    ngOnInit() {
        this.form.ref_kode = this.form.ref_kode.toString();        
    }

    date_indo(val) {
        if(val) {
            return moment(val).format('DD/MM/YYYY');
        } else {
            return '-';
        }
    }

    /**
     * Verify
     */
    Verify() {
        swal({
            title: 'Please Confirm to Verify?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );
                }
            }
        );
    }
    //=> / END : Verify

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'INVOICE DOWN MISCELLANEOUS NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

    rupiah(val) {
        return this.core.rupiah(val);
    }
}
