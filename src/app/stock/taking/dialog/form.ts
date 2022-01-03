import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-mt',
    templateUrl: './form.html',
    styleUrls: ['../taking.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TakingFormDialogComponent implements OnInit {

    List: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};

    PrintList: any[];

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).add(3, 'days').format('DD/MM/YYYY');

    Generated;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<TakingFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;

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

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;
            }

        }
        // => / END : Form Edit

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

            this.form.storeloc = null;
            this.form.storeloc_kode = null;
            this.form.storeloc_nama = null;
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

            this.CompanyLast = item.nama;

            this.Store = item.store;
            this.StoreKeep = item.store;

            setTimeout(() => {
                $('#storeloc_nama').focus();
            }, 100);
        }
    }
    CompanyRemove() {

        $('#company_nama').blur();

        this.form.company_nama = '';
        setTimeout(() => {
            this.CompanyFilter();
        }, 100);
    }
    // => / END : AC Company

    /**
     * AC Store
     */
    Store: any = [];
    StoreKeep: any = [];
    StoreLast: any = [];

    StoreFilter() {

        var val = this.form.storeloc_nama;

        setTimeout(() => {
            if ($('#storeloc_nama').not(':focus')) {
                $('#storeloc_nama').focus();
            }
        }, 100);

        if (val != this.StoreLast) {

            this.Generated = false;

            this.PrintList = [{
                i: 0
            }];

            this.form.storeloc = null;
            this.form.storeloc_kode = null;

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.StoreKeep) {

                var Combine = item.kode + ' : ' + item.nama;
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Store = Filtered;

        } else {
            this.Store = this.StoreKeep;
        }

    }
    StoreSelect(e, item) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.form.storeloc = item.id;
                this.form.storeloc_kode = item.kode;
                this.form.storeloc_nama = item.nama;

                this.StoreLast = item.id;

                setTimeout(() => {
                    $('*[name="remarks"]').focus();
                }, 100);

            }, 100);

        }

    }
    StoreRemove() {

        $('#storeloc_nama').blur();

        this.form.storeloc_nama = '';
        setTimeout(() => {
            this.StoreFilter();
        }, 100);
    }
    // => / END : AC Store

    /**
     * AC Item
     */
    Item: any;
    WaitItem: any[] = [];

    ItemFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitItem[i] = true;

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    keyword: val,
                    company: this.form.company,
                    storeloc: this.form.storeloc
                };

                this.core.Do('e/stock/item/inc/list.normal', Params).subscribe(
                    result => {

                        if (result) {
                            this.Item = result;
                        }

                        this.WaitItem[i] = false;

                    },
                    error => {
                        console.error('ItemFilter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }
                );

            }, 100);

        }

    }
    ItemSelect(e, item, i: number) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.List, 'id', item.id);
            /*var Find: any = _.result(_.find(this.List, {
                id: item.id
            }), 'id');*/

            setTimeout(() => {

                if (Find.length <= 0) {
                    this.List[i] = item;
                    this.List[i]['i'] = i;
                    this.List[i]['stock_def'] = item.stock;

                    this.Item = [];

                    this.CreateList(i);

                    setTimeout(() => {
                        $('#qty-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    this.List[i].nama = '';

                    setTimeout(() => {
                        this.WaitItem[i] = false;
                        $('#qty-' + SelectExists).focus();
                    }, 250);
                }

            }, 0);

        }

    }
    // => / END : AC Item

    /**
     * Create Print List
     */
    WaitPrint: boolean;

    CreatePrintList() {
        /**
         * Generate Item in Stock
         */
        var Params = {
            NoLoader: 1,
            company: this.form.company,
            storeloc: this.form.storeloc
        };
        this.Busy = true;

        if (!this.Generated) {
            this.Generated = false;
            this.core.Do(this.ComUrl + 'generate.list', Params).subscribe(
                result => {

                    if (result.data) {

                        this.PrintList = result.data;

                    }

                    /**
                     * Create Empty Table
                     */
                    for (let i = 0; i < 45; i++) {
                        this.PrintList.push({});
                    }
                    // => / END : Create Empty Table

                    this.Generated = true;

                    this.WaitPrint = true;
                    setTimeout(() => {

                        $('.print-area').print({
                            globalStyle: true,
                            mediaPrint: true,
                            title: 'STOCK TACKING FORM - ' + this.form.storeloc_kode + ' : ' + this.form.storeloc_nama,
                            timeout: 60000,
                        });

                        setTimeout(() => {
                            this.WaitPrint = false;

                            this.Busy = false;
                        }, 1000);

                    }, 1000);
                },
                error => {
                    this.Busy = false;
                    console.error('Generate List', error);
                }
            );
        } else {
            this.WaitPrint = true;
            setTimeout(() => {

                $('.print-area').print({
                    globalStyle: true,
                    mediaPrint: true,
                    title: 'STOCK TACKING FORM - ' + this.form.storeloc_kode + ' : ' + this.form.storeloc_nama,
                    timeout: 60000,
                });

                setTimeout(() => {
                    this.WaitPrint = false;

                    this.Busy = false;
                }, 1000);

            }, 1000);
        }
        // => / END : Generate Item in Stock
    }
    // => / END : Create Print List

    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            // => Check List
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

        }, 100);

    }

    DeleteList(del) {

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
    // => / END : List

    /**
     * CheckQty
     */
    CheckQty(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            let Qty: number = item.qty;
            let Stock: number = item.stock;

            if (item.id) {

                item.selisih = Qty - Stock;

                item.jurnal = null;
                item.qty_jurnal = 0;
                if (item.selisih < 0) {
                    item.jurnal = 'credit'; // CREDIT
                    item.qty_jurnal = Stock - Qty;
                } else if (item.selisih > 0) {
                    item.jurnal = 'debit';   // DEBIT
                    item.qty_jurnal = Qty - Stock;
                }

            }

        }, 100);

    }
    // => / END : CheckQty

    /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.form.list = JSON.stringify(this.List);

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Data Saved',
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
    // => / END : Simpan

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
                                    info: 'STK Verified'
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
                                    msg: 'Material Transfer Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'STK Rejected'
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
                                    info: 'STK Approved'
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

}