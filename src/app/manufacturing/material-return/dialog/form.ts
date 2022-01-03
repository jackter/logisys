import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-material_return',
    templateUrl: './form.html',
    styleUrls: ['../material-return.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MaterialReturnFormDialogComponent implements OnInit {

    ComUrl;
    Com;
    Busy;
    form: any = {};
    perm: any = {};
    Delay: any;
    Default: any = {};

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<MaterialReturnFormDialogComponent>,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        if (this.form.id != 'add') {
            this.ReadySave = 1;

            for (let item of this.form.list) {
                for (let detail of this.form.detail_return) {
                    
                    if (item.id == detail.id_deliver_detail) {
                        item.qty_return = detail.qty_return;
                        item.id_deliver_detail = detail.id_deliver_detail;
                        item.remarks = detail.remarks;
                    } else {
                        item.qty_return = 0;
                    }
                }

            }
        }
    }

    /**
     * Calculate Class
     */
    ReadySave: number = 0;
    Calculate(item) {

        this.ReadySave = 0;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Max: number = item.qty_max_return;

            if (item.qty_return > Max) {
                item.qty_return = Max;
            }

            var TotalQty = 0;
            for (let item of this.form.list) {
                if (item.qty_return) {
                    TotalQty += Number(item.qty_return);
                }
            }

            console.log(TotalQty);
            

            if (TotalQty > 0) {
                this.ReadySave = 1;
            }

        }, 100);

    }
    // => / END : Class

    /**
     * AC RGR Code
     */
    DeliverCode: any;
    DeliverCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.kode', Params).subscribe(
                result => {

                    if (result) {
                        this.DeliverCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);

    }
    DeliverCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.deliver = item.id;
            this.form.deliver_kode = item.kode;
            this.form.receive = item.rcv;
            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;
            this.form.list = item.list;

            var Total_Qty_Return = 0;

            for (let part of item.list) {
                Total_Qty_Return += part.qty_return;

            }
            this.form.list.total_qty_return = Total_Qty_Return;
            console.log(this.form);

            // setTimeout(() => {
            //     $('*[name="tanggal"]').focus();
            // }, 100);

        }

    }
    DeliverCodeRemove() {

        this.form.deliver = null;
        this.form.deliver_kode = null;
        this.form.receive = null;
        this.form.company_abbr = null;
        this.form.dept_abbr = null;

    }
    // => END : AC RGR Code

    /**
     * Simpan
     */
    Simpan() {

        this.form.list_send = JSON.stringify(this.form.list);

        if (this.form.tanggal) {
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
        }

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
    // => END : Simpan

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
    // => / END : Verify

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

                    this.form.list_send = JSON.stringify(this.form.list);

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                        list_send: this.form.list_send,
                        company: this.form.company,
                        dept: this.form.dept,
                        tanggal: this.form.tanggal
                    };

                    console.log(Params);

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'Material Return Approved'
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
    // => / END : Approve

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
                                    msg: 'Material Return Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MR Rejected'
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
    // => / END : Reject

}
