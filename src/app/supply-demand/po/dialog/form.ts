import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-po',
    templateUrl: './form.html',
    styleUrls: ['../po.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class POFormDialogComponent implements OnInit {

    WaitPrint: boolean;
    GrandTotal: number;
    PPN: number;
    PPH: number;
    Discount: number;
    List: any[] = [{
        i: 0
    }];
    SupplierList: any[] = [{
        i: 0
    }];
    form: any = {};
    perm: any = {};
    Default: any = {};
    PO: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    UP;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<POFormDialogComponent>
    ) {
        // this.minDate = moment(new Date()).format("DD/MM/YYYY");
        // this.form.set_tanggal = this.minDate;
    }


    ngOnInit() {        

        if (!this.form.from_po) {
            this.FormatData();
        } else {
            this.PO.disc = this.toFixed(this.PO.disc, 8);
            var Discount: number = Math.round((Number(this.PO.total) * Number(this.PO.disc)) / 100);
            var Subtotal: number = Number(this.PO.total) - Discount;
            var PPN: number = 0;

            if (this.PO.inclusive_ppn == 1) {
                this.PO.total = Math.round(this.PO.total);
                this.PO.tax_base = Math.round(this.PO.tax_base);

                if (this.PO.grand_total == (Number(this.PO.total) + Math.floor(Subtotal * Number(this.PO.ppn) / 100))) {
                    PPN = Math.floor(Subtotal * Number(this.PO.ppn) / 100);
                }
                else {
                    PPN = Math.round(Subtotal * Number(this.PO.ppn) / 100);
                }
            }
            else {
                PPN = Subtotal * Number(this.PO.ppn) / 100;
            }
            /**
             * Calculate item supplier pph
             */
            var TotalPPh: number = 0;
            for (let detail of this.PO.detail) {
                if (detail.pph == 1) {
                    TotalPPh += detail.qty_po * (detail.price / 100 * (100 - Number(this.PO.disc)));
                }
            }
            // => / END : Calculate item supplier pph
            var PPH: number = Math.round((TotalPPh * Number(this.PO.pph) / 100) * 100) / 100;

            // var GrandTotal: number = Subtotal + PPN - Number(this.PO.pph23) + Number(this.PO.pph4);
            var GrandTotal: number = Subtotal + PPN - PPH;
            GrandTotal = GrandTotal + Number(this.PO.other_cost) + Number(this.PO.ppbkb);
            // => / END : Calculate

            this.Discount = Discount;
            this.PPN = PPN;
            this.PPH = PPH;
            this.GrandTotal = GrandTotal;

            this.form.set_tanggal = moment(this.form.tanggal, 'YYYY-MM-DD');

            this.UP = this.PO.supplier_nama;
            if (this.PO.supplier_detail.cp) {
                this.UP = this.PO.supplier_detail.cp;
            }

            if (this.PO.customs && !this.form.is_modif) {
                if (this.PO.customs == 1) {
                    this.PO.customs = "Yes";
                }
                else {
                    this.PO.customs = "No";
                }
            }
        }

    }

    /**
     * Set PPh
     */
    SetPPh() {

        if (this.form.pph_code) {
            var PPh = this.Default.pph;
            PPh = this.core.FJSON2(PPh, 'code', this.PO.pph_code);
            PPh = PPh[0];

            this.PO.pph = PPh.rate;

        } else {
            this.PO.pph = 0;
        }

        this.Calculate();

    }
    // => / END : Set PPh

    /**
     * Calculate
     */
    Calculate(){

        var Total: number = 0;
        var Subtotal: number;
        var PPN: number = 0;        

         /**
         * Calculate item supplier pph
         */
        var TotalPPh: number = 0;
        for (let detail of this.PO.detail) {
            if (detail.pph == 1) {
                TotalPPh += detail.qty_po * (detail.price / 100 * (100 - Number(this.PO.disc)));
            }

            Total += detail.qty_po * detail.price;

        }
        // => / END : Calculate item supplier pph

        if(this.PO.inclusive_ppn == 1){
            Total = Total / 1.1;
        }

        this.PO.total = Total;
        if(this.PO.disc){
            var Discount: number = Math.round((Number(this.PO.total) * Number(this.PO.disc)) / 100);
            this.PO.tax_base = this.PO.total - Discount;
        }else{
            this.PO.tax_base = this.PO.total;
        } 

        this.PO.disc = this.toFixed(this.PO.disc, 8);
        var Discount: number = Math.round((Number(this.PO.total) * Number(this.PO.disc)) / 100);
        var Subtotal: number = Number(this.PO.total) - Discount;
        var PPN: number = 0;

        if (this.PO.inclusive_ppn == 1) {
            if (this.PO.grand_total == (Number(this.PO.total) + Math.floor(Subtotal * Number(this.PO.ppn) / 100))) {
                PPN = Math.floor(Subtotal * Number(this.PO.ppn) / 100);
            }
            else {
                PPN = Math.round(Subtotal * Number(this.PO.ppn) / 100);
            }
        }
        else {
            PPN = Subtotal * Number(this.PO.ppn) / 100;
        }
       
        var PPH: number = Math.round((TotalPPh * Number(this.PO.pph) / 100) * 100) / 100;

        // var GrandTotal: number = Subtotal + PPN - Number(this.PO.pph23) + Number(this.PO.pph4);
        var GrandTotal: number = Subtotal + PPN - PPH;
        GrandTotal = GrandTotal + Number(this.PO.other_cost) + Number(this.PO.ppbkb);
        // => / END : Calculate

        this.Discount = Discount;
        this.PPN = PPN;
        this.PPH = PPH;
        this.GrandTotal = GrandTotal;

        this.PO.grand_total = GrandTotal;
        
    }
    //=> END : Calculate


    toFixed(value, precision) {
        var precision = precision || 0,
            power = Math.pow(10, precision),
            absValue = Math.abs(Math.round(value * power)),
            result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

        if (precision > 0) {
            var fraction = String(absValue % power),
                padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
            result += '.' + padding + fraction;
        }
        return result;
    }

    /**
     * Format Data for PO
     */
    FormatData() {

        var Params = {
            pq: this.form.id,
            supplier: this.form.supplier,
            header_pq_supplier: this.form.header_pq_supplier
        };

        this.core.Do(this.ComUrl + 'get.pq', Params).subscribe(
            result => {
                /**
                 * Calculate
                 */
                result.reply.disc = this.toFixed(result.reply.disc, 8);
                var Discount: number = Math.round((Number(result.reply.total) * Number(result.reply.disc)) / 100);
                var Subtotal: number = 0;
                var TaxBase: number = 0;
                var PPN: number = 0;

                if (result.reply.inclusive_ppn == 1) {
                    Subtotal = Number(result.reply.total);
                    TaxBase = Number(result.reply.total) - Discount;

                    if(((Number(result.reply.total) + Math.floor(Number(result.reply.total) * Number(result.reply.ppn) / 100))) % 5 == 0){
                        PPN = Math.floor(Number(result.reply.total) * Number(result.reply.ppn) / 100);
                    }
                    else {
                        PPN = Math.round(Number(result.reply.total) * Number(result.reply.ppn) / 100);
                    }
                }
                else {
                    Subtotal = Number(result.reply.total);
                    TaxBase = Number(result.reply.total) - Discount;
                    PPN = TaxBase * Number(result.reply.ppn) / 100;
                }

                /**
                 * Calculate item supplier pph
                 */
                var TotalPPh: number = 0;
                for (let detail of result.reply.detail) {
                    if (detail.pph == 1) {
                        // TotalPPh += detail.qty_po * detail.price;
                        TotalPPh += detail.qty_po * (detail.price / 100 * (100 - Number(result.reply.disc)));
                    }
                }
                // => / END : Calculate item supplier ph
                var PPH: number = Math.round((TotalPPh * Number(result.reply.pph) / 100) * 100) / 100;

                // var GrandTotal: number = Subtotal + PPN - Number(result.reply.pph23) + Number(result.reply.pph4);
                var GrandTotal: number = (TaxBase) + (PPN) - PPH;
                GrandTotal = GrandTotal + Number(result.reply.other_cost) + Number(result.reply.ppbkb);
                // => / END : Calculate

                this.Discount = Discount;
                this.PPN = PPN;
                this.PPH = PPH;
                this.GrandTotal = GrandTotal;

                this.PO = {
                    company: this.form.company,
                    company_abbr: this.form.company_abbr,
                    company_nama: this.form.company_nama,
                    alamat: result.alamat,
                    dept: this.form.dept,
                    dept_abbr: this.form.dept_abbr,
                    dept_nama: this.form.dept_nama,
                    mr: result.mr,
                    mr_kode: result.mr_kode,
                    pr: result.pr,
                    pr_kode: result.pr_kode,
                    pq: this.form.id,
                    pq_kode: this.form.pq_kode,
                    header_pq_supplier: this.form.header_pq_supplier,
                    supplier: this.form.supplier,
                    supplier_kode: this.form.supplier_kode,
                    supplier_nama: this.form.supplier_nama,
                    supplier_detail: result.supplier_detail,
                    currency: result.reply.currency,
                    customs: result.reply.customs,
                    tipe: result.reply.tipe,
                    dp: result.reply.dp,
                    os_dp: result.reply.dp,
                    ppn: result.reply.ppn,
                    inclusive_ppn: result.reply.inclusive_ppn,
                    pph_code: result.reply.pph_code,
                    pph: result.reply.pph,
                    disc: result.reply.disc,
                    other_cost: result.reply.other_cost,
                    ppbkb: result.reply.ppbkb,
                    delivery_plan: result.reply.delivery_plan,
                    weight_base: result.reply.weight_base,
                    storeloc: result.reply.storeloc,
                    storeloc_kode: result.reply.storeloc_kode,
                    storeloc_nama: result.reply.storeloc_nama,
                    po_contract: result.reply.po_contract,
                    payment_term: result.reply.payment_term,
                    total: Subtotal,
                    tax_base: TaxBase,
                    grand_total: GrandTotal,

                    detail: result.reply.detail
                };

                if (this.form.po) {
                    this.PO.id = this.form.po;
                    this.PO.tanggal = this.form.po_tanggal;
                    this.PO.kode = this.form.po_kode;

                    this.form.set_tanggal = moment(this.form.po_tanggal, 'YYYY-MM-DD');
                }

                this.UP = this.PO.supplier_nama;
                if (this.PO.supplier_detail.cp) {
                    this.UP = this.PO.supplier_detail.cp;
                }

                this.form.note = result.note;

                this.form.storeloc = result.storeloc;
                this.form.storeloc_kode = result.storeloc_kode;
                this.form.storeloc_nama = result.storeloc_nama;

            },
            error => {
                console.error(error);
            }
        );

    }
    // => / END : Format Data for PO

    /**
     * Print
     */
    Print() {

        if (!this.PO.id) {
            this.PO.tanggal = moment(this.form.set_tanggal).format('YYYY-MM-DD');
            this.PO.note = this.form.note;
            this.PO.list = JSON.stringify(this.PO.detail);

            var Params = {
                pr: this.form.pr
            };

            this.Busy = true;
            this.core.Do(this.ComUrl + 'cek.ost.pr', Params).subscribe(
                result => {
                    this.Busy = false;

                    var diff:boolean = false;
                    var StringHTML = "<ul>";
                    for(let item of this.PO.detail){
                        for(let data of result.data){
                            if(item.item == data.item && item.qty_po > data.qty_outstanding){
                                diff = true;
                                StringHTML += "<li>" + item.nama + ", Qty PO : " + item.qty_po + " and Qty Ost PR : " + data.qty_outstanding + "</li>";
                            }
                        }
                    }

                    StringHTML += "</ul>";

                    if(diff){
                        this.core.OpenAlert({
                            type: 'error',
                            title: 'There is a Quantity PO is greater than Outstanding PR',
                            msg: '<div>'+StringHTML+'</div>',
                            width: 550
                        });
                    }
                    else{
                        this.SavePO();
                    }

                },
                error => {
                    this.Busy = false;
                    console.error('Cek Ost PR', error);
                }
            );

        } else {

            this.WaitPrint = true;

            setTimeout(() => {

                $('.print-area').print({
                    globalStyle: true,
                    mediaPrint: true,
                    title: 'PURCHASE ORDER NO# ' + this.PO.kode,
                    timeout: 60000,
                });

                this.WaitPrint = false;

                // this.dialogRef.close({reopen: 1});

            }, 1000);

        }

    }
    // => / END : Print

    SavePO() {
        
        this.Busy = true;
        this.core.Do(this.ComUrl + 'save.po', this.PO).subscribe(
            result => {

                this.PO.id = result.data.id;
                this.PO.tanggal = result.data.tanggal;
                this.PO.kode = result.data.kode;

                this.core.Sharing('reload', 'reload');

                this.Busy = false;
                this.WaitPrint = true;

                setTimeout(() => {

                    $('.print-area').print({
                        globalStyle: true,
                        mediaPrint: true,
                        title: 'PURCHASE ORDER NO# ' + this.PO.kode,
                        timeout: 60000,
                    });

                    this.WaitPrint = false;

                }, 1000);

            },
            error => {
                this.Busy = false;
                console.error('Save PO', error);
            }
        );
    }

    /**
     * Submit
     */
    Submit() {

        if(this.PO.po_contract == 1 && !this.PO.wb_kontrak){
            this.core.OpenAlert({
                type: 'warning',
                title: 'PO is related with contract',
                msg: '<div>Warning, You must connect the PO to the WB Contract first before submit.</div>',
                width: 400
            });
        }
        else{
            swal({
                title: 'Submit Purchase Order?',
                html: '<div>Please confirm to Continue Submit?</div>',
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
                            id: this.PO.id,
                            kode: this.PO.kode
                        };
    
                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'submit', Params).subscribe(
                            result => {
                                this.Busy = false;
    
                                if (result.status == 1) {
                                    this.PO.submited = 1;
    
                                    this.core.Sharing('reload', 'reload');
    
                                    var Success = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Purchase Order Submitted',
                                        msg: 'Purchase Order is listed as WAITING GOODS RECEIPT. Purchase Order is ready to Receipt on Goods Receipt page.'
                                    };
                                    this.core.OpenAlert(Success);
                                }
    
                            },
                            error => {
                                console.error('Submit', error);
                                this.Busy = false;
                            }
                        );
    
                    }
    
                }
            );
        }
    }
    // => / END : Submit

    rupiah(val) {
        return this.core.rupiah(val);
    }

    // Simpan
    Save() {
        swal(
            {
                title: 'Are You Sure!',
                html: '<div>Save The Data?</div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {

                    this.Busy = true;

                    let URL = this.ComUrl + 'edit';
                    if (this.form.is_modif) {
                        URL = this.ComUrl + 'po.modif';
                    }

                    this.PO.list = JSON.stringify(this.PO.detail);  
                    
                    this.PO.os_dp = this.PO.dp;  
                    this.PO.note = this.form.note;                  
                    
                    this.core.Do(URL, this.PO).subscribe(
                        result => {
                            if (result.status == 1) {
                                this.dialogRef.close(result);
                            } else {
                                let Alert = {
                                    title: 'Failed To Save The Data',
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }
                            this.Busy = false;
                        },
                        error => {
                            this.core.OpenNotif(error);
                            this.Busy = false;
                        }
                    );
                }
            }
        );
    }

}
