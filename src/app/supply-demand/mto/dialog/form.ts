import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-mt',
    templateUrl: './form.html'
})
export class MTOFormDialogComponent implements OnInit {

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

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<MTOFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;
        this.CompanyTo = this.Default.company;

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

            this.FStore = this.Company[0].store_all;
            this.FStoreKeep = this.Company[0].store_all;
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

    Focus(){
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 250);
    }

    Check(){
        // if(!this.form.check){

            this.form.company_to = null;
            this.form.company_nama_to = null;
            this.form.company_abbr_to = null;

            this.TStore = null;
            this.TStoreKeep = null;

            this.form.from_storeloc = null;
            this.form.from_storeloc_kode = null;
            this.form.from_storeloc_nama = null;

            this.form.to_storeloc = null;
            this.form.to_storeloc_kode = null;
            this.form.to_storeloc_nama = null;

            
        // }
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 250);
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

            this.form.company_to = null;
            this.form.company_abbr_to = null;
            this.form.company_nama_to = null;

            this.form.from_storeloc = null;
            this.form.from_storeloc_kode = null;
            this.form.from_storeloc_nama = null;
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

            this.FStore = item.store_all;
            this.FStoreKeep = item.store_all;

            if(this.form.check){
                setTimeout(() => {
                    $('*[name="company_nama_to"]').focus();
                }, 100);
            }else{
                setTimeout(() => {
                    $('*[name="from_storeloc_nama"]').focus();
                }, 100);
            }
            
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
     * AC Company To
     */
    CompanyTo: any = [];
    CompanyLenTo: number;
    CompanyLastTo;
    CompanyFilterTo() {

        var val = this.form.company_nama_to;

        if (val != this.CompanyLastTo) {
            this.form.company_to = null;
            this.form.company_abbr_to = null;

            this.form.from_storeloc = null;
            this.form.from_storeloc_kode = null;
            this.form.from_storeloc_nama = null;

            this.form.to_storeloc = null;
            this.form.to_storeloc_kode = null;
            this.form.to_storeloc_nama = null;
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
            this.CompanyTo = Filtered;

        } else {
            this.CompanyTo = this.Default.company;
        }

    }
    CompanySelectTo(e, item) {
        if (e.isUserInput) {
            this.form.company_to = item.id;
            this.form.company_nama_to = item.nama;
            this.form.company_abbr_to = item.abbr;

            this.CompanyLastTo = item.nama;

            this.TStore = item.store_all;
            this.TStoreKeep = item.store_all;

            setTimeout(() => {
                $('*[name="from_storeloc_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemoveTo() {

        $('#company_nama_to').blur();

        this.form.company_nama_to = '';
        setTimeout(() => {
            this.CompanyFilterTo();
        }, 100);
    }
    // => / END : AC Company To

    /**
     * AC FStore
     */
    FStore: any = [];
    FStoreKeep: any = [];
    FStoreLast: any = [];
    FStoreFilter() {

        var val = this.form.from_storeloc_nama;

        setTimeout(() => {
            if ($('#from_storeloc_nama').not(':focus')) {
                $('#from_storeloc_nama').focus();
            }
        }, 100);

        if (val != this.FStoreLast) {

            this.form.from_storeloc = null;
            this.form.from_storeloc_kode = null;

            this.form.to_storeloc = null;
            this.form.to_storeloc_kode = null;
            this.form.to_storeloc_nama = null;

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.FStoreKeep) {

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
            this.FStore = Filtered;

        } else {
            this.FStore = this.FStoreKeep;
        }

    }
    FStoreSelect(e, item) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.form.from_storeloc = item.id;
                this.form.from_storeloc_kode = item.kode;
                this.form.from_storeloc_nama = item.nama;

                this.FStoreLast = item.id;

                if(!this.form.check){

                    /**
                     * Define to Store
                     */
                    var Company: any = _.find(this.Default.company, {
                        id: this.form.company
                    });
                    var TStore: any = Company.store_all;
                    // => / END : Define to Store
    
                    /**
                     * Remove Selected FStore
                     */
                    TStore = _.filter(TStore, function (o) {
                        return o.id != item.id;
                    });
                    this.TStore = TStore;
                    this.TStoreKeep = TStore;
                    // => / END Remove Selected FStore
    
                    
                }
                setTimeout(() => {
                    $('#to_storeloc_nama').focus();
                }, 100);

            }, 100);

        }

    }
    FStoreRemove() {

        $('#from_storeloc_nama').blur();

        this.form.from_storeloc_nama = '';
        setTimeout(() => {
            this.FStoreFilter();
        }, 100);
    }
    // => / END : AC FStore

    /**
     * AC TStore
     */
    TStore: any = [];
    TStoreKeep: any = [];
    TStoreLast: any = [];
    TStoreFilter() {

        var val = this.form.to_storeloc_nama;

        setTimeout(() => {
            if ($('#to_storeloc_nama').not(':focus')) {
                $('#to_storeloc_nama').focus();
            }
        }, 100);

        if (val != this.TStoreLast) {

            this.form.to_storeloc = null;
            this.form.to_storeloc_kode = null;

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.TStoreKeep) {

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
            this.TStore = Filtered;

        } else {
            this.TStore = this.TStoreKeep;
        }

    }
    TStoreSelect(e, item) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.form.to_storeloc = item.id;
                this.form.to_storeloc_kode = item.kode;
                this.form.to_storeloc_nama = item.nama;

                this.TStoreLast = item.id;

                setTimeout(() => {
                    $('#note').focus();
                }, 100);

            }, 100);

        }

    }
    TStoreRemove() {

        $('#to_storeloc_nama').blur();

        this.form.to_storeloc_nama = '';
        setTimeout(() => {
            this.TStoreFilter();
        }, 100);
    }
    // => / END : AC TStore

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
                    storeloc: this.form.from_storeloc
                };

                this.core.Do('e/stock/item/inc/list.instock', Params).subscribe(
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

            let Qty = item.qty;
            let Stock = item.stock;
            let StockDef = item.stock_def;

            if (item.id) {

                item.stock = Number(StockDef) - Number(Qty);

                if (Number(Qty) > Number(StockDef)) {
                    item.qty = StockDef;
                    item.stock = 0;
                }

            }

            this.CheckTotal();

        }, 100);

    }
    Total: number;
    CheckTotal() {
        this.Total = 0;
        for (let item of this.List) {
            if (item.id && item.qty > 0) {
                this.Total += item.qty;
            }
        }
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

        if(!this.form.company_to){
            this.form.company_to = this.form.company;
            this.form.company_abbr_to = this.form.company_abbr;
            this.form.company_nama_to = this.form.company_nama;
        }

        this.form.list = JSON.stringify(this.List);
        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

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

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MT Verified'
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

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Material Transfer Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MT Rejected'
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

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MT Approved'
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
