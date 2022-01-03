import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';

import swal from 'sweetalert2';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-dialog-receive',
    templateUrl: './form.html'
})
export class ReceiveFGFormDialogComponent implements OnInit {

    Output: any[];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;

    Com;
    Busy;

    DetailID;

    Delay;

    minDate = moment(new Date()).subtract(10, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        public core: Core,
        private dialogRef: MatDialogRef<ReceiveFGFormDialogComponent>

    ) {


    }

    ngOnInit() {

        if (this.form.id == 'add') {

            var ID = this.form.id;

            this.form = JSON.parse(JSON.stringify(this.Default.TFG));
            this.form.id = ID;

            this.Output = this.Default.TFG.output;

        } else {

            this.Output = this.form.output;

            this.ReadytoSave = 1;

        }

    }

    focusTo(target) {
        setTimeout(() => {
            $(target).focus();
        }, 50);
    }

    /**
     * AC Storeloc
     */
    ReadytoSave;
     
    StoreItem: any = {};
    StoreKeep: any = [];
    StoreLast: any = {};
    StoreItemFilter(val, data, storelist) {

        if (!storelist) {
            data.storeloc_list_def = JSON.parse(JSON.stringify(data.storeloc_list));
            this.StoreItemFilter(val, data, data.storeloc_list_def);
            return false;
        }

        if (data.storeloc != null) {
            this.ReadytoSave = 1;
        } else {
            this.ReadytoSave = null;
        }

        if (val && val != '') {

            let i = 0;
            let Filtered = [];
            for (let item of storelist) {

                var Combine = item.storeloc_kode + ' : ' + item.storeloc_nama;
                if (
                    item.storeloc_kode.toLowerCase().indexOf(val) != -1 ||
                    item.storeloc_nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }

            data.storeloc_list = Filtered;

        } else {
            data.storeloc_list = JSON.parse(JSON.stringify(data.storeloc_list_def));
        }

    }
    StoreItemSelect(e, item, data, i) {
        if (e.isUserInput) {

            data.storeloc = item.storeloc;
            data.storeloc_kode = item.storeloc_kode;
            data.storeloc_nama = item.storeloc_nama;
            data.stock = item.stock;
            data.price_receive = item.price_receive;

            setTimeout(() => {
                $('#output-qty-receive-' + i).focus();
            }, 100);

        }
    }
    StoreItemReset(item, i) {
        item.storeloc = null;
        item.storeloc_kode = null;
        item.storeloc_nama = null;
        item.price = null;
        item.stock = null;

        this.ReadytoSave = null;

        setTimeout(() => {
            $('#other-store-' + i).focus();
        }, 100);
    }
    //=> End AC storeloc
    

    /**
     * Calculate
     */

    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var outstanding: number = item.outstanding_def;

            item.outstanding = outstanding - item.qty_receive;

            if (item.qty_receive > outstanding) {
                item.qty_receive = outstanding;
                item.outstanding = 0;
            }

        }, 100);
    }
    //=> End Calculate

    /**
    * simpan
    */
    Simpan() {

        this.form.output = JSON.stringify(this.Output);
        this.form.tanggal_receive = moment(this.form.tanggal).format('YYYY-MM-DD');


        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        console.log(this.form);

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Save Complete',
                        msg: 'Your Request will Continue to Approval Process'
                    };
                    this.core.OpenAlert(Success);
                    this.dialogRef.close(result);
                } else {
                    this.Busy = false;
                }
            },
            error => {
                this.Busy = false;

                this.core.OpenNotif(error);
                console.error('Simpan', error);
            }
        );

    }
    // => End Simpan

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
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

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

    /**
     * Approve
     */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Approve',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                        tanggal: this.form.tanggal,
                        notimeout: 1,
                        company: this.form.company,
                        dept: this.form.dept,
                        detail: JSON.stringify(this.Output)
                    };

                    // console.log(this.Output);

                    this.Busy = true;
                    this.core.Do(this.ComUrl + '/approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'Receive Finish Goods Complete'
                                };
                                this.core.OpenAlert(Success);

                                result.approve = 1;

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
                            console.error('Approve', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> / END : Approve

    /**
     * Reject
     */
    Reject() {
        swal({
            title: 'Please Confirm to Reject?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Receive Finish Goods Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "MR Rejected"
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
                            console.error('Reject', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> / END : Reject


}
