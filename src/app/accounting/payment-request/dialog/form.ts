import { Component, OnInit, ViewEncapsulation, ɵConsole } from '@angular/core';
import { Core } from "providers/core";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';
import Swal from 'sweetalert2';
import { PaymentRequestPrintDialogComponent } from './print';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
    selector: 'dialog-form-payment-request',
    templateUrl: './form.html',
    styleUrls: ['../payment-request.component.scss']
})
export class PaymentRequestFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    Checkedlist: any = [];

    ComUrl;
    Com;
    Busy;

    Delay;

    formSP3;

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    List: any[] = [{
        i: 0
    }];

    TempList: any[] = [{
        i: 0
    }];

    disabled: boolean = false;

    Cur: any = [];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PaymentRequestFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {


    }


    ngOnInit() {

        this.Company = this.Default.company;
        this.Cur = this.Default.cur;

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
        //=> / Check Company

        if (this.form.id != 'add') {
            if(this.form.pay_req_type == 0){
                this.form.tanggal_po = moment(this.form.tanggal_po).format('DD/MM/YYYY');
            }
            
            if(this.form.detail){
                for (let item of this.form.detail) {
                    this.INVSelected.push({
                        id: item.id,
                        kode: item.kode,
                        tipe: item.tipe,
                        amount: item.amount,
                        grn: item.grn_id
                    });
                }
            }

            this.List = this.form.detail2;            
        }
    }

    rupiah(val) {
        return this.core.rupiah(val);
    }

    /**
     * Simpan
     */
    Simpan() {        
        this.form.tanggal = moment(this.form.tanggal).format('YYYY-MM-DD');
        this.form.tanggal_po = moment(this.form.tanggal_po).format('YYYY-MM-DD');

        this.form.list_inv = JSON.stringify(this.INVSelected);

        this.form.list_send = JSON.stringify(this.List);

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'create';
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
    //=> / END : Simpan

    /**
     * Verify
     */
    Verify() {
        Swal({
            title: 'Please Confirm to Verify?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    icon: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "Payment Request Verify"
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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> / END : Verify

    /**
     * Approve
     */
    Approve() {
        Swal({
            title: 'Please Confirm to Approve?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    icon: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "Payment Request Approve"
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
    //=> / END : Approve


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

            setTimeout(() => {
                $('*[name="supplier_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.po = null;
        this.form.po_kode = null;

        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;

        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
        this.form.note = null;

        this.INVSelected = [];
        this.List = [];
        this.form.GrandTotal = null;

        this.CompanyFilter();
    }
    //=> / END : AC Company

    /**
     * AC Cost center
     */
    Cost: any;
    CostFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.cost', Params).subscribe(
                result => {

                    if (result) {
                        this.Cost = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);
    }
    CostSelect(e, item) {

        if (e.isUserInput) {

            this.form.cost_center_id = item.id;
            this.form.cost_center_kode = item.kode;
            this.form.cost_center_nama = item.nama;

            setTimeout(() => {
                $('*[name="keterangan_bayar"]').focus();
            }, 100);

        }
    }
    RemoveCost() {
        this.form.cost_center_id = null;
        this.form.cost_center_kode = null;
        this.form.cost_center_nama = null;
    }
    // => End : Cost Center

    /**
     * AC Supplier
     */
    Supplier: any;
    SupplierFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
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

            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.jenis + '. ' + item.supplier_nama;

            setTimeout(() => {
                $('*[name="po_kode"]').focus();
            }, 100);

        }
    }
    SupplierRemove() {
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.po_kode = null;
        this.form.po = null;

        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
        this.form.note = null;

        this.INVSelected = [];
        this.List = []; 
        this.form.GrandTotal = null;
        this.form.tipe = null;

        this.form.inv = null;
        this.form.inv_kode = null;
        this.form.inv_tipe = null;
        this.form.grn_id = null;
    }
    //=> END : AC Supplier

    /**
    * AC PO Code
    */
    POCode: any;
    POCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if(this.form.pay_req_type == 0){
                var Params = {
                    NoLoader: 1,
                    keyword: val,
                    company: this.form.company,
                    supplier: this.form.supplier
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
            }
            else if(this.form.pay_req_type == 2){
                var Params2 = {
                    NoLoader: 1,
                    keyword: val,
                    company: this.form.company
                };
    
                this.core.Do(this.ComUrl + 'list.pcr', Params2).subscribe(
                    result => {
    
                        if (result) {
                            this.POCode = result;
                        }
    
                    },
                    error => {
                        this.core.OpenNotif(error);
                    }
                );
            }

        });
    }
    POCodeSelect(e, item) {

        if (e.isUserInput) {

            if(this.form.pay_req_type == 0){
                this.form.po_kode = item.kode;
                this.form.po = item.po;
                this.form.company = item.company;
                this.form.company_abbr = item.company_abbr;
                this.form.company_nama = item.company_nama;
                this.form.dept = item.dept;
                this.form.dept_abbr = item.dept_abbr;
                this.form.dept_nama = item.dept_nama;
                this.form.supplier = item.supplier;
                this.form.supplier_kode = item.supplier_kode;
                this.form.supplier_nama = item.jenis + '. ' + item.supplier_nama;
                this.form.cost_center_id = item.cost_center_id;
                this.form.cost_center_kode = item.cost_center_kode;
                this.form.cost_center_nama = item.cost_center_nama;
                this.form.tanggal_po = item.tanggal_po;

                setTimeout(() => {
                    $('*[name="inv_kode"]').focus();
                }, 100);
            }
            else if(this.form.pay_req_type == 2){
                this.form.po_kode = item.kode;
                this.form.tanggal_po = item.tanggal;
                this.form.po = item.id;
                this.form.company = item.company;
                this.form.company_abbr = item.company_abbr;
                this.form.company_nama = item.company_nama;

                this.List.push({
                    uraian: "Reimbusement Petty Cash",
                    jumlah: item.amount
                });

                this.form.GrandTotal = item.amount;
            }

        }

    }
    POCodeRemove() {

        if(this.form.pay_req_type == 0){
            this.form.po_kode = null;
            this.form.po = null;
            this.form.cost_center_id = null;
            this.form.cost_center_kode = null;
            this.form.cost_center_nama = null;
            this.form.tanggal_po = null;
            this.INVSelected = [];
            this.List = [];
            this.form.GrandTotal = null;

            this.form.inv = null;
            this.form.inv_kode = null;
            this.form.inv_tipe = null;
            this.form.grn_id = null;
        }            

    }
    //=> / END : AC PO Code

    /*AC Penerima*/
    Penerima: any;
    PenerimaFilter(val: string): void {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            let Params = {
                NoLoader: 1,
                keyword: val
            };
            this.core.Do(this.ComUrl + 'list_penerima', Params).subscribe(
                result => {
                    if (result) {
                        this.Penerima = result;
                    }
                },
                error => {
                    console.error(error);
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    PenerimaSelect(e, item): void {
        if (e.isUserInput) {
            this.form.penerima = item.id;
            this.form.penerima_nama = item.nama;
            setTimeout(() => {
                $('*[name="tanggal"]').focus();
                $('*[name="tanggal"]').click();
            }, 100);
        }
    }
    //=> / END : AC Penerima

    /**
     * AC Inv Code
     */
    INVSelected = [];
    removable = true;
    selectable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    INVCode: any;
    INVCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                supplier: this.form.supplier,
                po: this.form.po,
                tipe: this.form.tipe
            };

            if(this.form.pay_req_type == 0){
                this.core.Do(this.ComUrl + 'list.inv', Params).subscribe(
                    result => {
    
                        if (result) {
                            this.INVCode = result;
                        }
    
                    },
                    error => {
                        this.core.OpenNotif(error);
                    }
                );
            }
            else if (this.form.pay_req_type == 1){
                Params['tipe_pihak_ketiga'] = this.form.tipe_pihak_ketiga;
                this.core.Do(this.ComUrl + 'list.inv2', Params).subscribe(
                    result => {
    
                        if (result) {
                            this.INVCode = result;
                        }
    
                    },
                    error => {
                        this.core.OpenNotif(error);
                    }
                );
            }
            else{
                this.core.Do(this.ComUrl + 'list.inv3', Params).subscribe(
                    result => {
    
                        if (result) {
                            this.INVCode = result;
                        }
    
                    },
                    error => {
                        this.core.OpenNotif(error);
                    }
                );
            }           
        }, 100);
    }

    INVCodeSelect(e, item) {

        if (e.isUserInput) {
            var Exists = this.core.FJSON2(this.INVSelected, 'id', item.id);
            if(Exists.length <= 0){

                this.INVSelected.push({
                    id: item.id,
                    kode: item.kode,
                    ref_kode: item.ref_kode,
                    tipe: item.tipe,
                    amount: item.amount,
                    grn: item.grn_id
                });

                this.form.tipe = item.tipe;
                
                this.getDataInvoice();            

            }

            $('*[name="inv_kode"]').val('');

        }

    }
    add(event: MatChipInputEvent): void {

        $('*[name="inv_kode"]').val('');
        this.INVCodeFilter('');

    }

    remove(invoice: string): void {
        const index = this.INVSelected.indexOf(invoice);

        if (index >= 0) {
            this.INVSelected.splice(index, 1);
            this.List.splice(index, 1);
        }

        if(this.INVSelected.length > 0){
            this.getDataInvoice();
        }

        if (this.INVSelected.length == 0){
            this.form.tipe = null;
            this.List = null;
            this.form.GrandTotal = null;
        }
    }
    //=> / END : AC Inv Code

    getDataInvoice() {
        var Params = {
            NoLoader: 1,
            tipe: this.form.tipe,
            invoice_send: JSON.stringify(this.INVSelected),
            grn_id: this.form.grn_id
        };

        this.List = [];

        this.core.Do(this.ComUrl + 'get_inv', Params).subscribe(
            result => {

                if (result) {
                    this.List = result;

                    this.processDataInvoice();
                }

            },
            error => {
                this.core.OpenNotif(error);
            }
        );
        // }
    }

    ChangeValue(){
        var GrandTotal: number = 0;
        
        for (let item of this.List) {

            GrandTotal += Number(item.jumlah);

        }

        this.form.GrandTotal = GrandTotal;
    }

    processDataInvoice() {

        /**
         * Type Invoice
         * 
         * kode 1 = invoice DP
         * kode 2 dan 3 = Purchase invoice  dan Supplier Base
         */
        if (this.form.tipe == 1) {
            var uraian = "";
            var amount_disc: number = 0;
            var amount_ppn: number = 0;
            var amount_pph: number = 0;
            var amount_other_cost: number = 0;
            var amount_ppbkb: number = 0;
            var pph_kode = "";
            var pph: number = 0;
            var disc: number = 0;
            var GrandTotal: number = 0;
            var inclusive_ppn = false;

            var is_customs = false;

            for (let item of this.List) {
                if(item.inclusive_ppn == 1){
                    item.price = item.price / 1.1;
                    inclusive_ppn = true;
                }
                uraian = item.nama + " ( " + Math.round(item.qty) + " " + item.satuan + " @" + this.rupiah(item.price) + " )";

                if(Number(item.customs) == 1){
                    is_customs = true;
                }                

                item.uraian = uraian;
                item.jumlah = item.price * item.qty / 100 * item.dp;

                if(item.inclusive_ppn == 1){
                    item.jumlah = Math.round(item.jumlah);
                }

                amount_ppn += Number(((((100 - item.disc) / 100 * (item.price * item.qty))) * (item.ppn / 100)) / 100 * item.dp);
                amount_pph += Number(((((100 - item.disc) / 100 * (item.price * item.qty))) * (item.pph / 100)) / 100 * item.dp);
                pph_kode = item.pph_code;
                pph = item.pph;
                amount_other_cost = Number(item.other_cost) / 100 * Number(item.dp);
                amount_ppbkb = Number(item.ppbkb) / 100 * Number(item.dp);
                disc = item.disc;

                amount_disc += Number(((item.price * item.qty) / 100 * item.disc) / 100 * item.dp);
            }

            if (amount_disc != 0) {
                this.List.push({
                    uraian: "Discount " + disc + " %",
                    jumlah: amount_disc * -1,
                    disc_check: amount_disc
                });
            }

            if (amount_ppn != 0) {
                if(inclusive_ppn){
                    amount_ppn = Math.round(amount_ppn);
                }

                var PushPPN: any = {
                    uraian: "PPN 10%",
                    jumlah: amount_ppn
                };

                if(is_customs){
                    amount_ppn = 0;
                    PushPPN = {
                        uraian: "PPN 10% (Kawasan Berikat)",
                        jumlah: amount_ppn
                    };
                }

                this.List.push(PushPPN);
            }

            if (amount_pph != 0) {
                if(inclusive_ppn){
                    amount_pph = Math.round(amount_pph);
                }

                this.List.push({
                    uraian: pph_kode,
                    jumlah: amount_pph * -1,
                    pph_check: pph
                });
            }

            if (amount_other_cost != 0) {
                this.List.push({
                    uraian: "Other Cost",
                    jumlah: amount_other_cost
                });
            }

            if (amount_ppbkb != 0) {
                this.List.push({
                    uraian: "PPBKB",
                    jumlah: amount_ppbkb
                });
            }

            for (let item of this.List) {

                GrandTotal += Number(item.jumlah);

            }

            this.form.GrandTotal = GrandTotal;
        }
        else if(this.form.tipe == 2){
            var uraian = "";
            var amount_disc: number = 0;
            var amount_ppn: number = 0;
            var amount_pph: number = 0;
            var amount_other_cost: number = 0;
            var amount_ppbkb: number = 0;
            var amount_dp: number = 0;
            var amount_dp_pph: number = 0;
            var disc: number = 0;
            var pph_kode = "";
            var ppn: number = 0;
            var pph: number = 0;
            var GrandTotal: number = 0;
            for (let item of this.List) {
                if(item.coa){
                    item.uraian = item.notes;
                    item.jumlah = item.amount;
                }
                else{
                    uraian = item.nama + " ( " + Math.round(item.qty) + " " + item.satuan + " @" + this.rupiah(item.price) + " )";

                    if(Number(item.customs) == 1){
                        is_customs = true;
                    }

                    item.uraian = uraian;
                    item.jumlah = item.price * item.qty;

                    disc = item.disc;
                    amount_disc += Number((item.price * item.qty) / 100 * item.disc);

                    pph_kode = item.pph_code;
                    pph = item.pph;
                    ppn = item.ppn;

                    if(item.dp_amount == null){
                        amount_dp += ((100 - item.disc) / 100 * item.amount_uang_muka) / 100 * item.dp;
                        amount_dp_pph += ((100 - item.disc) / 100 * item.amount_uang_muka_pph) / 100 * item.dp;
                        amount_other_cost += Number(item.other_cost / 100 * (100 - item.dp));
                        amount_ppbkb += item.ppbkb;
                    }
                    else if(item.dp_amount > 0){
                        amount_dp += ((100 - item.disc) / 100 * item.amount_uang_muka) / 100 * item.dp;
                        amount_dp_pph += ((100 - item.disc) / 100 * item.amount_uang_muka_pph) / 100 * item.dp;
                        amount_other_cost += Number(item.other_cost / 100 * (100 - item.dp));
                        amount_ppbkb += item.ppbkb;
                    }
                    else{
                        amount_other_cost += item.other_cost;
                        amount_ppbkb += item.ppbkb;
                    }
                    amount_ppn += Number(item.jumlah - (item.jumlah / 100 * item.disc));
                    amount_pph += Number((item.price * item.qty_pph) - ((item.price * item.qty_pph) / 100 * item.disc));
                }
            }          

            if (amount_disc != 0) {
                this.List.push({
                    uraian: "Discount " + disc + " %",
                    jumlah: amount_disc * -1,
                    disc_check: amount_disc
                });
            }

            if (ppn != 0) {
                var PushPPN: any = {
                    uraian: "PPN 10%",
                    jumlah: Number((amount_ppn - amount_dp) / 100 * ppn)
                };

                if(is_customs){
                    amount_ppn = 0;
                    PushPPN = {
                        uraian: "PPN 10% (Kawasan Berikat)",
                        jumlah: amount_ppn
                    };
                }

                this.List.push(PushPPN);
            }

            if (pph != 0) {
                this.List.push({
                    uraian: pph_kode,
                    jumlah: Number(((amount_pph / 100 * pph) - (amount_dp_pph / 100 * pph)) * -1),
                    pph_check: pph
                });
            }

            if (amount_other_cost != 0) {
                this.List.push({
                    uraian: "Other Cost",
                    jumlah: amount_other_cost
                });
            }

            if (amount_ppbkb != 0) {
                this.List.push({
                    uraian: "PPBKB",
                    jumlah: amount_ppbkb
                });
            }

            if (amount_dp != 0) {
                this.List.push({
                    uraian: "Uang Muka",
                    jumlah: amount_dp * -1
                });
            }

            for (let item of this.List) {

                GrandTotal += Number(item.jumlah);

            }

            this.form.GrandTotal = GrandTotal;
        }
        else {
            var GrandTotal: number = 0;        
            for (let item of this.List) {

                GrandTotal += Number(item.jumlah);

            }

            this.form.GrandTotal = GrandTotal;
        }
    }

    /**
    * Payment Request Misc 
    */

    PayTypeChange(){
        this.form.tipe_pihak_ketiga = null;
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
        this.form.note = null;
        this.form.tanggal = null;
        this.form.tanggal_po = null;
        this.form.po_kode = null;
        this.form.po = null;
        this.form.payment_note = null;
        this.form.cost_center_id = null;
        this.form.cost_center_kode = null;
        this.form.cost_center_nama = null;

        this.INVSelected = [];
        this.List = []; 
        this.form.GrandTotal = null;
        this.form.tipe = null;

        this.form.inv = null;
        this.form.inv_kode = null;
        this.form.inv_tipe = null;
    }

    /**
     * AC ThirdParty
     */
    PihakKetiga: any;
    PihakKetigaFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                tipe: this.form.tipe_pihak_ketiga
            };

            this.core.Do(this.ComUrl + 'list.pihak_ketiga', Params).subscribe(
                result => {

                    if (result) {
                        this.PihakKetiga = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    PihakKetigaSelect(e, item) {

        if (e.isUserInput) {

            this.form.supplier = item.id;
            this.form.supplier_kode = item.kode;
            if(item.jenis){
                this.form.supplier_nama = item.jenis + '. ' + item.nama;
            }
            else{
                this.form.supplier_nama = item.nama;
            }

            setTimeout(() => {
                $('*[name="inv_kode"]').focus();
            }, 100);

        }
    }
    PihakKetigaRemove() {
        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
        this.form.note = null;

        this.INVSelected = [];
        this.List = []; 
        this.form.GrandTotal = null;

        this.form.inv = null;
        this.form.inv_kode = null;
        this.form.inv_tipe = null;
    }
    //=> END : AC Supplier

    // => END : Payment Request Misc

    /**
    * Open Print SP3 
    */
    SP3PrintRef: MatDialogRef<PaymentRequestPrintDialogComponent>;
    SP3PrintRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    Print() {

        var Params = {
            id: this.form.id
        };

        this.core.Do(this.ComUrl + 'get_print', Params).subscribe(
            result => {

                if (result) {
                    this.formSP3 = result.data;

                    this.ShowPrint();
                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );

    }
    ShowPrint() {

        this.SP3PrintRef = this.dialog.open(
            PaymentRequestPrintDialogComponent,
            this.SP3PrintRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.SP3PrintRef.componentInstance.Default = this.Default;
        this.SP3PrintRef.componentInstance.ComUrl = this.ComUrl;
        this.SP3PrintRef.componentInstance.perm = this.perm;
        this.SP3PrintRef.componentInstance.formSP3 = this.formSP3;
        //=> / END : Inject Data to Dialog

    }

    // => Open Print SP3 

}