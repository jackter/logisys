import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MatChipInputEvent, MatDialogConfig } from '@angular/material';
import { SalesOrderDetailDialogComponent } from './detail';

@Component({
    selector: 'dialog-form-sales-order',
    templateUrl: './form.html',
    styleUrls: ['../sales-order.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SalesOrderFormDialogComponent implements OnInit {

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

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    Additional: any[] = [{
        i: 0
    }];
    Document: any[] = [{
        i: 0
    }];

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<SalesOrderFormDialogComponent>

    ) { }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Customer = this.Default.customer;
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
            this.form.tanggal = this.DateToday;
        } else {

            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();

            if(this.form.additional) {
                this.Additional = JSON.parse(this.form.additional);
             
                if(!this.form.is_detail) {
                    this.Additional.push({i: 0});
                }
            }

            if(this.form.dokumen) {
                this.Document = JSON.parse(this.form.dokumen);
             
                if(!this.form.is_detail) {
                    this.Document.push({i: 0});
                }
            }

            // this.form.qty_outstanding = this.form.qty_out_sc + this.form.qty_so;

        }
    }

    setDate(val, model){
        if(val){
            this.form[model] = moment(val, "DD/MM/YYYY").format('DDMMYYYY').toString();
            
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
    //=> / END : FocusCompany

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

            this.form.kontrak_kode = null;
            this.form.kontrak = null;
            this.form.kontrak_tanggal = null;
            this.form.mutu = null;
            this.form.pembayaran = null;
            this.form.dasar_timbangan = null;
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
    //=> / END : AC Company

    /**
     * Costumer
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

            setTimeout(() => {
                $('#kontrak_kode').focus();
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
    //=> End Customer

    /**
    * AC Contract
    */
    ContractCode: any;
    ContractFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                cust: this.form.cust
            };

            this.core.Do(this.ComUrl + 'list.contract', Params).subscribe(
                result => {

                    if (result) {
                        this.ContractCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 0);
    }
    ContractSelect(e, item) {

        if (e.isUserInput) {

            this.form.kontrak_kode = item.kode;
            this.form.kontrak = item.id;
            this.form.kontrak_tanggal = item.kontrak_tanggal;
            this.form.spesifikasi = item.mutu;
            this.form.pembayaran = item.pembayaran;
            this.form.basis = item.dasar_timbangan;
            this.form.item = item.item;
            this.form.item_nama = item.item_nama;
            this.form.item_kode = item.item_kode;
            this.form.item_satuan = item.item_satuan;
            this.form.item_in_decimal = item.item_in_decimal;
            this.form.qty = item.qty;
            this.form.currency = item.currency;
            
            var Harga = 0;
            if(item.ppn) {
                if (item.inclusive_ppn) {
                    Harga = item.sold_price;
                } else {
                    Harga = item.sold_price * 1.1;
                }
            } else {
                Harga = item.sold_price;
            }

            this.form.sold_price = Harga;

            setTimeout(() => {
                $('*[name="destination"]').focus();
            }, 100);
        }
    }
    ContractRemove() {

        this.form.kontrak_kode = null;
        this.form.kontrak = null;
        this.form.kontrak_tanggal = null;

    }
    //=> / END : AC Contract

    Calculate(val) {

        setTimeout(() => {
            var Outstanding = this.form.qty;

            if(val > Outstanding) {
                this.form.qty_so = Outstanding;
            }

            this.form.grand_total = this.form.qty_so * this.form.sold_price;
        }, 250);
    }

    /**
     * Create List
     */
    CreateList(i, type: number) {

        if(type == 1) {
            if (!this.Additional[i].additional) {
                this.Additional[i] = {};
            }
    
            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };
    
            if (!this.Additional[next]) {
                this.Additional.push(DataNext);
            }
        } else 
        if(type == 2){
            if (!this.Document[i].dokumen) {
                this.Document[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            }

            if (!this.Document[next]) {
                this.Document.push(DataNext);
            }
        }
    }
    //=> END : Create List

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
                        var DATA = Object.keys(this.Additional);

                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.Additional[i];
    
                            } else {
    
                                this.Additional[i].i = index;
    
                                NewList[index] = this.Additional[i];
                                index++;
                            }
                        }
    
                        this.Additional = NewList;
                    } else
                    if (type == 2) {
                        var DATA = Object.keys(this.Document);

                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.Document[i];
    
                            } else {
    
                                this.Document[i].i = index;
    
                                NewList[index] = this.Document[i];
                                index++;
                            }
                        }
    
                        this.Document = NewList;
                    
                    }
                }
            }
        );
    }
    // => / END : Delete List

    /**
     * Simpan
     */
    Simpan() {

        swal(
            {
                title: 'Please Confirm to Save?',
                html: '<div>Are you sure to continue?',
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

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    if(this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');
                    }

                    // if(this.form.id == 'add') {
                        
                    //     this.form.outstanding_new = this.form.qty_outstanding - this.form.qty_so;
                        
                    // }

                    if(this.Additional) {
                        var Additional = [];

                        for(let item of this.Additional) {
                            if(item.additional) {
                                Additional.push({
                                    additional: item.additional
                                });
                            }
                        }
                        this.form.additional = JSON.stringify(Additional);
                    }

                    if(this.Document) {
                        var Document = [];

                        for(let item of this.Document) {
                            if(item.dokumen) {
                                Document.push({
                                    dokumen: item.dokumen
                                });
                            }
                        }
                        this.form.dokumen = JSON.stringify(Document);
                    }

                    this.Busy = true;
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                
                                if(this.form.id == 'add' && this.form.verified != 1) {
                                    var ADD = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Saved Successfully',
                                        msg: 'Your Request will Continue to Verify Process'
                                    };
                                    this.core.OpenAlert(ADD);
                                }
                                if(this.form.id != 'add' && this.form.verified != 1) {
                                    var EDIT = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Updated Successfully',
                                        msg: 'Your Request will Continue to Verify Process'
                                    };
                                    this.core.OpenAlert(EDIT);
                                }

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
     * Dialog History Detail
     */
    dialogDetail: MatDialogRef<SalesOrderDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    Print(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            this.dialogDetail = this.dialog.open(
                SalesOrderDetailDialogComponent,
                this.dialogDetailConfig
            );

            this.dialogDetail.componentInstance.form = this.form;
            this.dialogDetail.componentInstance.item = item;
            this.dialogDetail.componentInstance.ComUrl = this.ComUrl;

            this.dialogDetail.afterClosed().subscribe(result => {

            });

        }, 150);

    }
    //=> / END : Dialog History Detail

    rupiah(val) {
        if(val) {
            return this.core.rupiah(val);
        }
    }
}