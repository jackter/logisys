import { OnInit, Component } from '@angular/core';
import { Core } from '../../../../providers/core';
import swal from 'sweetalert2';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { PQGenerateDialogComponent } from './generate';
import { PQReplyDialogComponent } from './reply';
import * as _ from 'lodash';
import { PQCompareDialogComponent } from './compare';
import { POFormDialogComponent } from '../../po/dialog/form';

@Component({
    selector: 'dialog-form-pq',
    templateUrl: './form.html'
})
export class PQFormDialogComponent implements OnInit {

    List: any[] = [{
        i: 0
    }];
    SupplierList: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PQFormDialogComponent>
    ) {

    }

    ngOnInit() {

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            if (Object.keys(this.form.list).length > 0) {
                this.List = this.form.list;
            }

            if (this.form.supplier_list && Object.keys(this.form.supplier_list).length > 0) {
                this.SupplierList = this.form.supplier_list;

                for (let item of this.SupplierList) {
                    if (item.jenis) {
                        item.nama_full = item.jenis + ' ' + item.nama;
                    }
                    else {
                        item.nama_full = item.nama;
                    }
                }
            }

        }
        // => / END : Form Edit

        if(this.form.from_pq == 1 && !this.form.is_detail){
            var Len = Object.keys(this.SupplierList).length;
            if (Len > 0) {
                this.SupplierList.push({
                    i: Len
                });
            }
        }

    }

    /**
     * AC Supplier
     */
    Supplier: any;
    WaitSupplier: any[] = [];
    SupplierFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitSupplier[i] = true;

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    keyword: val
                };

                this.core.Do('e/master/supplier/inc/list', Params).subscribe(
                    result => {

                        if (result) {
                            this.Supplier = result;
                        }

                        this.WaitSupplier[i] = false;

                    },
                    error => {
                        console.error('SupplierFilter', error);
                        this.core.OpenNotif(error);
                        this.WaitSupplier[i] = false;
                    }
                );

            }, 100);

        }

    }
    SupplierSelect(e, item, i: number) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.SupplierList, 'id', item.id);

            setTimeout(() => {

                // if(Find.length <= 0){
                this.SupplierList[i] = item;
                if (item.jenis) {
                    this.SupplierList[i]['nama_full'] = item.jenis + ' ' + item.nama;
                }
                else {
                    this.SupplierList[i]['nama_full'] = item.nama;
                }
                this.SupplierList[i]['i'] = i;

                this.Supplier = [];

                this.CreateSupplierList(i);

                setTimeout(() => {
                    $('#sup_remarks-' + i).focus();
                }, 100);
                // }else{
                //     var SelectExists = Find[0].i;

                //     setTimeout(() => {
                //         this.WaitSupplier[i] = false;
                //         $('#sup_remarks-' + SelectExists).focus();
                //     }, 250);
                // }

            }, 0);

        }

    }
    // => / END : AC Supplier

    /**
     * SupplierList
     */
    CreateSupplierList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            // => Check SupplierList
            if (!this.SupplierList[i].kode) {
                this.SupplierList[i] = {};
            }

            // => Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.SupplierList[next]) {
                this.SupplierList.push(DataNext);
            }

        }, 100);

    }

    DeleteSupplierList(del) {

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

                    var DATA = Object.keys(this.SupplierList);

                    // => Delete
                    var NewSupplierList = [];
                    let index = 0;
                    for (let i = 0; i < DATA.length; i++) {
                        if (del == i) {

                            delete this.SupplierList[i];

                        } else {

                            this.SupplierList[i].i = index;

                            NewSupplierList[index] = this.SupplierList[i];
                            index++;
                        }
                    }

                    // => Recreaten
                    this.SupplierList = NewSupplierList;

                }

            }
        );

    }
    // => / END : SupplierList

    /**
     * Edit
     */
    Edit() {
        this.form.is_detail = null;

        var Len = Object.keys(this.SupplierList).length;
        if (Len > 0) {
            this.SupplierList.push({
                i: Len
            });
        }

        setTimeout(() => {
            $('#sup_nama-' + Len).focus();
        }, 100);
    }
    // => / END : Edit

    /**
     * Simpan
     */
    Simpan() {

        this.form.supplier_list = JSON.stringify(this.SupplierList);

        var URL = this.ComUrl + 'add';
        if (this.form.from_pq && this.form.pq_kode) {
            URL = this.ComUrl + 'edit';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (!this.form.from_pq) {
                    this.core.Sharing('reload', 'reload');

                    this.form.quoted = 1;

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Request For Quotations',
                        msg: 'Please go to Purchase Quotations page to Continue the Process!'
                    };
                    this.core.OpenAlert(Success);

                    this.core.send({
                        info: 'PQ Created'
                    });

                    this.dialogRef.close(result);
                } else {
                    this.form.is_detail = true;

                    this.ReloadForm();

                    this.Busy = false;
                }

                var NewSupplierList = [];
                for (let item of this.SupplierList) {
                    if (item.id) {

                        if (!item.count) {
                            item.count = 0;
                        }

                        NewSupplierList.push(item);
                    }
                }
                this.SupplierList = NewSupplierList;

            },
            error => {
                console.error('add', error);
                this.core.OpenNotif(error);

                this.Busy = false;
            }
        );

    }
    // => / END : Simpan

    /**
     * Generate Dialog
     */
    dialogGenerate: MatDialogRef<PQGenerateDialogComponent>;
    dialogGenerateConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowGenerate(data) {

        this.dialogGenerate = this.dialog.open(
            PQGenerateDialogComponent,
            this.dialogGenerateConfig
        );

        /**
         * Inject Data
         */
        this.dialogGenerate.componentInstance.form = this.form;
        this.dialogGenerate.componentInstance.data = data;
        // => / END : Inject Data

        /**
         * After Dialog Close
         */
        this.dialogGenerate.afterClosed().subscribe(result => {
            this.dialogGenerate = null;

            if (result) {
                this.dialogRef.close(result);
            }
        });
        // => / END : After Dialog Close

    }
    // => / END : Generate Dialog

    /**
     * Supplier Reply Dialog
     */
    dialogReply: MatDialogRef<PQReplyDialogComponent>;
    dialogReplyConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowReply(data) {

        // console.log(data);

        var Params = {
            header: this.form.id,
            header_pq_supplier: data.detail_id
        };
        // console.log(Params);
        this.core.Do(this.ComUrl + 'reply.get', Params).subscribe(
            result => {

                this.dialogReply = this.dialog.open(
                    PQReplyDialogComponent,
                    this.dialogReplyConfig
                );

                /**
                 * Inject Data
                 */
                this.dialogReply.componentInstance.ComUrl = this.ComUrl;
                this.dialogReply.componentInstance.data = data;
                this.dialogReply.componentInstance.data.company = this.form.company;
                this.dialogReply.componentInstance.Default = this.Default;
                if (result.data) {
                    var Form = JSON.parse(JSON.stringify(this.form));
                    var Data = _.merge(Form, result.data);

                    this.dialogReply.componentInstance.form = Data;
                } else {
                    this.form.header_pq_supplier = data.detail_id;
                    this.dialogReply.componentInstance.form = JSON.parse(JSON.stringify(this.form));
                }
                // => / END : Inject Data

                /**
                 * After Dialog Close
                 */
                this.dialogReply.afterClosed().subscribe(result => {
                    this.dialogReply = null;

                    /**
                     * Reload Data
                     */
                    if (this.form.verified != 1) {
                        this.ReloadForm();
                    }
                    // => / END : Reload Data

                    if (result) {
                        if (result.quoted == 1) {
                            this.form.quoted = 1;
                        }
                        // this.dialogRef.close(result);
                    }
                });
                // => / END : After Dialog Close

            },
            error => {
                console.log('Get Reply', error);
            }
        );

    }
    // => / END : Supplier Reply Dialog

    /**
     * Dialog Price Comparisons
     */
    dialogCompare: MatDialogRef<PQCompareDialogComponent>;
    dialogCompareConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowCompare(val) {

        var Params = {
            id: this.form.id,
            type : val
        };
        this.core.Do(this.ComUrl + 'comparison', Params).subscribe(
            result => {
                // console.log(result);

                this.dialogCompare = this.dialog.open(
                    PQCompareDialogComponent,
                    this.dialogCompareConfig
                );

                /**
                 * Inject Data
                 */
                this.dialogCompare.componentInstance.Data = result;
                this.dialogCompare.componentInstance.ComUrl = this.ComUrl;
                this.dialogCompare.componentInstance.perm = this.perm;
                this.dialogCompare.componentInstance.form = this.form;
                // => / END : Inject Data

                /**
                 * After Dialog Close
                 */
                this.dialogCompare.afterClosed().subscribe(result => {
                    this.dialogCompare = null;

                    /**
                     * Reload Data
                     */
                    // if(this.form.verified != 1){
                    this.ReloadForm();
                    // }
                    // => / END : Reload Data

                    if (result) {
                        if (result.reopen == 1) {
                            setTimeout(() => {
                                this.ShowCompare(val);
                            }, 250);
                        }
                    }
                });
                // => / END : After Dialog Close

            },
            error => {
                console.error('Comparison', error);
            }
        );

    }
    // => / END : Dialog Price Comparisons

    /**
     * Reload Form
     */
    ReloadForm() {
        var Params = {
            id: this.form.id
        };

        this.core.Do(this.ComUrl + 'get', Params).subscribe(
            result => {

                if (result) {
                    this.form = result.data;
                    this.form.from_pq = 1;
                    this.form.is_detail = true;

                    this.SupplierList = result.data.supplier_list;

                    for (let item of this.SupplierList) {
                        if (item.jenis) {
                            item.nama_full = item.jenis + ' ' + item.nama;
                        }
                        else {
                            item.nama_full = item.nama;
                        }
                    }
                }

            },
            error => {
                console.error('Reload GetForm', error);
                this.core.OpenNotif(error);
            }
        );
    }
    // => / END : Reload Form

    /**
     * Create PO (POForm)
     */
    dialogPO: MatDialogRef<POFormDialogComponent>;
    dialogPOConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPO(supplier) {

        this.dialogPO = this.dialog.open(
            POFormDialogComponent,
            this.dialogPOConfig
        );

        /**
         * Inject Data
         */
        this.form.header_pq_supplier = supplier.detail_id;
        this.form.supplier = supplier.id;
        this.form.supplier_kode = supplier.kode;
        this.form.supplier_jenis = supplier.jenis;
        this.form.supplier_nama = supplier.nama;
        this.form.supplier_alamat = supplier.alamat;
        this.form.po = supplier.po;
        this.form.po_kode = supplier.po_kode;
        this.form.po_tanggal = supplier.po_tanggal;
        this.dialogPO.componentInstance.ComUrl = 'e/snd/po/';
        this.dialogPO.componentInstance.perm = this.perm;
        this.dialogPO.componentInstance.form = this.form;
        // => / END : Inject Data

        // console.log(this.form.supplier);
        // console.log(this.form);

        /**
         * After Dialog Close
         */
        this.dialogPO.afterClosed().subscribe(result => {
            this.dialogPO = null;

            this.ReloadForm();

            if (result) {
                var Success = {
                    type: 'success',
                    showConfirmButton: false,
                    title: 'Success',
                    msg: 'Purchase order is created successfully, Please continue to <b>Purchase Order Page</b> to <b>Submit your PO</b> and continue the process!',
                    width: 500
                };
                this.core.OpenAlert(Success);
            }
        });
        // => / END : After Dialog Close

    }
    // => / END : Create PO (POForm)

    /**
     * Update Print
     */
    BusyPrint: any[] = [];
    UpdatePrint(item, index) {

        var Send = 0;
        var Back = true;
        if (item.print) {
            Send = 1;
            Back = false;
        }

        var Params = {
            detail_id: item.detail_id,
            is_print: Send,
            NoLoader: 1
        };

        // console.log(Params);

        this.BusyPrint[index] = true;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            this.core.Do(this.ComUrl + 'set.print', Params).subscribe(
                result => {
                    // console.log(result);

                    if (result.status == 0) {
                        this.SupplierList[index].print = Back;
                    }
                    this.BusyPrint[index] = null;
                },
                error => {
                    console.error('Set Print', error);

                    this.BusyPrint[index] = null;
                    this.SupplierList[index].print = Back;
                }
            );

        }, 250);

    }
    // => / END : Update Print

}
