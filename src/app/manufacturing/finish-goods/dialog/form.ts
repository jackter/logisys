import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as _ from 'lodash';


@Component({
    selector: 'dialog-form-transfer-goods',
    templateUrl: './form.html'
})
export class FinishGoodsFormDialogComponent2 implements OnInit {

    public Com: any = {
        name: 'Transfer Finish Goods Detail',
        title: 'Transfer Finish Goods',
        icon: 'event_note',
    };

    Output: any = [];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl = "e/manufacturing/fg/";

    Busy;
    from_ap;

    DetailID;

    Delay;


    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<FinishGoodsFormDialogComponent2>

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

    /**
     * AC Storeloc
     */
    StoreItem: any = {};
    StoreKeep: any = [];
    StoreLast: any = {};
    StoreItemFilter(val, data, storelist) {

        if (!storelist) {
            data.storeloc_list_def = JSON.parse(JSON.stringify(data.storeloc_list));
            this.StoreItemFilter(val, data, data.storeloc_list_def);
            return false;
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
            data.stock2 = item.stock;
            data.price_receive = item.price_receive;

            setTimeout(() => {
                $('#other-qty-receive-' + i).focus();
            }, 100);

        }
    }
    StoreItemReset(item, i) {
        item.storeloc = null;
        item.storeloc_kode = null;
        item.storeloc_nama = null;
        item.price = null;
        item.stock2 = null;
        item.stock_def = null;

        setTimeout(() => {
            $('#other-store-' + i).focus();
        }, 100);
    }
    //=> End AC storeloc

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
                $('*[name="note"]').focus();
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
        // this.form.output = this.Output;

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
    Verify(rcv = null) {
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
                        receive_process: rcv
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
    Approve(rcv = null) {
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
                        company: this.form.company,
                        dept: this.form.dept,
                        storeloc: this.form.storeloc,
                        receive_process: rcv,
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
    Reject(rcv = null) {
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
                        kode: this.form.kode,
                        receive_process: rcv
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Material Request Rejected'
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