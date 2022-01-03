import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-cancel-po',
    templateUrl: './cancel.html',
    styleUrls: ['../po.component.scss']
})
export class POCancelFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<POCancelFormDialogComponent>
    ) { }

    ngOnInit() {
        if (this.form.tanggal) {
            this.form.tanggal_show = moment(this.form.tanggal).format('DD/MM/YYYY');

            for (let item of this.form.detail) {
                if (!item.qty_cancel) {
                    item.qty_cancel = 0;
                }
            }
        }
    }

    Calculate(item) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (!item.qty_cancel) {
                item.qty_cancel = 0;
            }
            else {
                var Outstanding: number = Number(item.outstanding) - Number(item.qty_canceled);

                if (item.qty_cancel > Outstanding) {
                    item.qty_cancel = Outstanding;
                }
            }

        }, 100);

    }

    /**
     * Simpan
     */
    Simpan() {

        var total: number = 0;
        var tax_base: number = 0;
        var grand_total: number = 0;
        var ppn: number = 0;
        var pph: number = 0;
        for (let item of this.form.detail) {
            total = Number(total) + Number((item.qty_po - item.qty_canceled - item.qty_cancel) * item.price);

            if (this.form.ppn > 0) {
                ppn = Number(ppn) + Number((((item.qty_po - item.qty_canceled - item.qty_cancel) * item.price) / 100 * (100 - this.form.disc)) / 100 * this.form.ppn);
            }

            if (this.form.pph > 0 && item.pph > 0) {
                pph = Number(pph) + Number((((item.qty_po - item.qty_canceled - item.qty_cancel) * item.price) / 100 * (100 - this.form.disc)) / 100 * this.form.pph);
            }
        }

        tax_base = Number(total / 100 * (100 - this.form.disc));
        grand_total = Number(tax_base) + Number(ppn) - Number(pph) + Number(this.form.other_cost);

        this.form.total = total;
        this.form.tax_base = tax_base;
        this.form.grand_total = grand_total;

        if (this.form.detail) {
            this.form.list = JSON.stringify(this.form.detail);
        }

        this.Busy = true;
        this.core.Do(this.ComUrl + 'cancel', this.form).subscribe(
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
    // => / END : Simpan

}
