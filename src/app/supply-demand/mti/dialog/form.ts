import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-mt',
    templateUrl: './form.html'
})
export class MTIFormDialogComponent implements OnInit {

    List: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<MTIFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;

        /**
         * Check Company
         * 
         * Jika Company hanya 1, maka system akan melakukan Autoselect
         * dan Mematikan fungsi Auto Complete
         */
        this.CompanyLen = Object.keys(this.Company).length;
        if (this.CompanyLen == 1) {
            this.form.company = this.Company[0].id;
            this.form.company_abbr = this.Company[0].abbr;
            this.form.company_nama = this.Company[0].nama;
        }
        // => / Check Company

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;
            }

        }
        // => / END : Form Edit

    }

    Focus(){
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 250);
    }

    /**
     * Calculate Class
     */
    ReadySave: number = 0;
    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Receipt: number = item.qty_mto_os;

            if (item.qty > Receipt) {
                item.qty = Receipt;
            }

        }, 100);

    }
    // => / END : Class

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        var val = this.form.company_nama;

        if (val != this.CompanyLast) {
            this.form.company = null;
            this.form.company_abbr = null;
        }

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

            this.CompanyLast = item.nama;

            setTimeout(() => {
                $('*[name="mto_kode"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {

        $('#company_nama').blur();

        this.form.company_nama = '';
        setTimeout(() => {
            this.CompanyFilter();
        }, 100);
    }
    // => / END : AC Company

    /**
     * AC MTO Code
     */
    MTOCode: any;
    MTOCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.mto', Params).subscribe(
                result => {

                    if (result) {

                        this.MTOCode = result;
                        
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);

    }
    MTOCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.mto_kode = item.kode;
            this.form.mto = item.id;
            this.form.company_from = item.company;
            this.form.company_abbr_from = item.company_abbr;
            this.form.company_nama_from = item.company_nama;
            this.form.company_to = item.company_to;
            this.form.company_abbr_to = item.company_abbr_to;
            this.form.company_nama_to = item.company_nama_to;
            this.form.from_storeloc = item.from_storeloc;
            this.form.from_storeloc_kode = item.from_storeloc_kode;
            this.form.to_storeloc = item.to_storeloc;
            this.form.to_storeloc_kode = item.to_storeloc_kode;
            this.form.list = item.list;
            
            setTimeout(() => {
                $('*[name="remarks"]').focus();
            }, 100);

        }

    }
    MTOCodeRemove() {

        this.form.mto_kode = null;
        this.form.mto = null;
        this.form.from_storeloc = null;
        this.form.from_storeloc_kode = null;
        this.form.to_storeloc = null;
        this.form.to_storeloc_kode = null;
        this.form.list = null;
    }
    // => END : AC MTO Code

    /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.form.list = JSON.stringify(this.form.list);
        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Request Saved',
                        msg: 'Please Verify your input to confirm and continue the process!'
                    };
                    this.core.OpenAlert(Success);

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
                this.Busy = false;
                console.error('Simpan', error);
            }
        );

    }
    // => / END : Simpan

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

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MT Verified'
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
    // => / END : Verify

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

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Material Transfer Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MT Rejected'
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

    /**
     * Approve
     */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
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

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MT Approved'
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

}
