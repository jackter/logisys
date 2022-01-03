import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { ContractProgressPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-contract-progres',
    templateUrl: './form.html'
})
export class ContractProgresFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    List: any = [];
    ComUrl;
    Com;
    Busy;
    Delay;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ContractProgresFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Kontraktor = this.Default.kontraktor;

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

        if (this.form.id != 'add') {
            this.form.start_date_send = this.form.start_date;
            this.form.end_date_send = this.form.end_date;
            this.form.start_date = moment(this.form.start_date).format('DD/MM/YYYY');
            this.form.end_date = moment(this.form.end_date).format('DD/MM/YYYY');
            this.List = this.form.list;
        }
    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    AutoFocus(key) {
        this.CompanyRemove();
        this.KontraktorRemove();
        this.AgreementRemove();
        setTimeout(() => {
            $(key).focus();
        }, 100);
    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        setTimeout(() => {

            var val = this.form.company_nama;

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

        }, 0);

    }
    CompanySelect(e, item) {
        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            setTimeout(() => {
                $('*[name="kontraktor_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.CompanyFilter();
    }
    //=> / END : AC Company

    /**
     * AC Kontraktor
     */
    Kontraktor: any;
    KontraktorFilter(val: string) {

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.kontraktor) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Kontraktor = Filtered;
        } else {
            this.Kontraktor = this.Default.kontraktor;
        }
    }
    KontraktorSelect(e, item) {
        if (e.isUserInput) {
            this.form.kontraktor = item.id;
            this.form.kontraktor_kode = item.kode;
            this.form.kontraktor_nama = item.nama;

            setTimeout(() => {
                $('*[name="agreement_kode"]').focus();
            }, 100);

        }
    }
    KontraktorRemove() {
        this.form.kontraktor = null;
        this.form.kontraktor_kode = null;
        this.form.kontraktor_nama = null;
    }
    //=> END : AC Kontraktor

    /**
     * AC Agreement
     */
    Agreement: any;
    AgreementFilter(val) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                kontraktor: this.form.kontraktor,
                tanggal: moment(this.form.tanggal).format('YYYY-MM-DD'),
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list_agreement', Params).subscribe(
                result => {

                    if (result) {
                        this.Agreement = result;
                    }
                },
                error => {
                    console.error('Load Data', error);
                    this.core.OpenNotif(error);
                }

            );
        }, 100);
    }
    AgreementSelect(e, item) {
        if (e.isUserInput) {
            this.form.agreement = item.id;
            this.form.agreement_kode = item.kode;
            this.form.start_date = moment(item.start_date).format('DD/MM/YYYY');
            this.form.end_date = moment(item.end_date).format('DD/MM/YYYY');
            this.form.start_date_send = item.start_date;
            this.form.end_date_send = item.end_date;
            this.form.ppn = item.ppn;
            this.form.pph = item.pph;
            this.form.currency = item.currency;

            this.List = item.list;

            setTimeout(() => {
                $('*[name="remarks"]').focus();
            }, 100);
        }
    }
    AgreementRemove() {
        this.form.agreement = null;
        this.form.agreement_kode = null;
        this.form.ppn = null;
        this.form.pph = null;
        this.form.currency = null;
        this.form.start_date = null;
        this.form.end_date = null;
        this.List = null;
    }
    //=> END : AC Agreement

    Calculate(item) {
        setTimeout(() => {
            var sisa_progress = 100 - item.current_progress;
            if (item.progress > sisa_progress) {
                item.progress = sisa_progress;

            }

            var GrandTotal = 0;
            var Amount = 0;
            var TotalAmount = 0;
            var PPn = 0;
            var PPh = 0;

            if (item.progress) {
                Amount = item.rate * item.progress / 100;
            }

            item.amount = Amount;

            for (let item of this.List) {
                if (item.amount) {
                    TotalAmount += item.amount;
                }
            }

            this.form.total_amount = TotalAmount;

            if (this.form.total_amount) {
                PPn = this.form.ppn * this.form.total_amount / 100;
                PPh = this.form.pph * this.form.total_amount / 100;
                
            }

            this.form.total_ppn = PPn;
            this.form.total_pph = PPh;

            if (this.form.total_pph && this.form.total_ppn && this.form.total_amount) {
                GrandTotal = this.form.total_pph + this.form.total_ppn + this.form.total_amount;
            }

            this.form.grand_total = GrandTotal;
        }, 100);
    }

    /**
     * Simpan
     */
    Simpan() {

        swal({
            title: 'Please Confirm to Submit?',
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
                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    if (this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                    }

                    this.form.list = JSON.stringify(this.List);

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
            }
        );
    }
    //=> END : Simpan

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

                    /**
                     * Verify Continue
                     */
                    var Params = {
                        id: this.form.id,
                        notimeout: 1,
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
                    // => / END : Verify Continue

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
                        id: this.form.id
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Approved Rejected'
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

                    for (let item of this.List) {
                        item.total_progress = item.progress + item.current_progress;
                    }

                    var Params = {
                        id: this.form.id,
                        company: this.form.company,
                        kontraktor: this.form.kontraktor,
                        kontraktor_kode: this.form.kontraktor_kode,
                        agreement_kode: this.form.agreement_kode,
                        kode: this.form.kode,
                        kontrak_tipe: this.form.kontrak_tipe,
                        tanggal_send: this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD'),
                        cip: this.form.cip,
                        cip_kode: this.form.cip_kode,
                        currency: this.form.currency,
                        list: JSON.stringify(this.List),
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {
                            if(result.pihakketiga_coa == 0){
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);

                                this.Busy = false;
                            }
                            else if (result.status == 1) {
                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
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

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val, 2, true);
        } else {
            return 0;
        }
    }

    /** 
     * Dialog
    */
    dialogDetail: MatDialogRef<ContractProgressPrintDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    Print() {

        this.dialogDetail = this.dialog.open(
            ContractProgressPrintDialogComponent,
            this.dialogDetailConfig
        );

        this.dialogDetail.componentInstance.form = this.form;
        this.dialogDetail.componentInstance.Com = this.Com;

        /**
        * After Close
        */
        this.dialogDetail.afterClosed().subscribe(result => {

            this.dialogDetail = null;

        });

    }
    // => / END : Dialog
}