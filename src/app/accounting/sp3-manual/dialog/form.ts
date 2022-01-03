import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';
import swal from 'sweetalert2';
import { PaymentRequestPrintDialogComponent } from 'app/accounting/payment-request/dialog/print';

@Component({
    selector: 'dialog-form-sp3-manual',
    templateUrl: './form.html',
    styleUrls: ['../sp3-manual.component.scss']
})
export class SP3FormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    List: any[] = [{
        i: 0
    }];

    ComUrl;
    Com;
    Busy;

    Delay;

    Cur: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<SP3FormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Cur = this.Default.cur;

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

        if (this.form.id == 'add') {
            this.List = [{
                i: 0
            }];
        }
    }

    dateChange(key) {

        if (key == 'tgl') {
            setTimeout(() => {
                $('*[name="company_nama"]').focus();
            }, 100);
        } else {
            setTimeout(() => {
                $('*[name="penerima_nama"]').focus();
            }, 100);
        }

    }

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
            this.form.grup = item.grup;
            this.form.grup_nama = item.grup_nama;

            this.CompanyLast = item.nama;

            setTimeout(() => {
                $('*[name="po_no"]').focus();
            }, 100);

        }
    }
    RemoveCompany() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
        this.form.grup = null;
        this.form.grup_nama = null;
    }
    // => END : AC Company

    /**
     * AC Cost center
     */
    Cost: any;
    CostFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.cost', Params).subscribe(
                result => {

                    if (result) {
                        this.Cost = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);
    }
    CostSelect(e, item) {

        if (e.isUserInput) {

            this.form.cost = item.id;
            this.form.cost_kode = item.kode;
            this.form.cost_nama = item.nama;

            setTimeout(() => {
                $('*[name="keterangan_bayar"]').focus();
            }, 100);

        }
    }
    RemoveCost() {
        this.form.cost = null;
        this.form.cost_kode = null;
        this.form.cost_nama = null;
    }
    // => End : Cost Center

    /*AC Penerima*/
    Penerima: any;
    PenerimaFilter(val: string): void {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            let Params = {
                NoLoader: 1,
                keyword: val
            };
            this.core.Do(this.ComUrl + 'list_penerima', Params).subscribe(
                result => {
                    if (result) {
                        this.Penerima = result;
                    }
                },
                error => {
                    console.error(error);
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    PenerimaSelect(e, item): void {
        if (e.isUserInput) {
            this.form.penerima = item.id;
            this.form.penerima_nama = item.nama;
            setTimeout(() => {
                $('*[name="jumlah"]').focus();
            }, 100);
        }
    }

    DelayTotal;
    ListState(i) {
        this.AutoCreateList(i);
        clearTimeout(this.DelayTotal);
        this.DelayTotal = setTimeout(() => {
            let Total = 0;
            for (let item of this.List) {
                if (typeof item.jumlah != 'undefined') {
                    Total += Number(item.jumlah);
                }
            }
            this.form.total = Total;
        }, 250);
    }

    DelayCreate;
    AutoCreateList(i) {
        clearTimeout(this.DelayCreate);
        this.DelayCreate = setTimeout(() => {
            // => Check List
            if (!this.List[i].uraian && !this.List[i].jumlah) {
                this.List[i] = {};
            }

            // => Check Next Input
            let next = Number(i) + 1;
            let prev = Number(i) - 1;
            let DataNext = {
                i: next
            };
            let DataPrev = {
                i: prev
            };

            /*Check Next State*/
            if (
                (
                    this.List[i].uraian ||
                    this.List[i].jumlah
                ) &&
                (
                    !this.List[next]
                )
            ) {
                if (!this.List[next]) {
                    this.List.push(DataNext);
                    setTimeout(() => {
                        $('form-sp3-dialog mat-dialog-content').scrollTop($('form-sp3-dialog mat-dialog-content table').height() + 50);
                    }, 100);
                }
            }
            // => / END : Check Next State
        }, 500);
    }

    DeleteList(i, item) {
        let x = swal(
            {
                title: 'Apakah Anda yakin!',
                html: '<div>Menghapus data?</div><div><small><strong>' + item.uraian + '</strong></small></div>',
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
                    if (x) {
                        let DATA = Object.keys(this.List);
                        // => Delete
                        let NewList = [];
                        let index = 0;
                        for (let j = 0; j < DATA.length; j++) {
                            if (j == i) {
                                delete this.List[j];
                                this.ListState(0);
                            } else {
                                this.List[j].i = index;
                                NewList[index] = this.List[j];
                                index++;
                            }
                        }
                        // => Recreaten
                        this.List = NewList;
                    }
                }
            }
        );
    }

    /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        if (this.form.tanggal) {
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
        }
        if (this.form.po_tgl) {
            this.form.tanggal_po = moment(this.form.po_tgl).format('YYYY-MM-DD');
        }

        this.form.list = JSON.stringify(this.List);

        this.Busy = true;

        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

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
    // => / END : Simpan

    /**
     * Edit
     */
    Edit() {

        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);

            this.List.push({
                i: (this.List.length)
            });
        }

    }
    // => END : Edit

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
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'SP3 Verified'
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

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'SP3 Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'SP3 Rejected'
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

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'SP3 Approved'
                                });

                                this.dialogRef.close(result);

                            }
                            else if (result.status == 2) {
                                this.core.OpenAlert({
                                    title: 'Journal is undefined',
                                    msg: '<div>Please call accounting to create journal P3 first.</div>',
                                    width: 400
                                });

                                this.Busy = false;
                            }
                            else if (result.status == 3) {
                                this.core.OpenAlert({
                                    title: 'Journal Value Not Balace',
                                    msg: '<div>Journal values (' + this.core.rupiah(result.jv_total) + ') is not balance with SP3 Total (' + this.core.rupiah(result.sp3_total) + ').</div>',
                                    width: 400
                                });

                                this.Busy = false;
                            }
                            else {
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

    /**
    * Open Print SP3 
    */
    SP3PrintRef: MatDialogRef<PaymentRequestPrintDialogComponent>;
    SP3PrintRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    formSP3;
    Print() {

        var Params = {
            id: this.form.id
        };

        this.core.Do('e/accounting/pay_request/get_print', Params).subscribe(
            result => {

                if (result) {
                    this.formSP3 = result.data;

                    this.ShowPrint();
                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );

    }
    ShowPrint() {

        this.SP3PrintRef = this.dialog.open(
            PaymentRequestPrintDialogComponent,
            this.SP3PrintRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.SP3PrintRef.componentInstance.Default = this.Default;
        this.SP3PrintRef.componentInstance.ComUrl = this.ComUrl;
        this.SP3PrintRef.componentInstance.perm = this.perm;
        this.SP3PrintRef.componentInstance.formSP3 = this.formSP3;
        // => / END : Inject Data to Dialog

    }
    // => Open Print SP3 

}