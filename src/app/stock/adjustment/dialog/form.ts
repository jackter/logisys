
import { OnInit, Component } from '@angular/core';
import swal from 'sweetalert2';
import { Core } from 'providers/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { StockAdjPrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-adjustment',
    templateUrl: './form.html'
})
export class AdjustmentFormComponent implements OnInit {

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
        private dialogRef: MatDialogRef<AdjustmentFormComponent>,
        private dialog: MatDialog
    ) { }


    ngOnInit() {
        this.Company = this.Default.company;

        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
        }

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
            this.form.adj_qty = 1;
        }

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;

                /**
                 * Set Current Val
                 */
                for (let item of this.List) {
                    if (
                        item.stock &&
                        item.price
                    ) {
                        item.current_val = Number(item.stock) * Number(item.price);
                    }
                }
                // => END : Set Current Val
            }

        }
        // => / END : Form Edit
    }

    Edit() {
        this.form.is_detail = null;
        setTimeout(() => {
            $('*[name="remarks"]').focus();
        }, 100);
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
                $('*[name="tanggal"]').focus();
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

                this.core.Do(this.ComUrl + 'list.item', Params).subscribe(
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

        if (e.isUserInput && item.item_type == 1) {

            var Find = this.core.FJSON(this.List, 'id', item.id);
            /*var Find: any = _.result(_.find(this.List, {
                id: item.id
            }), 'id');*/

            setTimeout(() => {

                if (Find.length <= 0) {
                    this.List[i] = item;
                    this.List[i]['i'] = i;
                    this.List[i]['stock_def'] = item.stock;
                    this.List[i]['current_val'] = Number(item.stock) * Number(item.price);

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

            if (item.id) {


                let Qty: number = item.qty;
                let Stock: number = item.stock;

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
    CheckVal(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (item.id) {

                let CurrentVal: number = item.current_val;
                let NewVal: number = item.val;
                let Selisih: number = item.selisih_val;

                Selisih = NewVal - CurrentVal;

                item.selisih_val = Selisih;

                item.jurnal_acc = null;
                if (item.selisih_val < 0) {
                    item.jurnal_acc = 'credit';
                    item.val_jurnal_acc = Selisih * -1;
                } else if (item.selisih_val > 0) {
                    item.jurnal_acc = 'debit';
                    item.val_jurnal_acc = Selisih;
                }

            }

        }, 100);

    }
    // => / END : CheckQty

    /**
     * Check Selisih
     */
    CheckSelisih(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (item.id) {

                let Stock: number = item.stock;
                let Selisih: number = item.selisih;

                item.qty = Number(Stock) + Number(Selisih);

                item.jurnal = null;
                item.qty_jurnal = 0;
                if (item.selisih < 0) {
                    item.jurnal = 'credit'; // CREDIT
                    item.qty_jurnal = Stock - item.qty;
                } else if (item.selisih > 0) {
                    item.jurnal = 'debit';   // DEBIT
                    item.qty_jurnal = item.qty - Stock;
                }

            }

        }, 100);

    }
    CheckSelisihVal(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (item.id) {

                let CurrentVal: number = item.current_val;
                let NewVal: number = item.val;
                let Selisih: number = item.selisih_val;

                NewVal = Number(CurrentVal) + Number(Selisih);
                item.val = NewVal;

                item.jurnal_acc = null;
                item.val_jurnal_acc = Selisih;
                if (item.selisih_val < 0) {
                    item.jurnal_acc = 'credit';
                    item.val_jurnal_acc = Selisih * -1;
                } else if (item.selisih_val > 0) {
                    item.jurnal_acc = 'debit';
                    item.val_jurnal_acc = Selisih;
                }

            }

        }, 100);

    }
    // => / END : Check Selisih

    /**
     * Calculate New Price
     */
    CalculateNewPrice(cb) {

        for (let item of this.List) {

            let NewPrice: number = 0;
            let JurnalPrice: number = 0;

            /**
             * New QTY & New Val
             */
            if (
                // Number(item.qty) > 0 && 
                this.form.adj_qty == 1 &&
                // Number(item.val) > 0 &&
                this.form.adj_value == 1
            ) {
                console.log('Skema 1');
                NewPrice = Number(item.val) / Number(item.qty);
                JurnalPrice = Number(item.selisih_val) / Number(item.selisih);
            } else
                // => / END : New QTY & New Val

                /**
                 * New Qty & No New Val
                 */
                if (
                    // Number(item.qty) > 0 && 
                    this.form.adj_qty == 1 &&
                    // !item.val && 
                    this.form.adj_value != 1
                ) {
                    console.log('Skema 2');
                    JurnalPrice = 0;
                    NewPrice = Number(item.current_val) / Number(item.qty);

                    item.val = 0;
                    item.val_jurnal_acc = 0;
                } else
                    // => / END : New Qty & No New Val

                    /**
                     * No New Qty & New Val
                     */
                    if (
                        // !item.qty && 
                        this.form.adj_qty != 1 &&
                        // Number(item.val) > 0 && 
                        this.form.adj_value == 1
                    ) {
                        console.log('Skema 3');
                        JurnalPrice = 0;
                        NewPrice = Number(item.val) / Number(item.stock);

                        item.qty = 0;
                        item.qty_jurnal = 0;
                    }
            // => / END : No New Qty & New Val

            if (NewPrice != 0) {
                item.price_new = NewPrice;
                item.price_new_stock = JurnalPrice;
            }

        }

        cb();
    }
    // => / END : Calculate New Price

    /**
     * Simpan
     */
    Simpan() {

        this.CalculateNewPrice(() => {

            var URL = this.ComUrl + 'edit';
            if (this.form.id == 'add') {
                URL = this.ComUrl + 'add';
            }

            this.form.list = JSON.stringify(this.List);
            this.form.tanggal = moment(this.form.tanggal, 'DD/MM/YYYY').format('YYYY-MM-DD');

            if (this.form.adj_qty) {
                this.form.adj_qty = 1;
            }
            if (this.form.adj_value) {
                this.form.adj_value = 1;
            }

            // console.log(this.form);

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

        });

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
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    this.CheckCOA(() => {

                        var Params = {
                            id: this.form.id,
                            kode: this.form.kode,
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

                    });

                }

            }
        );
    }
    // => / END : Verify

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
                        company: this.form.company,
                        dept: this.form.dept,
                        kode: this.form.kode,
                        tanggal: this.form.tanggal,
                        storeloc: this.form.storeloc,
                        list: JSON.stringify(this.List),
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Job Order now available for Actual Production'
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

    /**
     * Check COA
     */
    CheckCOA(cb) {

        /**
         * Merge List
         */
        var CheckIDList = [];
        for (let item of this.List) {
            CheckIDList.push({
                grup: item.grup,
                grup_nama: item.grup_nama
            });
        }

        var ParamsCheck: any = {
            company: this.form.company,
            list: JSON.stringify(CheckIDList),
        };

        // => / END : Merge List

        this.core.Do('e/stock/item/check.coa', ParamsCheck).subscribe(
            result => {

                if (result.status != 1  && this.form.enable_journal == 1) {

                    /**
                     * Create MSG
                     */
                    var MSG = '';
                    if (result.items) {
                        MSG = `
                        <div style="text-align: left!important">
                            <div>To verify transaction ref. <strong>${this.form.kode}</strong></div>
                            <div>Please call Accounting Dept to complete COA for the following items:</div>
                            <ol>
                        `;
                        for (let item of result.items) {
                            MSG += `
                                <li>
                                    <strong>${item.kode}</strong> : ${item.nama}
                                </li>
                            `;
                        }
                        MSG += `
                            </ol>
                        </div>
                        `;
                    }
                    // => / END : Create MSG

                    this.core.OpenAlert({
                        title: 'Item COA Not Available',
                        msg: MSG,
                        width: 600
                    });

                } else {
                    cb();
                }

            }
        );

    }
    // => / END : Check COA

    /**
     * AC COA
     */
    COA: any;
    // WaitItem: any[] = [];
    async COAFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitItem[i] = true;

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

                        this.WaitItem[i] = false;
                    },
                    error => {
                        console.error('Coa Filter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }

                );

            }, 100);

        }

    }
    COASelect(e, item, i: number) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.List[i]['coa'] = item.id;
                this.List[i]['coa_kode'] = item.coa_kode;
                this.List[i]['coa_nama'] = item.coa_nama;

            }, 0);

        }

    }
    removeCoa(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            item.coa = null;
            item.coa_kode = null;
            item.coa_nama = null;
        }, 100);
    }
    // => End AC COA

        /**
     * Show Detail
     */
    dialogPrint: MatDialogRef<StockAdjPrintDialogComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {

        this.dialogPrint = this.dialog.open(
            StockAdjPrintDialogComponent,
            this.dialogPrintConfig
        );

        this.dialogPrint.componentInstance.form = this.form;

        this.dialogPrint.afterClosed().subscribe(result => {

            this.dialogPrint = null;

        });

    }
    // => / END : Show Detail
}
