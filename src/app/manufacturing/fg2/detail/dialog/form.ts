import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { Core } from 'providers/core';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-transfer-goods',
    templateUrl: './form.html'
})
export class FinishGoods2FormDialogComponent implements OnInit {

    ComUrl;
    Com;
    Default: any = {};
    form: any = {};
    perm: any = {};

    Destination: any = [];

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    List: any = [];
    Delay;
    Busy: boolean;

    maxDate;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<FinishGoods2FormDialogComponent>
    ) { }

    ngOnInit() {
        
        if (this.form.id == 'add') {
            this.form.tanggal = this.DateToday;
            this.List = JSON.parse(JSON.stringify(this.Default.detail));
        } else {
            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();

            if(this.form.detail) {
                this.List = JSON.parse(JSON.stringify(this.form.detail));
            }
        }
    }

    setDate(val, model) {
        if (val) {
            this.form[model] = moment(val, 'DD/MM/YYYY').format('DDMMYYYY').toString();
        }
    }

    FilterDestination(item) {
        
        this.Destination = [];

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            var Params = {
                company: this.Default.company,
                plant: this.Default.plant,
                keyword: item.destination_kode,
                tipe: item.tipe
            };
            
            this.core.Do(this.ComUrl + 'list.destination', Params).subscribe(
                result => {

                    if(result.destination) {
                        this.Destination = result.destination;
                    }
                },
                error => {
                    console.log('GetData', error);
                    this.core.OpenAlert(error);
                }
            );
        }, 250);

    }

    SelectDestination(e, item, i){

        if (e.isUserInput) {      
                        
            this.List[i].destination = item.id;
            this.List[i].destination_kode = item.kode;

            if(this.List[i].tipe == 1) {
                this.List[i].storeloc = item.id;
                this.List[i].storeloc_kode = item.kode;
                this.List[i].storeloc_nama = item.nama;
            } else {
                this.List[i].jo = item.id;
                this.List[i].jo_kode = item.kode;
                this.List[i].storeloc = item.storeloc;
                this.List[i].storeloc_kode = item.storeloc_kode;
                this.List[i].storeloc_nama = item.storeloc_nama;
            }

            this.Destination = [];
        }
    }

    RemoveDestination(item) {
        item.destination = null;
        item.destination_kode = null;
    }

    CheckQty(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            var Outstanding: number = item.stock_def;

            item.stock = Outstanding - item.qty;

            if (item.qty > Outstanding) {
                item.qty = Outstanding;
                item.stock = 0;
            }
        }, 250);
    }

    RefreshDestination(item, i) {

        this.List[i].destination = null;
        this.List[i].destination_kode = null;

        if(item.tipe == 1) {
            this.List[i].storeloc = null;
            this.List[i].storeloc_kode = null;
            this.List[i].storeloc_nama = null;
        } else {
            this.List[i].jo = null;
            this.List[i].jo_kode = null;
            this.List[i].storeloc = null;
            this.List[i].storeloc_kode = null;
            this.List[i].storeloc_nama = null;
        }
    }

    Simpan() {

        swal({
            title: 'Please Confirm to Save?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel'
        }).then(
            result => {
                
                if(result.value) {
                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    this.form.list = JSON.stringify(this.List);

                    this.form.company = this.Default.company;
                    this.form.company_abbr = this.Default.company_abbr;
                    this.form.company_nama = this.Default.company_nama;
                    this.form.dept = this.Default.dept;
                    this.form.dept_abbr = this.Default.dept_abbr;
                    this.form.dept_nama = this.Default.dept_nama;
                    this.form.jo = this.Default.id;
                    this.form.jo_kode = this.Default.kode;
                    
                    if(this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');
                    }

                    this.Busy = true;
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                this.core.OpenAlert({
                                    type: 'success',
                                    title: 'Success',
                                    msg: `
                                        Your Request has been saved as draft. Please verify and approve the request to continue the process.
                                    `
                                });

                                this.dialogRef.close(result);
                                
                            } else {
                                this.Busy = false;

                                this.core.OpenAlert({
                                    msg: result.error_msg
                                });
                            }
                        },
                        error => {
                            this.Busy = false;

                            this.core.OpenNotif(error);
                            console.error('Simpan', error);
                        }
                    );
                }
            }
        );        
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
        confirmButtonText: 'Verify',
        cancelButtonText: 'Cancel'
    }).then(
        result => {

            if (result.value) {

                var Params = {
                    id: this.form.id,
                    kode: this.form.kode,
                    notimeout: 1
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
                    notimeout: 1
                };

                this.Busy = true;
                this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                    result => {

                        if (result.status == 1) {

                            var Success = {
                                type: 'success',
                                showConfirmButton: false,
                                title: 'Approve Complete',
                                msg: 'Your Request will Continue to Approval Receive'
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

ApproveRcv() {
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
                    notimeout: 1
                };

                this.Busy = true;
                this.core.Do(this.ComUrl + 'approve_rcv', Params).subscribe(
                    result => {

                        if (result.status == 1) {

                            var Success = {
                                type: 'success',
                                showConfirmButton: false,
                                title: 'Approve Complete',
                                msg: 'Your Request Has Been Approved'
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
                        console.error('Approve Rcv', error);
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
                                msg: 'Your Request Rejected'
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