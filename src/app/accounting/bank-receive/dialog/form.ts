import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';
import { BankReceiveDialogPrintComponent } from './print';
import { PenerimaanDialogPrintComponent } from './print2';

@Component({
    selector: 'dialog-form-btu',
    templateUrl: './form.html'
})
export class BankReceiveDialogFormComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;
    gridApi: any;
    Delay;
    Detail: any[] = [{
        i: 0
    }];

    Customer: any = [];
    CompanyBank: any = {};

    Ready = false;

    ReadyApprove = true;

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    DetailDel: any[] = [];

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<BankReceiveDialogFormComponent>,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.Company = this.Default.company;
        this.Customer = this.Default.customer;
        this.CompanyBank = this.Default.company_bank;
        this.Subjek = this.Default.subjek;

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
            for(let item of this.form.detail){
                if(item.coa == 0){
                    this.ReadyApprove = false;
                    break;
                }
            }

            this.form.terbilang = this.core.terbilang_koma(this.form.total, this.form.currency);
        }

    }

    /*AC Company*/
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter(val): void {
        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            const Filtered = [];
            for (const item of this.Default.company) {
                const Combine = item.nama + '(' + item.abbr + ')';

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

    CompanySelect(e, item): void {
        if (e.isUserInput) {
            setTimeout(() => {

                this.form.company = item.id;
                this.form.company_nama = item.nama;
                this.form.company_abbr = item.abbr;

                this.InitCompanyBankFilter();

                setTimeout(() => {
                    $('*[name="tanggal"]').focus();
                    $('*[name="tanggal"]').click();
                }, 100);

            }, 100);
        }

    }
    // => / END : AC Company

    /*AC Company*/
    InitCompanyBankFilter() {
        let i = 0;
        let Filtered = [];
        for (let item of this.Default.company_bank) {

            if (this.form.company == item.company) {
                Filtered[i] = item;
                i++;
            }

        }
        this.CompanyBank = Filtered;
    }

    CompanyBankFilter(val): void {
        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            const Filtered = [];
            for (const item of this.Default.company_bank) {
                const Combine = item.bank_nama + '(' + item.no_rekening + ')';

                if (
                    (item.no_rekening.toString().toLowerCase().indexOf(val) != -1 ||
                        item.bank_nama.toString().toLowerCase().indexOf(val) != -1 ||
                        Combine.toString().toLowerCase().indexOf(val) != -1) && this.form.company == item.company
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }
            this.CompanyBank = Filtered;
        } else {
            this.InitCompanyBankFilter();
        }
    }

    CompanyBankSelect(e, item): void {
        if (e.isUserInput) {
            setTimeout(() => {
                this.form.bank = item.bank;
                this.form.company_bank = item.id;
                this.form.bank_kode = item.bank_kode;
                this.form.bank_nama = item.bank_nama;
                this.form.no_rekening = item.no_rekening;
                this.form.bank_coa = item.coa;
                this.form.bank_coa_kode = item.coa_kode;
                this.form.bank_coa_nama = item.coa_nama;
                this.form.currency = item.currency;

                setTimeout(() => {
                    $('*[name="reff_type"]').focus();
                    $('*[name="reff_type"]').click();
                }, 100);
            }, 100);
        }

    }
    // => / END : AC Company

    /*AC Customer*/
    CustomerFilter(val): void {
        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            const Filtered = [];
            for (const item of this.Default.customer) {
                const Combine = item.nama + '(' + item.kode + ')';

                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }
            this.Customer = Filtered;
        } else {
            this.Customer = this.Default.customer;
        }
    }

    CustomerSelect(e, item): void {
        if (e.isUserInput) {
            setTimeout(() => {

                this.form.customer = item.id;
                this.form.customer_nama = item.nama;
                this.form.customer_kode = item.kode;

            }, 100);
        }

    }
    // => / END : AC Customer

    tanggalChange() {
        setTimeout(() => {
            $('*[name="bank_nama"]').focus();
            $('*[name="bank_nama"]').click();
        }, 100);
    }

    delDetail() {
        this.Detail = [];
        this.Reff = [];

        setTimeout(() => {
            if (this.form.reff_type == 1) {
                $('*[name="customer_nama"]').focus();
                $('*[name="customer_nama"]').click();
            }
        }, 100);
    }

    /**
    * AC COA
    */
    Reff: any;
    ReffFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            this.Reff = [];

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                customer: this.form.customer,
                currency: this.form.currency,
                detail_send: JSON.stringify(this.Detail),
                keyword: val
            };

            if(this.form.reff_type == 1){
                this.core.Do(this.ComUrl + 'reff.list', Params).subscribe(
                    result => {
    
                        if (result.data) {
                            this.Reff = result.data;
                        }
    
                    },
                    error => {
                        console.error('Reff Filter', error);
                        this.core.OpenNotif(error);
                    }
                );
            }

        }, 100);

    }
    ReffSelect(e, item, i) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.Detail, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {
                    this.Detail[i].reff_id = item.id;
                    this.Detail[i].reff_kode = item.kode;
                    this.Detail[i].reff_tipe = item.tipe;
                    this.Detail[i].total = item.amount;
                    this.Detail[i].max_total = item.amount - item.payment_amount;
                    this.Detail[i].coa = item.coa;
                    this.Detail[i].coa_nama = item.coa_nama;
                    this.Detail[i].coa_kode = item.coa_kode;

                    if (this.Detail[i].total > this.Detail[i].max_total) {
                        this.Detail[i].total = this.Detail[i].max_total;
                    }
                } else {
                    this.Detail[i].reff_kode = '';
                }

                this.Reff = [];

                this.ChangeDetailValue(item);
                this.ChangeValue();

            }, 50);

        }

    }
    ReffRemove(item) {

        item.reff_id = null;
        item.reff_kode = null;
        item.coa = 0;
        item.coa_kode = null;
        item.coa_nama = null;
        item.total = null;

        this.ChangeDetailValue(item);

    }
    // => End AC COA

    /**
     * Subjek
     */
    Subjek : any = [];
    SubjekFilter(val) {
        
        if (val) {
            val = val.toString().toLowerCase();

            var i = 0;
            var Filtered = [];
            for (let item of this.Default.subjek) {
                if (
                    item.nama.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }
            this.Subjek = Filtered;
        } else {
            this.Subjek = this.Default.subjek;
        }
    }

    SubjekSelect(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.form.subjek = item.id;
                this.form.subjek_nama = item.nama;

            }, 100);
        }
    }
    SubjekReset() {
        this.form.subjek = null;
        this.form.subjek_nama = null;
    }
    // => / END : AC Subjek

    Total;
    Terbilang;

    /**
    * AC COA
    */
    COA: any;
    WaitItem: any[] = [];
    COAFilter(val: string) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };

                this.core.Do(this.ComUrl + 'coa.list', Params).subscribe(
                    result => {

                        if (result) {
                            this.COA = result;
                        }

                    },
                    error => {
                        console.error('Coa Filter', error);
                        this.core.OpenNotif(error);
                    }

                );

            }, 100);

        }

    }
    COASelect(e, item, i) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.Detail, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {
                    this.Detail[i].coa = item.coa;
                    this.Detail[i].coa_nama = item.coa_nama;
                    this.Detail[i].coa_kode = item.coa_kode;

                    this.COA = [];
                } else {
                    this.Detail[i].coa_nama = '';
                }

                this.Ready = true;
                for (let item of this.Detail) {
                    if (item.coa == 0) {
                        this.Ready = false;
                        break;
                    }
                }

            }, 0);

        }

    }
    COARemove(item) {

        item.coa = 0;
        item.coa_kode = null;
        item.coa_nama = null;

        this.Ready = true;
        for (let item of this.Detail) {
            if (item.coa == 0) {
                this.Ready = false;
                break;
            }
        }

    }
    // => End AC COA

    DelayTotal;
    DetailState(i) {
        clearTimeout(this.DelayTotal);
        this.DelayTotal = setTimeout(() => {
            let Total = 0;
            for (let item of this.Detail) {
                if (typeof item.total != 'undefined') {
                    Total += Number(item.total);
                }
            }
            this.form.total = Total;
        }, 250);
    }

    ChangeDetailValue(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            if (item.total > item.max_total) {
                item.total = item.max_total;
            }

            this.ChangeValue();
        }, 100);
    }

    ChangeValue(cb = null) {
        var itemTotal = 0;
        this.Delay = setTimeout(() => {
            for (let item of this.Detail) {
                if (item.total) {
                    itemTotal += Number(item.total);
                }
            }

            this.Total = Number(itemTotal);
            this.form.total = this.Total;
            this.form.terbilang = this.core.terbilang_koma(this.form.total, this.form.currency);

            if (cb) {
                cb();
            }
        }, 100);
    }

    /*List*/
    CreateList(i) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            // => Check Next Input
            let next = Object.keys(this.Detail).length + 1;
            let DataNext = {
                i: next
            };
            if (!this.Detail[next]) {
                this.Detail.push(DataNext);
            }

        }, 100);
    }

    DeleteList(i, item) {
        let x = Swal({
            title: 'Delete List?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {
                if (result.value) {
                    if (x) {
                        let DATA = Object.keys(this.Detail);
                        // => Delete
                        let NewDetail = [];
                        let index = 0;
                        for (let j = 0; j < DATA.length; j++) {
                            if (j == i) {
                                this.DetailDel.push(this.Detail[j]);
                                delete this.Detail[j];
                                this.DetailState(0);
                            } else {
                                this.Detail[j].i = index;
                                NewDetail[index] = this.Detail[j];
                                index++;
                            }
                        }
                        // => Recreaten
                        this.Detail = NewDetail;
                        this.ChangeValue();
                    }
                }
            }
        );
    }

    Save() {
        Swal(
            {
                title: 'Apakah Anda Yakin!',
                html: '<div>Simpan Data?</div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {
                    this.form.list_send = JSON.stringify(this.Detail);

                    if (this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                    }

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    if(this.form.currency == 'IDR'){
                        this.form.rate = 1;
                    }

                    if(this.form.rate <= 1){
                        this.form.rate = 1;
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
            }
        );
    }

    /**
     * Approved
     */
    Approved() {
        Swal({
            title: 'Please Confirm to Approved?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {
                this.form.detail = JSON.stringify(this.Detail);

                if (result.value) {
                    this.form.detail = JSON.stringify(this.Detail);

                    this.form.trx_rate = this.form.rate;

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approved', this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'Bank Receive is Approved'
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
                            console.error('Approved', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => End : Approved

    /* Dialog Print */
    dialogPrint: MatDialogRef<BankReceiveDialogPrintComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {
        this.dialogPrint = this.dialog.open(
            BankReceiveDialogPrintComponent,
            this.dialogRefConfig
        );
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Com = this.Com;
        this.dialogPrint.componentInstance.form = this.form;
        this.dialogPrint.afterOpened().subscribe(
            result => {
                this.dialogRef.close();
            });
    }

    dialogPrint2: MatDialogRef<PenerimaanDialogPrintComponent>;
    dialogRefConfig2: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog2() {
        this.dialogPrint2 = this.dialog.open(
            PenerimaanDialogPrintComponent,
            this.dialogRefConfig2
        );
        this.dialogPrint2.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint2.componentInstance.Com = this.Com;
        this.dialogPrint2.componentInstance.form = this.form;
        this.dialogPrint2.afterOpened().subscribe(
            result => {
                this.dialogRef.close();
            });
    }

}
