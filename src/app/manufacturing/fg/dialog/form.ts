import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    selector: 'dialog-form-transfer-goods',
    templateUrl: './form.html'
})
export class FinishGoodsFormDialogComponent implements OnInit {

    public Com: any = {
        name: 'Transfer Finish Goods Detail',
        title: 'Transfer Finish Goods',
        icon: 'event_note',
    };

    Output: any = [];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;

    Busy;
    from_ap;

    DetailID;

    Delay;

    minDate = moment(new Date()).subtract(10, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<FinishGoodsFormDialogComponent>

    ) {


    }

    ngOnInit() {

        if (this.from_ap == 1) {
            this.form = this.Default.JO;
            this.Output = this.Default.JO.output;
        } else {

            this.Store = this.Default.storeloc;

            if (this.form.id != 'add') {
                this.Output = this.form.output;
                this.ReadytoSave = 1;
            }

        }

    }

    Focus(){
        setTimeout(() => {
            $('*[name="note"]').focus();
        }, 250);
    }


    Store: any = [];
    StoreSelect(e, item) {

        if (e.isUserInput) {

            this.form.storeloc = item.storeloc;
            this.form.storeloc_kode = item.storeloc_kode;
            this.form.storeloc_nama = item.storeloc_nama;
            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.Output = item.item;

            setTimeout(() => {
                $('*[name="tanggal"]').focus();
            }, 250);
        }

    }
    ClearStore() {
        this.form.storeloc = null;
        this.form.storeloc_kode = null;
        this.form.storeloc_nama = null;
        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;
        this.Output = null;
    }


    /**
     * Calculate
     */
    ReadytoSave;
    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var stock: number = item.stock_def;

            item.stock = stock - item.qty_send;

            if (item.qty_send > stock) {
                item.qty_send = stock;
                item.stock = 0;
            }

            if (item.qty_send != null) {
                this.ReadytoSave = 1;
            } else {
                this.ReadytoSave = null;
            }

        }, 100);

    }
    //=> End Calculate

    FillAll() {

        for (let item of this.Output) {

            item.qty_send = item.stock;

            if (item.qty_send > 0) {
                this.ReadytoSave = 1;
            }
        }
    }

    EmptyAll() {

        for (let item of this.Output) {

            item.qty_send = 0;

        }

        this.ReadytoSave = 0;
    }

    /**
    * simpan
    */
    Simpan() {

        this.form.output = JSON.stringify(this.Output);
        
        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        if (this.from_ap == 1) {
            var URL = this.ComUrl + 'add';
        } else {

            var URL = this.ComUrl + 'edit';
            if (this.form.id == 'add' && this.form.is_reception != 1) {
                URL = this.ComUrl + 'add';
            }
        }

        // console.log(URL, this.form);

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {
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
                        company: this.form.company,
                        dept: this.form.dept,
                        storeloc: this.form.storeloc,
                        detail: JSON.stringify(this.Output)
                    };                    

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Job Order now available for Actual Production'
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
                                    msg: 'Transfer Finish Goods Rejected'
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

    /**
     * Receive Materials
     */
    ButtonReceive() {
        this.form.is_detail = false;

        setTimeout(() => {
            $('#other-store-0').focus();
        }, 100);
    }
    //=> / END : Receive Materials

}