import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MatChipInputEvent, MatDialogConfig } from '@angular/material';
import { ContractPrintDialogComponent } from './print';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-contract',
    templateUrl: './form.html',
    styleUrls: ['../contract.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContractFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    formPrintSalesContract;

    // DateToday = moment(new Date()).format('DD/MM/YYYY');
    // maxDate = moment(new Date());

    Others: any[] = [{
        i: 0
    }];
    Notes: any[] = [{
        i: 0
    }];
    List: any[] = [{
        i: 0
    }];

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ContractFormDialogComponent>

    ) { }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Customer = this.Default.customer;
        this.Address = this.Default.address;

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
            this.form.company_alamat = this.Company[0].alamat;
        }
        //=> / Check Company

        if (this.form.id == 'add') {
            this.form.tanggal = moment(new Date()).format('YYYY-MM-DD');
        } else {
            if (this.form.mutu) {

                this.List = JSON.parse(this.form.mutu);

                if (!this.form.is_detail) {
                    this.List.push({
                        i: 0
                    });
                }
            }

            if (this.form.notes) {

                this.Notes = JSON.parse(this.form.notes);

                if (!this.form.is_detail) {
                    this.Notes.push({
                        i: 0
                    });
                }
            }

            if (this.form.others) {

                this.Others = JSON.parse(this.form.others);

                if (!this.form.is_detail) {
                    this.Others.push({
                        i: 0
                    });
                }
            }

            // if (this.form.tanggal) {
            //     this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();
            // }

            if(this.form.tanggal) {
                this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD');
            }
        }
    }

    setDate(val, model) {
        if (val) {
            this.form[model] = moment(val, 'DD/MM/YYYY').format('DDMMYYYY').toString();

            setTimeout(() => {
                $('*[name="company_nama"]').focus();
            }, 100);
        }
    }

    /**
     * FocusCompany
     */
    FocusCompany() {
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 100);
    }
    // => / END : FocusCompany

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
            this.form.company_alamat = null;

            this.form.cust = null;
            this.form.cust_nama = null;
            this.form.cust_kode = null;
            this.form.cust_alamat = null;

            this.form.company_bank = null;
            this.form.company_bank_nama = null;
            this.form.company_rek = null;

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
            this.form.company_alamat = item.alamat;

            this.InitCompanyBankFilter();

            this.CompanyLast = item.nama;

            setTimeout(() => {
                $('#cust_nama').focus();
            }, 100);
        }
    }
    CompanyRemove() {

        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;
        this.form.company_alamat = null;

        this.form.cust = null;
        this.form.cust_nama = null;
        this.form.cust_kode = null;
        this.form.cust_alamat = null;

        this.Company = this.Default.company;
        this.Customer = this.Default.customer;

        setTimeout(() => {
            $('#company_nama').blur();
            setTimeout(() => {
                $('#company_nama').focus();
            }, 100);
            // this.CompanyFilter();
        }, 100);
    }

    InitCompanyBankFilter() {
        let i = 0;
        let Filtered = [];
        for (let item of this.Default.bank) {

            if (this.form.company == item.company) {
                Filtered[i] = item;
                i++;
            }

        }
        this.Bank = Filtered;
    }
    // => / END : AC Company

    /**
     * Customer
     */
    Customer: any = [];
    CustomerLast;
    CustomerFilter() {

        var val = this.form.cust_nama;

        if (val != this.CustomerLast) {
            this.form.cust = null;
            this.form.cust_kode = null;
            this.form.cust_alamat = null;

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.customer) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.abbr.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
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
    CustomerSelect(e, item) {
        if (e.isUserInput) {
            this.form.cust = item.id;
            this.form.cust_nama = item.nama_full;
            this.form.cust_kode = item.kode;
            this.form.cust_abbr = item.abbr;
            this.form.cust_alamat = item.alamat;

            this.CustomerLast = item.nama_full;

            this.getLastData();

            setTimeout(() => {
                $('#dasar_timbangan').focus();
            }, 100);
        }
    }
    CustomerRemove() {

        this.form.cust = null;
        this.form.cust_nama = null;
        this.form.cust_kode = null;
        this.form.cust_alamat = null;

        this.Customer = this.Default.customer;

        setTimeout(() => {
            $('#customer_nama').blur();
            setTimeout(() => {
                $('#customer_nama').focus();
            }, 100);
        }, 100);
    }

    getLastData(){
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                cust: this.form.cust
            };

            this.core.Do(this.ComUrl + 'get_last', Params).subscribe(
                result => {

                    if (result) {

                        this.form.company_ttd = result.data.company_ttd;
                        this.form.cust_ttd = result.data.cust_ttd;
                        this.form.pembayaran = result.data.pembayaran;
                        this.form.dasar_timbangan = result.data.dasar_timbangan;
                        this.form.penyerahan = result.data.penyerahan;
                        this.form.syarat_penyerahan = result.data.syarat_penyerahan;
                        this.form.syarat_penyerahan_addr = result.data.syarat_penyerahan_addr;
                        this.form.company_bank_id = result.data.company_bank_id;
                        this.form.company_bank_nama = result.data.company_bank_nama;
                        this.form.company_bank = result.data.company_bank;
                        this.form.company_rek = result.data.company_rek;
                        this.form.item = result.data.item;
                        this.form.item_kode = result.data.item_kode;
                        this.form.item_nama = result.data.item_nama;
                        this.form.item_satuan = result.data.item_satuan;
                        this.form.produk_kode = result.data.produk_kode;
                        this.form.produk_nama = result.data.produk_nama;
                        this.form.toleransi = result.data.toleransi;
                        this.form.dp = result.data.dp;
                        this.form.qty = result.data.qty;
                        this.form.sold_price = result.data.sold_price;
                        this.form.ppn = result.data.ppn;
                        this.form.inclusive_ppn = result.data.inclusive_ppn;
                        this.form.currency = result.data.currency;
                        this.form.grand_total = result.data.grand_total;
                        this.form.transport = result.data.transport;

                        if (result.data.mutu) {

                            this.List = JSON.parse(result.data.mutu);
            
                            if (!this.form.is_detail) {
                                this.List.push({
                                    i: 0
                                });
                            }
                        }

                        if (result.data.notes) {

                            this.Notes = JSON.parse(result.data.notes);
            
                            if (!this.form.is_detail) {
                                this.Notes.push({
                                    i: 0
                                });
                            }

                        }
            
                        if (result.data.others) {
            
                            this.Others = JSON.parse(result.data.others);
            
                            if (!this.form.is_detail) {
                                this.Others.push({
                                    i: 0
                                });
                            }

                        }
                        
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    // => End Customer

    /**
     * Bank
     */
    Bank: any = [];
    BankLast;
    BankFilter() {

        var val = this.form.company_bank_nama;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.bank) {

                if (item) {
                    var Combine = item.nama_bank + ' (' + item.no_rekening + ')';
                    if (
                        (item.nama_bank.toString().toLowerCase().indexOf(val) != -1 ||
                            item.no_rekening.toString().toLowerCase().indexOf(val) != -1 ||
                            Combine.toString().toLowerCase().indexOf(val) != -1) &&
                        (item.company == this.form.company)
                    ) {
                        Filtered[i] = item;
                        i++;
                    }
                }

            }
            this.Bank = Filtered;

        } else {
            this.InitCompanyBankFilter();
        }

    }
    BankSelect(e, item) {
        if (e.isUserInput) {
            this.form.company_bank_id = item.id;
            this.form.company_bank = item.nama_rekening;
            this.form.company_bank_nama = item.nama_bank;
            this.form.company_rek = item.no_rekening;

            this.BankLast = item.nama_rekening;

            setTimeout(() => {
                $('#item_nama').focus();
            }, 100);
        }
    }
    BankRemove() {

        this.form.company_bank_id = null;
        this.form.company_bank = null;
        this.form.company_bank_nama = null;
        this.form.company_rek = null;

        this.Bank = this.Default.bank;

        setTimeout(() => {
            $('#company_bank_nama').blur();
            setTimeout(() => {
                $('#company_bank_nama').focus();
            }, 100);
            // this.CompanyFilter();
        }, 100);
    }
    // => End Bank

    /**
     * AC Item
     */
    Item: any;
    FilterItem(val: string) {

        if (this.Default.item) {
            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];

                for (let item of this.Default.item) {

                    if (item) {
                        var Combine = item.kode + ' (' + item.nama + ')';
                        if (
                            item.kode.toLowerCase().indexOf(val) != -1 ||
                            item.nama.toLowerCase().indexOf(val) != -1 ||
                            Combine.toLowerCase().indexOf(val) != -1
                        ) {
                            Filtered[i] = item;
                            i++;
                        }
                    }

                }
                this.Item = Filtered;

            } else {
                this.Item = this.Default.item;
            }
        }
    }
    SelectItem(e, item) {

        if (e.isUserInput) {

            this.form.item = item.id;
            this.form.item_kode = item.kode;
            this.form.item_nama = item.nama;
            this.form.item_satuan = item.satuan;
            this.form.item_in_decimal = item.in_decimal;

            this.form.produk_kode = item.kode2;
            this.form.produk_nama = item.nama;

            this.List = _.filter(this.Default.quality, {
                id: item.id
            });

            if (this.List) {
                this.List.push({
                    i: 0
                });
            }

        }
    }

    RemoveItem() {
        this.form.item = null;
        this.form.item_kode = null;
        this.form.item_nama = null;
        this.form.item_satuan = null;
        this.form.item_in_decimal = null;

        this.form.produk_kode = null;
        this.form.produk_nama = null;

        this.List = null;
    }
    // => / END : AC Item

    Address: any = [];
    AddressFilter() {
        if(this.Default.address) {
            var val = this.form.syarat_penyerahan_addr;

            if (val) {
                val = val.toString().toLowerCase();
    
                let i = 0;
                let Filtered = [];
                for (let item of this.Default.address) {
                    if (item && item.toLowerCase().indexOf(val) != -1) {
                        Filtered[i] = item;
                        i++;
                    }
                }
                this.Address = Filtered;
            } else {
                this.Address = this.Default.address;
            }
        }
    }

    AddressSelect(e, item) {
        if (e.isUserInput) {
            this.form.syarat_penyerahan_addr = item;
            this.form.syarat_penyerahan_addr_show = 1;
        }
    }

    AddressRemove() {
        this.form.syarat_penyerahan_addr = null;
        this.form.syarat_penyerahan_addr_show = null;
    }

    /*Create List*/
    CreateList(i, type) {
        if (type == 1) {
            if (!this.List[i].kode) {
                this.List[i] = {};
            }
    
            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };
    
            if (!this.List[next]) {
                this.List.push(DataNext);
            }
        } else if (type == 2) {
            if (!this.Notes[i].notes) {
                this.Notes[i] = {};
            }

            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.Notes[next]) {
                this.Notes.push(DataNext);
            }
        } else if (type == 3) {
            if (!this.Others[i].others) {
                this.Others[i] = {};
            }

            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.Others[next]) {
                this.Others.push(DataNext);
            }
        }
        
    }

    /**
     * Delete List
     */
    DeleteList(del, type) {

        swal({
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
                    if (type == 1) {
                        var DATA = Object.keys(this.List);

                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
                                delete this.List[i];
                            } else {
                                this.List[i].i = index;

                                NewList[index] = this.List[i];
                                index++;
                            }
                        }
                        this.List = NewList;
                    } else if (type == 2) {
                        var DATA = Object.keys(this.Notes);
    
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.Notes[i];
    
                            } else {
    
                                this.Notes[i].i = index;
    
                                NewList[index] = this.Notes[i];
                                index++;
                            }
                        }                        
    
                        this.Notes = NewList;
                    } else if (type == 3) {
                        var DATA = Object.keys(this.Others);
    
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.Others[i];
    
                            } else {
    
                                this.Others[i].i = index;
    
                                NewList[index] = this.Others[i];
                                index++;
                            }
                        }
    
                        this.Others = NewList;
    
                    }
                }
            }
        );
    }

    /**
     * Calculate
     */
    Calculate() {

        setTimeout(() => {
            if (this.form.qty && this.form.sold_price) {

                var Harga = 0;
                if (this.form.ppn) {
                    if (this.form.inclusive_ppn) {
                        Harga = this.form.sold_price;
                    } else {
                        Harga = this.form.sold_price * 1.1;
                    }
                } else {
                    Harga = this.form.sold_price;
                }

                this.form.grand_total = Math.round(Harga * this.form.qty);

            }
        }, 250);

    }
    // => END : Calculate

    
    /**
     * Simpan
     */
    Simpan() {

        if (this.form.tanggal) {
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
        }      
        if (this.form.po_tgl) {
            this.form.po_tgl_send = moment(this.form.po_tgl).format('YYYY-MM-DD');
        }

        if (this.Notes) {
            var Notes = [];

            for (let item of this.Notes) {
                if (item.notes) {
                    Notes.push({
                        notes: item.notes
                    });
                }
            }
            this.form.notes = JSON.stringify(Notes);
        }

        if (this.Others) {
            var Others = [];

            for (let item of this.Others) {
                if (item.others) {
                    Others.push({
                        others: item.others
                    });
                }
            }
            this.form.others = JSON.stringify(Others);
        }

        var Quality = [];
        for (let item of this.List) {
            if (item.kode) {
                Quality.push({
                    id: this.List[0].id,
                    kode: item.kode,
                    value: item.value
                });
            }
        }

        this.form.quality = JSON.stringify(Quality);

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

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
    //=> / END : Simpan

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
                        kode: this.form.kode,
                        po: this.form.po
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "Payment Request Verify"
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
                        po: this.form.po
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Sales Contract now available for Shipping'
                                };
                                this.core.OpenAlert(Success);

                                this.core.Sharing({
                                    reload_def: 1
                                }, 'reload');
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
    * Open Print SP3 
    */
    SalesContractPrintRef: MatDialogRef<ContractPrintDialogComponent>;
    SalesContractPrintRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    Print() {

        this.SalesContractPrintRef = this.dialog.open(
            ContractPrintDialogComponent,
            this.SalesContractPrintRefConfig
        );

        /**
            * Inject Data to Dialog
            */
        this.SalesContractPrintRef.componentInstance.Default = this.Default;
        this.SalesContractPrintRef.componentInstance.ComUrl = this.ComUrl;
        this.SalesContractPrintRef.componentInstance.perm = this.perm;
        this.SalesContractPrintRef.componentInstance.form = this.form;

    }

}