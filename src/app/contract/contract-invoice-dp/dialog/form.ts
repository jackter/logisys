import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { ContractInvoiceDpPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-contract-invoice-dp',
    templateUrl: './form.html'
})
export class ContractInvoiceDpFormDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<ContractInvoiceDpFormDialogComponent>
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

            this.List = this.form.list;
            this.TotalAmount();
            
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

        this.KontraktorRemove();
        this.KontrakRemove();

        this.Company = this.Default.company;
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
                if(this.form.other_invoice_type == 1){
                    $('*[name="agreement_kode"]').focus();
                }
                else{
                    $('*[name="invoice_kode"]').focus();
                }
            }, 100);
        }
    }
    KontraktorRemove() {
        this.form.kontraktor        = null;
        this.form.kontraktor_kode   = null;
        this.form.kontraktor_nama   = null;

        this.KontrakRemove();
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
                kontraktor: this.form.kontraktor,
                tanggal: moment(this.form.tanggal).format('YYYY-MM-DD'),
                other_invoice_type: this.form.other_invoice_type,
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
            this.form.agreement             = item.id;
            this.form.agreement_kode        = item.kode;
            this.form.ppn                   = item.ppn;
            this.form.pph                   = item.pph;
            this.form.pph_code              = item.pph_code;
            this.form.currency              = item.currency;
            this.form.payment_retention     = item.payment_retention;
            this.form.dp_percent            = item.dp_percent;
            this.List                       = item.list;

            this.TotalAmount();

            setTimeout(() => {
                $('*[name="remarks"]').focus();
            }, 100);
        }
    }
    KontrakRemove() {
        this.form.agreement             = null;
        this.form.agreement_kode        = null;
        this.List                       = null;
    }
    //=> END : AC Kontrak Agreement

    /**
     * Load Kontrak Req
     */
    Invoice: any;
    InvoiceFilter(val) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                kontraktor: this.form.kontraktor,
                tanggal: moment(this.form.tanggal).format('YYYY-MM-DD'),
                other_invoice_type: this.form.other_invoice_type,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.invoice', Params).subscribe(
                result => {

                    if (result) {
                        this.Invoice = result.invoice;                        
                    }
                },
                error => {
                    console.error('Load Data', error);
                    this.core.OpenNotif(error);
                }

            );
        }, 100);
    }
    InvoiceSelect(e, item) {
        if (e.isUserInput) {
            this.form.invoice               = item.id;
            this.form.incoice_kode          = item.kode;
            this.form.agreement             = item.agreement;
            this.form.agreement_kode        = item.agreement_kode;
            this.form.ppn                   = item.ppn;
            this.form.pph                   = item.pph;
            this.form.pph_code              = item.pph_code;
            this.form.currency              = item.currency;
            this.form.payment_retention     = item.payment_retention;
            this.List                       = item.list;

            this.TotalAmount();

            setTimeout(() => {
                $('*[name="remarks"]').focus();
            }, 100);
        }
    }
    InvoiceRemove() {
        this.form.invoice             = null;
        this.form.invoice_kode        = null;
        this.List                     = null;
    }
    //=> END : AC Kontrak Agreement

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
        this.form.dp_total = this.form.grand_total / 100 * this.form.dp_percent;   
    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
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

                    if(this.form.start_date) {
                        this.form.start_date_send = moment(this.form.start_date).format('YYYY-MM-DD');
                    }

                    if(this.form.end_date) {
                        this.form.end_date_send = moment(this.form.end_date).format('YYYY-MM-DD');
                    }

                    if(this.form.other_invoice_type == 1){
                        this.form.total_amount = this.form.total_amount / 100 * this.form.dp_percent;
                        this.form.total_ppn = this.form.total_ppn / 100 * this.form.dp_percent;
                        this.form.total_pph = this.form.total_pph / 100 * this.form.dp_percent;
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

                    // var Params = {
                    //     id: this.form.id,
                    //     list: JSON.stringify(this.List),
                    //     enable_journal : this.form.enable_journal,
                    //     notimeout: 1
                    // };

                    var Params = {
                        id: this.form.id,
                        company: this.form.company,
                        kontraktor: this.form.kontraktor,
                        kontraktor_kode: this.form.kontraktor_kode,
                        currency: this.form.currency,
                        list: JSON.stringify(this.List),
                        enable_journal : this.form.enable_journal,
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
        return this.core.rupiah(val, 2, true);
    }

    date(val) {
        if(val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

    /** 
     * Dialog
    */
    dialogDetail: MatDialogRef<ContractInvoiceDpPrintDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    Print() {

        this.dialogDetail = this.dialog.open(
            ContractInvoiceDpPrintDialogComponent,
            this.dialogDetailConfig
        );

        this.dialogDetail.componentInstance.form = this.form;
        this.dialogDetail.componentInstance.Com = this.Com;
        this.dialogDetail.componentInstance.List = this.List;

        /**
        * After Close
        */
        this.dialogDetail.afterClosed().subscribe(result => {

            this.dialogDetail = null;

        });

    }
    // // => / END : Dialog
}