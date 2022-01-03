import { Component, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as moment from 'moment';
import { MatDialogRef } from '@angular/material';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-po_create',
    templateUrl: './create.html',
    styleUrls: ['../po.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class POCreateFormDialogComponent {

    Busy;

    form: any = {};
    ComUrl: string;
    perm: any;
    Delay: any;
    Default: any;
    Cur: any;

    maxDate = moment(new Date());

    minDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<POCreateFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Cur = this.Default.currency;

        if(!this.form.pph_code){
            this.form.pph_code = "";
        }
    }

    isEmpty(obj) {
        return this.core.isEmpty(obj);
    }

    /**
     * AC PRCode
     */
    PRCode: any;
    PRCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.pr', Params).subscribe(
                result => {

                    if (result) {
                        this.PRCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);

    }
    PRCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.pr_kode = item.kode;
            this.form.pr = item.id;
            this.form.mr = item.mr;
            this.form.mr_kode = item.mr_kode;
            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;
            this.form.list = item.list;
            this.form.allchecked = item.allchecked;

            var Storeloc = _.filter(this.Default.storeloc, {
                company: item.company
            }); 

            this.Storeloc = Storeloc;
            this.StorelocDef = Storeloc;

            setTimeout(() => {
                this.CheckAllChecked();
                $('#supplier_nama').focus();
            }, 100);

        }

    }
    PRCodeRemove() {

        this.form.pr_kode = null;
        this.form.pr = null;
        this.form.mr = null;
        this.form.mr_kode = null;
        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;
        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
        this.form.list = null;
        this.form.allchecked = 0;

        this.StorelocReset();

        setTimeout(() => {
            this.PRCodeFilter(this.form.pr_kode);
        }, 100);
    }
    // => / END : AC PRCode

    /**
     * AC Supplier
     */
    Supplier: any;
    SupplierFilter(val) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do('e/master/supplier/inc/list', Params).subscribe(
                result => {

                    if (result) {
                        this.Supplier = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);

    }
    SupplierSelect(e, item) {

        if (e.isUserInput) {

            this.form.supplier_nama = item.nama;
            this.form.supplier = item.id;
            this.form.supplier_kode = item.kode;

            var Params = {
                pr: this.form.pr,
                supplier: this.form.supplier
            }
            this.core.Do(this.ComUrl + 'detail.supplier', Params).subscribe(
                result => {

                    if (result) {

                        for(let item of this.form.list) {

                            for(let detail of result.data) {
                                
                                if(item.id == detail.item) {
                                    item.qty_po = detail.qty_supplier;
                                    if(detail.prc_cash != 0) {
                                        item.prc_cash = detail.prc_cash;
                                    }
                                    if(detail.prc_credit != 0) {
                                        item.prc_credit = detail.prc_credit;
                                    }
                                    item.origin = detail.origin_quality;
                                    item.remarks = detail.remarks;
                                    item.pph = detail.pph;
                                }
                            }
                            
                        }
                        
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

            setTimeout(() => {
                $('*[name="tanggal"]').focus();
            }, 100);

        }

    }
    SupplierRemove() {

        this.form.supplier_kode = null;
        this.form.supplier = null;
        this.form.supplier_nama = null;
        setTimeout(() => {
            this.SupplierFilter(this.form.supplier_nama);
        }, 100);
    }
    // => / END : AC Supplier

    /**
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocDef: any = [];
    StorelocFilter(val) {

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.StorelocDef) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    item.kode.toString().toLowerCase().indexOf(val) != -1 ||
                    item.nama.toString().toLowerCase().indexOf(val) != -1 ||
                    Combine.toString().toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Storeloc = Filtered;

        } else {
            this.Storeloc = this.StorelocDef;
        }

    }
    StorelocSelect(e, item) {
        if (e.isUserInput) {
            this.form.storeloc = item.id;
            this.form.storeloc_kode = item.kode;
            this.form.storeloc_nama = item.nama;

            setTimeout(() => {
                $('*[name="note"]').focus();
            }, 100);
        }
    }
    StorelocReset() {
        this.form.storeloc = null;
        this.form.storeloc_kode = null;
        this.form.storeloc_nama = null;
    }
    // => / END : AC Storeloc

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
     * Set Checked
     */
    CheckedCount: number = 1;
    SetChecked(i, status) {

        var NewStatus = 0;
        if (status == 0) {
            NewStatus = 1;
        }

        setTimeout(() => {
            this.form.list[i].selected = NewStatus;

            if (NewStatus == 1) {
                $('#item-qty_po-' + i).focus();
            }

            this.CheckAllChecked();
        }, 100);

    }
    SetAllChecked() {

        var NewStatus = 1;
        if (this.form.allchecked == 1) {
            NewStatus = 0;
        }

        setTimeout(() => {

            if (this.form.list.length > 0) {
                for (let item of this.form.list) {
                    item.selected = NewStatus;
                }
            }

            this.form.allchecked = NewStatus;
            this.CheckedCount = NewStatus;

        }, 250);

        // this.CheckAllChecked();
    }
    CheckAllChecked() {

        if (this.form.list && this.form.list.length > 0) {
            this.form.allchecked = 1;
            this.CheckedCount = 0;
            this.form.list_new = [];

            for (let item of this.form.list) {
                if (item.selected == 0 && this.form.allchecked == 1) {
                    this.form.allchecked = 0;
                    // break;
                }

                if (item.selected == 1) {
                    this.CheckedCount++;
                    this.form.list_new.push(item);
                }
            }
        }

    }
    // => / END : Set Checked

    
    ReadyFinish : boolean;
    CalOutstanding(data){
        this.ReadyFinish = false;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if(data.qty_po > data.qty_outstanding){
                data.qty_po = data.qty_outstanding;
            }
    
            var totalOut : number = 0;
            var totalQty : number = 0;
            for(let item of this.form.list){
                totalOut += item.qty_outstanding;
                totalQty += item.qty_po;
            }
    
            if(totalOut === totalQty){
                this.ReadyFinish = true;
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
        var price: number = 0;

        this.form.os_dp = this.form.dp;
        this.form.ready_finish = this.ReadyFinish;

        if (this.form.storeloc_nama == 'LOCO') {
            this.form.storeloc = -1;
        }

        if (!this.form.other_cost) {
            this.form.other_cost = 0;
        }

        if (!this.form.ppbkb) {
            this.form.ppbkb = 0;
        }

        if (this.form.disc_credit) {
            this.form.disc = this.form.disc_credit;
        }
        else if (this.form.disc_cash) {
            this.form.disc = this.form.disc_cash;
        }
        else {
            this.form.disc = 0;
        }

        for (let item of this.form.list_new) {
            if(item.qty_po == 0){
                item.selected = 0;
            }
            else{
                if (item.prc_credit) {
                    price = item.prc_credit;
                }
                else {
                    price = item.prc_cash;
                }

                if(this.form.inclusive_ppn == 1){
                    total = Number(total) + Number(item.qty_po * (price/1.1));
                }
                else{
                    total = Number(total) + Number(item.qty_po * price);
                }
    
                if (this.form.ppn && this.form.ppn > 0) {
                    if(this.form.inclusive_ppn == 1){
                        ppn = Number(ppn) + Number(((item.qty_po * (price/1.1)) / 100 * (100 - this.form.disc)) / 100 * this.form.ppn);
                    }
                    else{
                        ppn = Number(ppn) + Number(((item.qty_po * price) / 100 * (100 - this.form.disc)) / 100 * this.form.ppn);
                    }
                }
    
                if (this.form.pph && this.form.pph > 0 && item.pph > 0) {
                    if(this.form.inclusive_ppn == 1){
                        pph = Number(pph) + Number(((item.qty_po * (price/1.1)) / 100 * (100 - this.form.disc)) / 100 * this.form.pph);
                    }
                    else{
                        pph = Number(pph) + Number(((item.qty_po * price) / 100 * (100 - this.form.disc)) / 100 * this.form.pph);
                    }
                }
            }
        }

        tax_base = Number(total / 100 * (100 - this.form.disc));

        grand_total = Number(tax_base) + Number(ppn) - Number(pph) + Number(this.form.other_cost) + Number(this.form.ppbkb);

        this.form.total = total;
        this.form.tax_base = tax_base;
        this.form.grand_total = grand_total;


        if (this.form.list_new) {
            this.form.list_send = JSON.stringify(this.form.list_new);
        }

        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
        
        var continued = true;

        if(this.form.pph != 0){
            var PphSelected = false;
            for(let item of this.form.list){
                if(item.pph == 1){
                    PphSelected = true;
                }
            }

            if(PphSelected == false){
                this.alertPPh();
                continued = false;
            }
        }

        if(continued){
            this.Busy = true;
            this.core.Do(this.ComUrl + 'partial.po', this.form).subscribe(
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
    }
    // => / END : Simpan

    /**
     * Disc Change
     */
    DiscChange(type_a, type_b) {
        var Subtotal_credit:number = 0;
        var Subtotal_cash:number = 0;

        for(let item of this.form.list_new){
            if(item.prc_cash){
                Subtotal_cash += item.qty_po * item.prc_cash;
            }
            else{
                Subtotal_cash += item.qty_po * 0;
            }

            if(item.prc_credit){
                Subtotal_credit += item.qty_po * item.prc_credit;
            }
            else{
                Subtotal_credit += item.qty_po * 0;
            }
        }        

        if(type_a == 'cash'){
            if(type_b == 'pct'){
                this.form.disc_cash_amt = Subtotal_cash / 100 * this.form.disc_cash;
            }
            else if (type_b == 'amt'){
                this.form.disc_cash = this.form.disc_cash_amt / Subtotal_cash * 100;
            }
        }
        else if(type_a == 'credit'){
            if(type_b == 'pct'){
                this.form.disc_credit_amt = Subtotal_credit / 100 * this.form.disc_credit;
            }
            else if (type_b == 'amt'){
                this.form.disc_credit = this.form.disc_credit_amt / Subtotal_credit * 100;
            }
        }     
    }
    // => / END : Disc Change

    alertWeightBase(){
        if(this.form.weight_base == 1){
            this.core.OpenAlert({
                type: 'warning',
                title: 'Weight Base in Supplier',
                msg: '<div>Warning, Invoice references will be based on suppliers not from Good Receipt.</div>',
                width: 400
            });
        }
    }

    alertPOContract(){
        if(this.form.po_contract == 1){
            this.core.OpenAlert({
                type: 'warning',
                title: 'PO is related with contract',
                msg: '<div>Warning, You must put contract refference before submit PO.</div>',
                width: 400
            });
        }
    }

    alertPPh(){
        this.core.OpenAlert({
            type: 'warning',
            title: 'PPH has not been selected.',
            msg: '<div>Warning, You have not specified an item for which you wish to be given income tax.</div>',
            width: 400
        });
    }

}
