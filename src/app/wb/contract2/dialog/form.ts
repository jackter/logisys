import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatChipInputEvent, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';
import * as _ from 'lodash';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-contract',
    templateUrl: './form.html',
    styleUrls: ['../contract2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class Contract2FormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    maxDate;

    constructor(
        public core: Core,
        public dialogRef: MatDialogRef<Contract2FormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {
        this.Product = this.Default.produk;

        // if(this.form.id != 'add') {
        //     this.POSelected = this.form.list_po;
        // }

        if (this.form.list_po) {
            for (let item of this.form.list_po) {
                this.POSelected.push({
                    id: item.id,
                    kode: item.kode,
                });
            }
        }

    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    FocusTo() {

        setTimeout(() => {
            $('*[name="kode"]').focus();
        }, 100);
    }

    /**
    * AC Supplier
    */
    Supplier: any;
    SupplierFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.supplier', Params).subscribe(
                result => {

                    if (result) {
                        this.Supplier = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }

    SupplierSelect(e, item) {

        if (e.isUserInput) {

            this.form.supplier = item.id;
            this.form.supplier_kode = item.kode;
            this.form.supplier_nama = item.nama;

            setTimeout(() => {
                $('*[name="product_nama"]').focus();
            }, 100);

        }
    }

    SupplierRemove() {
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.product = null;
        this.form.product_nama = null;

        this.form.po = null;
        this.form.po_kode = null;
    }
    // => END : AC Supplier

    /**
     * AC Produk
     */
    Product: any = [];
    ProductLen: any = [];
    ProductLast;

    ProductFilter(val) {
        // if (val != this.ProductLast) {
        //     this.form.product = null;
        //     this.form.product_kode = null;
        //     this.form.product_nama = null;
        // }

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.produk) {

                if (
                    item.produk_nama.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Product = Filtered;

        } else {
            this.Product = this.Default.produk;
        }

    }

    ProductSelect(e, item) {

        if (e.isUserInput) {

            this.form.product = item.produk;
            this.form.product_kode = item.produk_kode;
            this.form.product_nama = item.produk_nama;
            this.form.item = item.item;
            this.form.item_kode = item.item_kode;
            this.form.item_nama = item.item_nama;
            this.form.item_satuan = item.item_satuan;

            setTimeout(() => {
                $('*[name="po_kode"]').focus();
            }, 100);
        }

    }

    ProductRemove() {

        this.form.product = null;
        this.form.product_kode = null;
        this.form.product_nama = null;
        this.form.item = null;
        this.form.item_kode = null;
        this.form.item_nama = null;
        this.form.item_satuan = null;

        this.Default.produk;
    }
    // => End Produk

    /**
     * AC PO Code
     */
    POCode: any;
    POSelected: any[] = [];
    ListPORemove: any[] = [];
    DelayAutocomplete: any;
    removable = true;
    selectable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    POCodeFilter(val: string) {

        var PO = '',
            Comma = '';
        if (this.POSelected) {
            for (let item of this.POSelected) {
                if (item.id) {
                    PO += Comma + item.id;
                    Comma = ',';
                }
            }
        }

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                supplier: this.form.supplier,
                po: PO
            };

            this.core.Do(this.ComUrl + 'list.po', Params).subscribe(
                result => {
                    if (result) {
                        this.POCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }

    POCodeSelect(e, item) {
        if (e.isUserInput) {
            clearTimeout(this.DelayAutocomplete);
            this.DelayAutocomplete = setTimeout(() => {
                var Exists = this.core.FJSON2(this.POSelected, 'id', item.id);

                if (Exists.length <= 0) {
                    this.POSelected.push({
                        id: item.id,
                        kode: item.kode
                    });
                }

                $('*[name="po_kode"]').val('');
            }, 100);
        }
    }

    addPO(event: MatChipInputEvent): void {
        $('*[name="po_kode"]').val('');
        this.POCodeFilter('');
    }

    removePO(PO: string): void {
        const index = this.POSelected.indexOf(PO);  

        this.ListPORemove.push({
            id: this.POSelected[index].id,
            kode: this.POSelected[index].kode
        });

        if (index >= 0) {
            this.POSelected.splice(index, 1);
        }
    }

    Simpan() {

        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        this.form.list_po = JSON.stringify(this.POSelected);
        

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        console.log(this.form);


        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

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
                                    info: 'Contract Approved'
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

}
