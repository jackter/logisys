import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { ContractRequestDialogPrintComponent } from './print';

@Component({
    selector: 'dialog-form-contract-request',
    templateUrl: './form.html',
    styleUrls: ['../contract-request.component.scss'],
})
export class ContractRequestFormDialogComponent implements OnInit {

    ComUrl: any;
    Com: any;

    perm: any = {};
    form: any = {};
    Default: any = {};
    Work_Code: any = {};
    UoM_Code: any = {};
    Delay: any;

    List: any[] = [{
        i: 0
    }];

    Company: any = [];
    CompanyLen: number;
    CompanyLast;

    COA: any[] = [];
    ListCOA: any[] = [];
    WaitItem: any[] = [];

    Cur: any = {};
    Busy: boolean;
    CIP: any;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ContractRequestFormDialogComponent>
    ) { }

    ngOnInit(): void {
        if (this.Default.work_code) {
            this.Work_Code = this.Default.work_code.value;
        }

        if (this.Default.uom_code) {
            this.UoM_Code = this.Default.uom_code.value;
        }

        if (this.Default.cur) {
            this.Cur = this.Default.cur;
        }

        if (this.Default.company) {
            this.Company = this.Default.company;
        }

        // Company Check
        this.CompanyLen = Object.keys(this.Company).length;
        if (this.CompanyLen == 1) {
            this.form.company = this.Company[0].id;
            this.form.company_abbr = this.Company[0].abbr;
            this.form.company_nama = this.Company[0].nama;
        }

        if (this.form.id != 'add') {
            this.List = this.form.list;
        }
    }

    Edit(): void {
        this.form.is_detail = null;
    }

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val, 2, true);
        }
    }

    /*AC Company*/
    CompanyFilter(): void {
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

    }

    CompanySelect(e, item): void {
        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            setTimeout(() => {
                $('*[name="work_code"]').focus();
            }, 100);
        }
    }

    CompanyReset(): void {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.List = [{
            i: 0
        }];

        this.CIPReset();

        this.CompanyFilter();
    }

    // AC Work Code
    WCSelect(e, item): void {
        if (e.isUserInput) {
            this.form.work = item.id;
            this.form.work_nama = item.nama;
            this.form.work_code = item.kode;
        }
        this.CIPFilter();
    }

    // AC Currency
    CurSelect(e, item): void {
        if (e.isUserInput) {
            this.form.currency = item.kode;
        }
    }

    /**AC COA*/
    COAFilter(val: string): void {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'coa', Params).subscribe(
                result => {
                    if (result) {
                        this.COA = result;
                        this.ListCOA = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }
    COASelect(e, item, i): void {

        if (e.isUserInput) {

            this.List[i].coa = item.id;
            this.List[i].coa_kode = item.kode;
            this.List[i].coa_nama = item.nama;

            this.CreateList(i);

            this.COA = this.ListCOA;

            setTimeout(() => {
                $('#keterangan-' + i).focus();
            }, 250);

        }
    }
    COARemove(item): void {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            item.coa = null;
            item.coa_kode = null;
            item.coa_nama = null;
        }, 100);
    }

    CIPFilter(): void {
        var val = this.form.cip_kode;

        if (val) {
            val = val.toString().toLowerCase();

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };

                this.core.Do(this.ComUrl + 'cip_kode', Params).subscribe(
                    result => {
                        if (result) {
                            this.CIP = result;
                        }
                    },
                    error => {
                        this.core.OpenNotif(error);
                    }
                );
            }, 100);
        }
    }

    CIPSelect(e, item): void {
        this.form.cip = item.id;
        this.form.cip_kode = item.kode;
    }

    CIPReset(): void {
        this.form.cip = null;
        this.form.cip_kode = null;

        this.CIPFilter();
    }


    EndDate(): void {
        if (this.form.start_date) {
            this.form.end_date = moment(this.form.start_date, 'YYYY-MM-DD').add(this.form.duration, 'days');
        }
    }
    TotalCalculate(item): void {
        if (item.volume && item.est_rate) {
            var Total = item.volume * item.est_rate;
        }

        item.total = Total;

        var GrandTotal = 0;
        for (let item of this.List) {
            if (item.total) {
                GrandTotal += Number(item.total);
            }
        }
        this.form.grand_total = GrandTotal;
    }

    /*Create List*/
    CreateList(i): void {

        // clearTimeout(this.Delay);
        // this.Delay = setTimeout(() => {

        if (!this.List[i].coa) {
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
        // }, 100);
    }

    DeleteList(del): void {
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
                    var DATA = Object.keys(this.List);

                    // => Delete
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
                    // => Recreaten
                    this.List = NewList;
                }
            }
        );
    }

    /**
     * Verify
     */
    Verify(): void {
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
                                    info: 'Contract Request Verify'
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

    /**
     * Approve
     */
    Approve(): void {
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
                                    msg: 'Contract Request now available for Agreement'
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
                                    msg: 'Contract Request Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'Contract Request Rejected'
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

    /**
     * Simpan
     */
    Simpan(): void {
        swal(
            {
                title: 'Apakah Anda Yakin!',
                html: '<div>Simpan Data?',
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
                        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                    }

                    if (this.form.start_date) {
                        this.form.start_date_send = moment(this.form.start_date).format('YYYY-MM-DD');
                    }

                    if (this.form.end_date) {
                        this.form.end_date_send = moment(this.form.end_date).format('YYYY-MM-DD');
                    }

                    this.form.list = JSON.stringify(this.List);

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
                    console.log(this.form);
                }
            }
        );
    }

    /** 
    * Dialog
   */
    dialogDetail: MatDialogRef<ContractRequestDialogPrintComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    Print(): void {
        this.dialogDetail = this.dialog.open(
            ContractRequestDialogPrintComponent,
            this.dialogDetailConfig
        );

        this.dialogDetail.componentInstance.form = this.form;
        this.dialogDetail.componentInstance.Com = this.Com;
        this.dialogDetail.componentInstance.perm = this.perm;

        /**
        * After Close
        */
        this.dialogDetail.afterClosed().subscribe(result => {
            this.dialogDetail = null;
        });
    }

}
