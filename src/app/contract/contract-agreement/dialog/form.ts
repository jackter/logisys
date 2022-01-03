import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { ContractAgreementPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-contract-agreement',
    templateUrl: './form.html'
})
export class ContractAgreementFormDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<ContractAgreementFormDialogComponent>
    ){

    }

    ngOnInit(){
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

        if(this.form.id != 'add') {
            if(this.form.dp == 2 && this.form.is_detail){
                this.form.dp_amount = this.form.dp_percent;
            }
            if(this.form.start_date) {
                this.form.start_date_show = moment(this.form.start_date).format('DD/MM/YYYY');
            }

            if(this.form.end_date) {
                this.form.end_date_show = moment(this.form.end_date).format('DD/MM/YYYY');
            }

            this.List = this.form.list;
        }
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

        }, 0);

    }
    CompanySelect(e, item) {
        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            this.CompanyLast = item.nama;

            setTimeout(() => {
                $('*[name="spk_kode"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
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
            this.form.kontraktor        = item.id;
            this.form.kontraktor_kode   = item.kode;
            this.form.kontraktor_nama   = item.nama;

            setTimeout(() => {
                $('*[name="req_kode"]').focus();
            }, 100);
        }
    }
    KontraktorRemove() {
        this.form.kontraktor        = null;
        this.form.kontraktor_kode   = null;
        this.form.kontraktor_nama   = null;
    }
    //=> END : AC Kontraktor

    /**
     * Load Kontrak Req
     */
    Kontrak: any;
    KontrakFilter(val) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                tanggal: moment(this.form.tanggal).format('YYYY-MM-DD'),
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.kontrak', Params).subscribe(
                result => {

                    if (result) {
                        this.Kontrak = result.kontrak;
                    }
                },
                error => {
                    console.error('Load Data', error);
                    this.core.OpenNotif(error);
                }

            );
        }, 100);
    }
    KontrakSelect(e, item) {
        if (e.isUserInput) {
            this.form.req               = item.id;
            this.form.req_kode          = item.kode;
            this.form.start_date_show   = moment(item.start_date, 'YYYY-MM-DD').format('DD/MM/YYYY');
            this.form.end_date_show     = moment(item.end_date, 'YYYY-MM-DD').format('DD/MM/YYYY');

            this.List                   = item.list;

            this.TotalAmount();

            setTimeout(() => {
                $('*[name="currency"]').focus();
            }, 100);
        }
    }
    KontrakRemove() {
        this.form.req           = null;
        this.form.req_kode      = null;
        this.form.start_date    = null;
        this.form.end_date      = null;

        this.List = null;
    }
    //=> END : AC Kontrak Req

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    AutoFocus(key) {
        this.CompanyRemove();
        this.KontraktorRemove();
        this.KontrakRemove();
        setTimeout(() => {
            $(key).focus();
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

                    if(this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                    }

                    if(this.form.start_date_show) {
                        this.form.start_date_send = moment(this.form.start_date_show, 'DD/MM/YYYY').format('YYYY-MM-DD');
                    }

                    if(this.form.end_date_show) {
                        this.form.end_date_send = moment(this.form.end_date_show, 'DD/MM/YYYY').format('YYYY-MM-DD');
                    }
                    
                    for(let item of this.List) {
                        if(item.tanggal) {
                            item.tanggal_send = moment(item.tanggal).format('YYYY-MM-DD');
                        }
                    }

                    /**
                     * Get DP Percent
                     */
                    if(this.form.dp_amount) {
                        if(this.form.dp == 1) {
                            this.form.dp_percent = Number(this.form.dp_amount) / Number(this.form.grand_total) * 100;
                            this.form.dp_amount_show = this.form.dp_amount;

                        }
                        if(this.form.dp == 2) {
                            this.form.dp_percent = this.form.dp_amount;
                            this.form.dp_amount_show = Number(this.form.grand_total) * Number(this.form.dp_amount) / 100;
                        }
                    }
                    //=> END : Get DP Percent

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

                    var Params = {
                        id: this.form.id,
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

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
        if(val) {
            return this.core.rupiah(val, 2, true);
        }
    }

    /**
     * Set PPh
     */
    SetPPh() {

        if (this.form.pph_code) {
            var PPh = this.Default.pph;
            PPh = this.core.FJSON2(PPh, 'code', this.form.pph_code);
            PPh = PPh[0];

            this.form.pph = PPh.rate;

        } else {
            this.form.pph = 0;
        }

        this.TotalAmount();

    }
    // => / END : Set PPh

    CalculateAmount(item) {

        var Amount = 0;
        if(item.rate) {
            Amount = item.volume * item.rate;
            item.amount = Amount;
        }

        this.TotalAmount();
    }

    TotalAmount() {
        var TotalAmount = 0;
        for(let item of this.List) {
            TotalAmount += Number(item.amount);
        }

        var PPN = 0;
        if(this.form.ppn) {
            PPN = TotalAmount * 10 / 100;
        }

        var PPH = 0;
        if(this.form.pph) {
            PPH = TotalAmount * this.form.pph / 100;
        }

        this.form.total_amount = TotalAmount;
        this.form.total_ppn = PPN;
        this.form.total_pph = PPH;
        this.form.grand_total = TotalAmount + PPN - PPH;
    }

    /** 
     * Dialog
    */
    dialogDetail: MatDialogRef<ContractAgreementPrintDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    Print() {

        this.dialogDetail = this.dialog.open(
            ContractAgreementPrintDialogComponent,
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