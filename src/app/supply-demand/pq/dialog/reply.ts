import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';
import { MatDialogRef } from '@angular/material';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-reply-pq',
    templateUrl: './reply.html',
    styleUrls: [
        '../pq.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class PQReplyDialogComponent implements OnInit {

    Busy: boolean;
    ComUrl;
    data: any;
    form: any;

    minDate = moment(new Date()).format('YYYY-MM-DD').toString();

    Default: any;

    RowPPh: any[] = [];
    Cur: any;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<PQReplyDialogComponent>
    ) {

    }

    ngOnInit() {

        if (!this.form.pph_code && !this.form.pph) {
            this.form.pph_code = '';
        }

        if (this.form.id == 'add') {
            this.form.ppn = 10;
        }

        this.form.header = this.form.id;

        if (this.data.company != 3) {
            this.form.customs = 2;
        }

        if (this.form.price_expire) {
            this.form.price_expire = moment(this.form.price_expire, 'YYYY-MM-DD');
        }

        for (let item of this.Default.pph) {
            if (item.company == this.form.company) {
                this.RowPPh.push(item);
            }
        }
        this.Cur = this.Default.currency;

        if (this.Default.list_storeloc) {
            this.Storeloc = _.filter(this.Default.list_storeloc, {
                company: this.data.company
            });
        }

        if(!this.form.pph_code){
            this.form.pph_code = "";
        }

        this.CalculateDisc();
    }

    /**
     * Storeloc
     */
    Storeloc: any = [];
    StorelocSelect(e, item) {
        if (e.isUserInput) {
            this.form.storeloc = item.id;
            this.form.storeloc_kode = item.kode;
            this.form.storeloc_nama = item.nama;

        }
    }
    //=> END : Storeloc

    CalculateDisc() {
        var Subtotal_credit: number = 0;
        var Subtotal_cash: number = 0;

        for (let item of this.form.list) {
            if (item.prc_cash) {
                Subtotal_cash += item.qty_supplier * item.prc_cash;
            }
            else {
                Subtotal_cash += item.qty_supplier * 0;
            }

            if (item.prc_credit) {
                Subtotal_credit += item.qty_supplier * item.prc_credit;
            }
            else {
                Subtotal_credit += item.qty_supplier * 0;
            }
        }

        if (this.form.disc_cash) {
            this.form.disc_cash_amt = Subtotal_cash / 100 * this.form.disc_cash;
        }
        else if (this.form.disc_credit) {
            this.form.disc_credit_amt = Subtotal_credit / 100 * this.form.disc_credit;
        }
    }

    /**
     * Simpan
     */
    Simpan() {

        this.form.data = JSON.stringify(this.data);
        this.form.quoted = JSON.stringify(this.form.list);

        var FindStoreloc = _.find(this.Default.list_storeloc, {
            id: Number(this.form.storeloc)
        });

        if (FindStoreloc) {
            this.form.storeloc_nama = FindStoreloc.nama;
            this.form.storeloc_kode = FindStoreloc.kode;
        } else {
            if (this.form.storeloc == -1) {
                this.form.storeloc_nama = 'LOCO';
            }
        }

        this.form.price_expire = moment(this.form.price_expire).format('YYYY-MM-DD');

        var continued = true;     

        if (this.form.pph) {
            var PphSelected = false;
            for (let item of this.form.list) {
                if (item.pph == 1) {
                    PphSelected = true;
                }
            }

            if (PphSelected == false) {
                this.alertPPh();
                continued = false;
            }
        }

        if (continued) {
            this.Busy = true;
            this.core.Do(this.ComUrl + 'reply', this.form).subscribe(
                result => {

                    if (result.status == 1) {

                        this.form.quoted = 1;
                        this.core.Sharing('reload', 'reload');

                    } else {

                        var Alert = {
                            error_msg: result.error_msg
                        };
                        this.core.OpenAlert(Alert);

                    }

                    this.Busy = false;

                },
                error => {
                    console.error('reply', error);
                }
            );
        }

    }
    // => / END : Simpan

    /**
     * Close Dialog
     */
    CloseDialog(quoted) {
        this.dialogRef.close({ quoted: quoted });
    }
    // => / END : Close Dialog

    /**
     * Set PPh
     */
    SetPPh() {

        if (this.form.pph_code) {
            var PPh = this.Default.pph;
            PPh = this.core.FJSON2(PPh, 'code', this.form.pph_code);
            PPh = PPh[0];

            this.form.pph = PPh.rate;

        } else {
            this.form.pph = 0;
        }

    }
    // => / END : Set PPh

    /**
     * Disc Change
     */
    DishChange(type_a, type_b) {
        var Subtotal_credit: number = 0;
        var Subtotal_cash: number = 0;

        for (let item of this.form.list) {
            if (item.prc_cash) {
                Subtotal_cash += item.qty_supplier * item.prc_cash;
            }
            else {
                Subtotal_cash += item.qty_supplier * 0;
            }

            if (item.prc_credit) {
                Subtotal_credit += item.qty_supplier * item.prc_credit;
            }
            else {
                Subtotal_credit += item.qty_supplier * 0;
            }
        }

        if (type_a == 'cash') {
            if (type_b == 'pct') {
                this.form.disc_cash_amt = Subtotal_cash / 100 * this.form.disc_cash;
            }
            else if (type_b == 'amt') {
                this.form.disc_cash = this.form.disc_cash_amt / Subtotal_cash * 100;
            }
        }
        else if (type_a == 'credit') {
            if (type_b == 'pct') {
                this.form.disc_credit_amt = Subtotal_credit / 100 * this.form.disc_credit;
            }
            else if (type_b == 'amt') {
                this.form.disc_credit = this.form.disc_credit_amt / Subtotal_credit * 100;
            }
        }
    }
    // => / END : Disc Change

    alertWeightBase() {
        if (this.form.weight_base == 1) {
            this.core.OpenAlert({
                type: 'warning',
                title: 'Weight Base in Supplier',
                msg: '<div>Warning, Invoice references will be based on suppliers not from Good Receipt.</div>',
                width: 400
            });
        }
    }

    alertPOContract() {
        if (this.form.po_contract == 1) {
            this.core.OpenAlert({
                type: 'warning',
                title: 'PO is related with contract',
                msg: '<div>Warning, You must put contract refference before submit PO.</div>',
                width: 400
            });
        }
    }

    alertPPh() {
        this.core.OpenAlert({
            type: 'warning',
            title: 'PPH has not been selected.',
            msg: '<div>Warning, You have not specified an item for which you wish to be given income tax.</div>',
            width: 400
        });
    }

}
