import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'dialog-form-printSalesContract',
    templateUrl: './print.html'
})
export class ContractPrintDialogComponent {

    WaitPrint: boolean;

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;
    Eng = false;

    Delay;
    List: any;
    Notes: any;
    Others: any;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ContractPrintDialogComponent>,
        public sanitize: DomSanitizer
    ) { }


    ngOnInit() {

        this.form.jenis_barang = this.form.item_nama;
        this.form.kuantitas = this.form.qty;
        this.form.toleransi = this.form.toleransi;
        this.form.company_alamat = this.form.company_alamat.split("\\\\n").join("<br/>");

        if (this.form.mutu) {
            this.List = JSON.parse(this.form.mutu);
        }

        if(this.form.notes) {
            this.Notes = JSON.parse(this.form.notes);
        }

        if(this.form.others) {
            this.Others = JSON.parse(this.form.others);
        }

        var Harga = 0;
        if (this.form.ppn) {
            if (this.form.inclusive_ppn) {
                Harga = this.form.sold_price;
            } else {
                Harga = this.form.sold_price * 1.1;
            }
        } else {
            Harga = this.form.sold_price;
        }

        this.form.grand_total = Math.round(Harga * this.form.qty);

        this.form.harga_satuan = this.core.rupiah(Harga);
        if (this.form.currency != 'IDR') {
            this.form.harga_satuan = this.core.rupiah(Harga, 3);
        }

        this.form.terbilang = this.core.terbilang_koma(this.form.grand_total, this.form.currency);
        this.form.terbilangEng = this.core.inWords(this.form.grand_total);
    }

    rupiah(val) {
        return this.core.rupiah(val);
    }

    date_indo(val) {
        if(val) {
            return moment(val).locale('id').format('LL');
        }
    }

    date_eng(val) {
        if(val) {
            return moment(val).format('DD MMMM YYYY');
        }
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area-sales').print({
                globalStyle: true,
                mediaPrint: true,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
