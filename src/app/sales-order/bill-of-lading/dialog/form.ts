import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { BLPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-gi',
    templateUrl: './form.html'
})
export class BLFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    // ReceiptState;

    ReadyVerify;

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<BLFormDialogComponent>
    ) {
    }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Customer = this.Default.customer;

        if (this.form.id == 'add') {
            this.form.tanggal = this.DateToday;

        } else {

            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();

            if (this.form.date_target) {
                this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');
            }
            
        }
    }

    setDate(val, model) {
        if (val) {
            this.form[model] = moment(val, 'DD/MM/YYYY').format('DDMMYYYY').toString();
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

        this.CustomerRemove();

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
                $('#so_kode').focus();
            }, 100);
        }
    }
    CustomerRemove() {

        this.form.cust = null;
        this.form.cust_nama = null;
        this.form.cust_kode = null;
        this.form.cust_alamat = null;
        this.SORemove();

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
    * AC SO
    */
   SOCode: any;
   SOFilter(val: string) {

       clearTimeout(this.Delay);
       this.Delay = setTimeout(() => {

           var Params = {
               NoLoader: 1,
               keyword: val,
               company: this.form.company,
               cust: this.form.cust
           };

           this.core.Do(this.ComUrl + 'list.so', Params).subscribe(
               result => {

                   if (result) {
                       this.SOCode = result;
                   }

               },
               error => {
                   this.core.OpenNotif(error);
               }
           );
       }, 0);
   }
   SOSelect(e, item) {

       if (e.isUserInput) {

           this.form.kontrak_kode = item.kontrak_kode;
           this.form.kontrak = item.kontrak;
           this.form.so_kode = item.kode;
           this.form.so = item.id;
           this.form.item = item.item;
           this.form.item_nama = item.item_nama;
           this.form.item_kode = item.item_kode;
           this.form.item_satuan = item.item_satuan;
           this.form.item_in_decimal = item.item_in_decimal;
           this.form.qty_so = item.qty_so;
           this.form.qty_shipping = item.qty_shipping;

           setTimeout(() => {
               $('*[name="destination"]').focus();
           }, 100);
       }
   }
   SORemove() {
        this.form.kontrak_kode = null;
        this.form.kontrak = null;
        this.form.so_kode = null;
        this.form.so = null;
        this.form.item = null;
        this.form.item_nama = null;
        this.form.item_kode = null;
        this.form.item_satuan = null;
        this.form.item_in_decimal = null;
        this.form.qty_so = null;
        this.form.qty_shipping = null;
   }
   //=> / END : AC Contract

    /**
     * Simpan
     */
    Simpan() {

        swal({
            title: 'Please Confirm to Save?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            width: 400
        }).then(
            result => {

                if (result.value) {

                    if (this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');
                    }

                    this.Busy = true;

                    this.core.Do(this.ComUrl + 'save', this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Transaction Success',
                                    msg: 'Shipment for ' + this.form.kode + ' success!'
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
                            console.error('Save', error);
                            this.Busy = false;
                        }
                    );
                }
            }
        );
    }
    // => / END : Simpan

    /**
    * Open Print SP3 
    */
   SOPrintRef: MatDialogRef<BLPrintDialogComponent>;
   SOPrintRefConfig: MatDialogConfig = {
       disableClose: true,
       panelClass: 'event-form-dialog'
   };

    Print() {

    this.SOPrintRef = this.dialog.open(
    BLPrintDialogComponent,
        this.SOPrintRefConfig
    );

    /**
         * Inject Data to Dialog
         */
        this.SOPrintRef.componentInstance.form = this.form;

        this.SOPrintRef.afterClosed().subscribe(result => {

        });

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

                    this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD').toString();
                    
                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', this.form).subscribe(
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

}
