import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { SalesHandoverDialogPrintComponent } from './print';

@Component({
    selector: 'dialog-form-gi',
    templateUrl: './form.html'
})
export class SalesHandoverDialogFormComponent implements OnInit {

    perm: any = {};
    form: any = {};
    Default: any = {};

    ComUrl: string;
    Com: any;
    Busy: boolean;

    DateToday = moment(new Date()).format('DD/MM/YYYY');
    maxDate = moment(new Date());

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<SalesHandoverDialogFormComponent>
    ) { }

    ngOnInit() {

        if (this.Default.company) {
            this.Company = this.Default.company;
        }
        if (this.Default.customer) {
            this.Customer = this.Default.customer;
        }

        if (this.form.id == 'add') {
            this.form.tanggal = this.DateToday;

        } else {
            this.LoadKode();

            if (this.form.detail) {
                this.Detail = this.form.detail;
            }

            this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD').format('DDMMYYYY').toString();

            if (this.form.date_target) {
                this.form.date_target = moment(this.form.date_target, 'YYYY-MM-DD').format('DD/MM/YYYY');
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

    date(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val, 0, true);
        }
    }

    Edit() {
        this.form.is_detail = null;
    }

    /**
      * AC Company
      */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;

    CompanyFilter(val) {

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

            this.LoadKode();

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

        this.form.kontrak = null;
        this.form.kontrak_tanggal = null;
        this.form.kontrak_kode = null;

        this.form.item = null;
        this.form.item_kode = null;
        this.form.item_nama = null;
        this.form.item_satuan = null;

        this.form.qty_so = null;

        this.CustomerFilter();

        // setTimeout(() => {
        //     $('#customer_nama').blur();
        //     setTimeout(() => {
        //         $('#customer_nama').focus();
        //     }, 100);
        // }, 100);
    }

    /*Load Kode*/
    Kode: any = [];
    Detail: any = [];

    LoadKode() {

        var Params = {
            NoLoader: 1,
            company: this.form.company,
            cust: this.form.cust
        };

        this.core.Do(this.ComUrl + 'list_so', Params).subscribe(
            result => {

                if (result) {
                    this.Default.kode = result.list;
                }
            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );
    }

    KodeFilter() {
        var val = this.form.kontrak_kode;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];

            for (let item of this.Kode) {

                var Combine = item.kontrak_kode + ' (' + item.item_kode + ')';
                if (
                    item.kontrak_kode.toLowerCase().indexOf(val) != -1 ||
                    item.item_kode.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }
            this.Kode = Filtered;
        } else {
            this.Kode = this.Default.kode;
        }
    }

    KodeSelect(e, item) {

        if (e.isUserInput) {
            this.form.so = item.id;
            this.form.so_kode = item.kode;

            this.form.kontrak = item.kontrak;
            this.form.kontrak_kode = item.kontrak_kode;
            this.form.kontrak_tanggal = item.kontrak_tanggal;
            this.form.transport = item.transport;

            this.form.detail = item.detail;

            if (this.form.detail) {
                this.Detail = this.form.detail;

                var Total = 0;
                for (let item of this.Detail) {
                    Total += Number(item.qty_shipping);
                }
                this.form.qty_total = Total;
            }

            this.form.item = item.item;
            this.form.item_nama = item.item_nama;
            this.form.item_kode = item.item_kode;
            this.form.item_satuan = item.item_satuan;

            this.form.qty_so = item.qty_so;
            // this.form.qty_shipping = item.qty_delivery;
            // this.form.remarks = item.remarks;c

            // setTimeout(() => {
            //     $('*[name="destination"]').focus();
            // }, 100);
        }
    }

    KodeRemove() {
        this.form.kontrak = null;
        this.form.kontrak_kode = null;
        this.form.kontrak_tanggal = null;

        this.form.item = null;
        this.form.item_kode = null;
        this.form.item_nama = null;
        this.form.item_satuan = null;

        this.form.qty_so = null;
        this.form.qty_total = null;
    }

    /**
     * Simpan
     */
    Simpan(): void {
        swal(
            {
                title: 'Please Confirm to Save?',
                html: '<div,>Are you sure to continue?</div>',
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

                    if (this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal, 'DDMMYYYY').format('YYYY-MM-DD');
                    }

                    this.form.detail = JSON.stringify(this.Detail);

                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.dialogRef.close(result);
                            } else {
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

    /**
    * Open Print SP3 
    */
    SHPrintRef: MatDialogRef<SalesHandoverDialogPrintComponent>;
    SHPrintRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    Print() {

        this.SHPrintRef = this.dialog.open(
            SalesHandoverDialogPrintComponent,
            this.SHPrintRefConfig
        );

        /**
             * Inject Data to Dialog
             */
        this.SHPrintRef.componentInstance.form = this.form;
        this.SHPrintRef.componentInstance.Com = this.Com;


        this.SHPrintRef.afterClosed().subscribe(result => {

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
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'Sales Handover Verify'
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
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Sales Handover now available'
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

    /**
     * Reject
     */
    Reject(): void {
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
                                    msg: 'Sales Handover Request Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'Sales Handover Request Rejected'
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

}
