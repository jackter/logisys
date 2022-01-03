import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-printSp3',
    templateUrl: './print.html',
    styleUrls: ['./print.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PaymentRequestPrintDialogComponent implements OnInit {

    WaitPrint: boolean;

    formSP3: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PaymentRequestPrintDialogComponent>
    ) { }


    ngOnInit() {

        this.formSP3.terbilang = this.core.terbilang_koma(this.formSP3.total, this.formSP3.currency);

        this.formSP3.tanggal = moment(this.formSP3.tanggal).format('DD-MM-YYYY');
        this.formSP3.po_tgl = moment(this.formSP3.po_tgl).format('DD-MM-YYYY');

        if (this.formSP3.is_manual == 0) {
            this.formSP3.ref_kode = '( Inv Ref Supplier : ';
        }

        var i = 0;
        if (this.formSP3.inv_ref) {
            for (let detail of this.formSP3.inv_ref) {
                if (i > 0) {
                    this.formSP3.ref_kode += ',';
                }

                this.formSP3.ref_kode += detail['ref_kode'];
                i++;
            }
        }

        if (typeof this.formSP3.journal === undefined) {
            this.formSP3.journal = [];
        }

        if (this.formSP3.is_manual == 0) {
            this.formSP3.ref_kode += ' )';
        }

    }

    rupiah(val) {
        return this.core.rupiah(val);
    }

    PrintSP3() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'SP3 NO# ' + this.formSP3.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}