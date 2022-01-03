import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { BroadcasterService } from 'ng-broadcaster';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-wbgrn',
    templateUrl: './form.html',
})
export class WBGrnFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    Checkedlist: any = [];
    disabled: boolean = false;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<WBGrnFormDialogComponent>,
        private dialog: MatDialog,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {

        if (this.form.id != 'add') {
            this.getSelected();
            this.disabled = true;

            this.form.list.create_date = moment(this.form.list.create_date).format('DD/MM/YYYY');
        } else {
            this.KontrakFilter('');
        }

    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
            this.disabled = false;
        }
    }

    Rupiah(val) {
        return this.core.rupiah(val);
    }

    /**
     * fungsi checkbox dinamis
     */
    Uncheckall() {
        for (var i = 0; i < this.form.list.length; i++) {
            this.form.list[i].check_list = this.form.check_all;
        }

        this.getSelected();
    }
    checkAllSelect() {
        this.form.check_all = this.form.list.every(function (item: any) {
            return item.check_list == true;
        });
        this.getSelected();
    }

    getSelected() {
        this.Checkedlist = [];
        this.form.check = null;

        var weigh_in: number = 0;
        var weigh_out: number = 0;
        var netto: number = 0;

        for (var i = 0; i < this.form.list.length; i++) {
            if (this.form.list[i].check_list) {

                this.Checkedlist.push(this.form.list[i]);
                this.form.check = true;

                /**
                 * Calculeate
                 */
                weigh_in += this.form.list[i].weigh_in;
                weigh_out += this.form.list[i].weigh_out;
                netto += this.form.list[i].netto;
                // => End Calculate

            }
        }

        this.form.tot_weigh_in = weigh_in;
        this.form.tot_weigh_out = weigh_out;
        this.form.tot_netto = netto;

        this.Checkedlist = JSON.stringify(this.Checkedlist);
    }
    // end fungsi checkbox dinamis

    Kontrak: any;
    KontrakFilter(val: string) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.kontrak', Params).subscribe(
                result => {

                    if (result) {
                        this.Kontrak = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    KontrakSelect(e, item) {

        if (e.isUserInput) {

            this.form.kontrak = item.id;
            this.form.list = item.transaksi;

            setTimeout(() => {
                $('*[name="note"]').focus();
            }, 100);
        }
    }
    KontrakRemove() {

        this.form.kontrak = null;
        this.form.kontrak_kode = null;
        this.form.list = null;

        this.form.check_all = null;
    }

    Simpan() {

        this.form.list_send = this.Checkedlist;

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

                    this.dialogRef.close(result);

                } else {
                    var Alert = {
                        error_msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);

                    this.Busy = false;
                }

            },
            error => {
                this.Busy = false;
                this.core.OpenNotif(error);
            }
        );

    }

    /**
     * Veriry
     */
    Verify() {
        swal({
            title: 'Please Confirm to Verify?',
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

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'Verified'
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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => End : Verify
}
