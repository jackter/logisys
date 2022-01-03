import { Component, ViewEncapsulation, OnInit } from "@angular/core";
import * as moment from 'moment';
import { Core } from 'providers/core';

@Component({
    selector: 'dialog-form-sales_order_detail',
    templateUrl: './detail.html'
})
export class SalesOrderDetailDialogComponent implements OnInit {
    ComUrl;

    form: any;
    item: any;
    Data: any = [];
    WaitPrint: boolean;
    Busy;
    Additional: any;
    Document: any;

    constructor(
        private core: Core
    ) {

    }

    ngOnInit() {
        if(this.form.tanggal) {
            this.form.tanggal_show = moment(this.form.tanggal, 'DDMMYYYY').format('DD/MM/YYYY');
        }
        if(this.form.kontrak_tanggal) {
            this.form.kontrak_tanggal_show = moment(this.form.kontrak_tanggal,'YYYY-MM-DD').format('DD/MM/YYYY');
        }

        if(this.form.additional) {
            this.Additional = JSON.parse(this.form.additional);
        }

        if(this.form.dokumen) {
            this.Document = JSON.parse(this.form.dokumen);
        }
    }

    rupiah(val) {
        if(val) {
            return this.core.rupiah(val);
        }
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'SALES ORDER NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}