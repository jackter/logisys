import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { BroadcasterService } from 'ng-broadcaster';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-vehicle',
    templateUrl: './form.html'
})
export class VehicleFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;
    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<VehicleFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) { }

    ngOnInit() {

    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
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
                    this.broadcaster.broadcast('reload', true);
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
    // => END : Simpan

    /**
     *  AC Transporter
     */
    Transporter: any;
    TransporterFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.transporter', Params).subscribe(
                result => {

                    if (result) {

                        this.Transporter = result.data;

                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }

    TransporterSelect(e, item) {

        if (e.isUserInput) {

            this.form.transporter = item.id;
            this.form.transporter_nama = item.nama;

            setTimeout(() => {
                $('*[name="expire_date"]').focus();
            }, 100);

        }
    }
    
    TransporterRemove() {
        this.form.transporter = null;
        this.form.transporter_kode = null;
        this.form.transporter_nama = null;
    }
    // => END : AC Transporter
}
