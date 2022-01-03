import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from "providers/core";
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-contract',
    templateUrl: './form.html',
    styleUrls: ['../contract.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContractFormDialogComponent implements OnInit {

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
        public dialogRef: MatDialogRef<ContractFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {
        this.Product = this.Default.produk;

        if (this.form.id != 'add') {

            // if(this.form.tanggal){
            //     this.form
            // }
        }

    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    Simpan() {

        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

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
    }
    // => END : AC Supplier

    /**
     * AC Produk
     */
    Product: any = [];
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
                $('*[name="qty"]').focus();
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
    }
    // => End Produk
}