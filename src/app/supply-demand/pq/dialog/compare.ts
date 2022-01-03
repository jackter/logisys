import { Component, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { PQRejectFormDialogComponent } from './reject';

@Component({
    selector: 'dialog-compare-pq',
    templateUrl: './compare.html',
    styleUrls: ['../pq.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PQCompareDialogComponent implements OnInit, AfterViewInit {

    Busy: boolean;
    form: any;
    ComUrl;
    Data: any;
    perm;
    gaya: any;

    MaxListSupplier = 3;
    MaxRowSupplier = 1;
    RowSupplier: any[] = [];

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<PQCompareDialogComponent>
    ) {

    }

    ngOnInit() {

        this.gaya = '50px';

        /**
         * Get Jumlah Row
         */
        if (this.Data && this.Data.supplier) {

            var MaxRowSupplier = this.Data.supplier.length / this.MaxListSupplier;
            MaxRowSupplier = Math.ceil(MaxRowSupplier);

            if (MaxRowSupplier > this.MaxRowSupplier) {
                this.MaxRowSupplier = MaxRowSupplier;
            }

            for (let i = 0; i < this.MaxRowSupplier; i++) {
                this.RowSupplier.push(i);
            }

        }
        // => / END : Get Jumlah Row

    }

    ngAfterViewInit() {
        this.Calculate();

        setTimeout(() => {
            // var max = 0;
            // for (let i of this.RowSupplier) {
                var maxLength = 0;
                for (let item of this.Data.pr) {
                    if(item.nama.length > maxLength) {
                        maxLength = item.nama.length;
                    }                
                }   
                
                if(maxLength * 2 < 150){
                    $('.item_name_width').attr('style', 'min-width: ' + 150 + 'px!important');
                }
                else{
                    $('.item_name_width').attr('style', 'min-width: ' + (maxLength * 2) + 'px!important');
                }

                maxLength = 0;
                for (let item of this.Data.supplier) {
                    for (let detail of item.detail) {                        
                        if(detail.origin.length > maxLength) {
                            maxLength = item.nama.length;
                        }
                    }              
                }

                if(maxLength * 2 < 60){
                    $('.origin_width').attr('style', 'min-width: ' + 60 + 'px!important');
                }
                else{
                    $('.origin_width').attr('style', 'min-width: ' + (maxLength * 2) + 'px!important');
                }              

                var index;
                var ListHeightRow = [];

                $('.same_height:not([style])').each(function () {
                    index = $(this).attr('index');

                    if (typeof ListHeightRow[index] === 'undefined') {
                        ListHeightRow[index] = $(this).height();
                    }
                    else {
                        if ($(this).height() > ListHeightRow[index]) {
                            ListHeightRow[index] = $(this).height();
                        }
                    }

                });
                

                $('.same_height2:not([style])').each(function () {
                    index = $(this).attr('index');

                    if (typeof ListHeightRow[index] === 'undefined') {
                        ListHeightRow[index] = $(this).height();
                    }
                    else {
                        if ($(this).height() > ListHeightRow[index]) {
                            ListHeightRow[index] = $(this).height();
                        }
                    }

                });

                if(maxLength * 2 < 30){
                    maxLength = 15;
                }
                

                for (let i = 0; i < ListHeightRow.length; i++) {
                    $('.same_height_' + i).attr('style', 'height: ' + (ListHeightRow[i] + (maxLength * 2)) + 'px!important');
                }

            // }
        }, 1000);

    }

    isEmpty(obj) {
        return this.core.isEmpty(obj);
    }

    /**
     * Focus QPO
     */
    FocusQPO(i, j, detail) {

        detail.qty_po = null;

        setTimeout(() => {
            $('#qty_po-' + i + '-' + j).focus();
        }, 100);

        this.Calculate(i, j);
    }
    // => / END : Focus QPO

    /**
     * Calculate
     */
    Delay;
    OutstandingClear = false;
    Calculate(x = 0, y = 0) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var PR = this.Data.pr;
            var SP = this.Data.supplier;

            /**
             * Supplier
             */
            if (this.Data.supplier) {
                for (let supplier of this.Data.supplier) {
                    var CC = supplier.cc;

                    /**
                     * Detail
                     */
                    var Total: number = 0;
                    var TotalPPh: number = 0;
                    var Subtotal: number = 0;

                    var TotalShow: number = 0;
                    var TotalPPhShow: number = 0;
                    var SubtotalShow: number = 0;
                    let i = 0;

                    if (supplier.detail) {
                        for (let detail of supplier.detail) {

                            if (Number(detail.qty_po) > Number(PR[i]['qty_supplier'])) {
                                detail.qty_po = PR[i]['qty_supplier'];
                            } else if (Number(detail.qty_po) > Number(PR[i]['qty_purchase'])) {
                                detail.qty_po = PR[i]['qty_purchase'];
                            }

                            /**
                             * Subtotal Show
                             * 
                             * untuk menampilkan subtotal walaupun supplier tidak dipilih
                             */
                            if (CC == 'cash') {
                                TotalShow = detail.qty_supplier * detail.prc_cash;
                            } else {
                                TotalShow = detail.qty_supplier * detail.prc_credit;
                            }
                            SubtotalShow += TotalShow;

                            /**
                             * Calculate item supplier pph
                             */
                            if (detail.pph == 1) {
                                if (CC == 'cash') {
                                    TotalPPh += detail.qty_supplier * detail.prc_cash;
                                } else {
                                    TotalPPh += detail.qty_supplier * detail.prc_credit;
                                }
                            }
                            // => / END : Calculate item supplier ph

                            // }

                            i++;
                        }
                    }

                    if (supplier.reply.inclusive_ppn == 1) {
                        Subtotal = SubtotalShow / 1.1;
                        SubtotalShow = Math.round(SubtotalShow / 1.1);
                        TotalPPh = Math.round(TotalPPh / 1.1);
                    } else {
                        Subtotal = SubtotalShow;
                    }

                    supplier.subtotal = SubtotalShow;
                    supplier.subtotal_show = SubtotalShow;
                    supplier.total_pph = TotalPPh;
                    // => / END : Detail

                    if (supplier.reply) {
                        /**
                         * Discount
                         */
                        var Discount: number = 0;

                        if (supplier.reply.inclusive_ppn == 1) {
                            if (CC == 'cash') {
                                Discount = (Subtotal * (supplier.reply.disc_cash / 1.1)) / 100;
                            } else if (CC == 'credit') {
                                Discount = (Subtotal * (supplier.reply.disc_credit / 1.1)) / 100;
                            }
                        }
                        else {
                            if (CC == 'cash') {
                                Discount = (Subtotal * supplier.reply.disc_cash) / 100;
                            } else if (CC == 'credit') {
                                Discount = (Subtotal * supplier.reply.disc_credit) / 100;
                            }
                        }

                        supplier.discount = Discount;
                        // => / END : Discount

                        supplier.taxbase = Subtotal - Discount;

                        /**
                         * PPH
                         */
                        supplier.pph = (supplier.total_pph - Discount) * Number(supplier.reply.pph) / 100;
                        // => / END : PPH

                        /**
                         * PPN
                         */
                        if (supplier.reply.currency == 'IDR') {
                            if (supplier.reply.inclusive_ppn == 1) {
                                if (((SubtotalShow - Discount) + Math.round((Subtotal - Discount) * supplier.reply.ppn / 100) - supplier.pph) % 5 == 0) {
                                    supplier.ppn = Math.round((Subtotal - Discount) * supplier.reply.ppn / 100);
                                } else {
                                    supplier.ppn = Math.floor((Subtotal - Discount) * supplier.reply.ppn / 100);
                                }
                            } else {
                                supplier.ppn = Math.round((Subtotal - Discount) * supplier.reply.ppn / 100);
                            }
                        } else {
                            supplier.ppn = (Subtotal - Discount) * supplier.reply.ppn / 100;
                        }
                        // => / END : PPN

                        /**
                         * Other Cost
                         */
                        supplier.other_cost = supplier.reply.other_cost;
                        // => / END Other Cost

                        /**
                         * PPBKB
                         */
                        supplier.ppbkb = supplier.reply.ppbkb;
                        // => / END PPBKB

                        /**
                         * Grand Total
                         */
                        var GrandTotal: number = 0;
                        GrandTotal = (SubtotalShow - Discount) + supplier.ppn - supplier.pph;

                        supplier.total = GrandTotal;

                        if (Subtotal > 0) {
                            GrandTotal += Number(supplier.other_cost);
                        }

                        if (supplier.ppbkb > 0 && Subtotal > 0) {
                            GrandTotal += Number(supplier.ppbkb);
                        }
                        supplier.grand_total = GrandTotal;
                        // => / END : Grand Total
                    }

                }
            }
            // => / END : Supplier

            /**
             * Oustanding
             */
            for (let item of PR) {

                item.total_po = 0;
                item.qty_outstanding = Number(item.qty_purchase);

                /**
                 * Clean Cancel
                 */
                if (Number(item.qty_cancel) <= 0) {
                    item.qty_cancel = null;
                }
                // => / END : Clean Cancel

                /**
                 * Calculate Total PO
                 */
                if (this.Data.supplier) {
                    for (let supplier of this.Data.supplier) {

                        var detail: any = _.find(supplier.detail, { id: item.id });

                        if (detail) {
                            if (Number(detail.qty_po) > Number(detail.qty_supplier)) {
                                detail.qty_po = detail.qty_supplier;
                                this.Calculate(x, y);
                                return false;
                            }

                            if (Number(detail.qty_po) > 0) {
                                item.total_po += Number(detail.qty_po);
                            }
                        }
                    }
                }
                // => / END : Calculate Total PO

                item.qty_outstanding_temp = item.qty_outstanding;
                if (item.total_po > 0 && item.qty_outstanding > 0) {
                    item.qty_outstanding -= item.total_po;
                    item.qty_outstanding_temp = item.qty_outstanding;
                }

                /**
                 * QTY Cancel
                 */
                var TheOutstanding = item.qty_outstanding_temp;
                if (
                    item.qty_cancel > 0 &&
                    TheOutstanding > 0
                ) {
                    item.qty_outstanding -= item.qty_cancel;
                }

                // if(item.qty_outstanding < 0){
                //     item.qty_cancel = TheOutstanding;
                // }
                // => / END : Qty Cancel

            }
            // => / END : Outstanding

            /**
             * Set Outstanding
             */
            // console.log(PR[y]);

            if (PR[y].qty_outstanding <= 0 && PR[y].qty_cancel > 0) {
                PR[y].qty_cancel = PR[y].qty_purchase - PR[y].total_po;
                if (PR[y].qty_cancel <= 0) {
                    PR[y].qty_cancel = null;
                }
                PR[y].qty_outstanding = PR[y].qty_purchase - PR[y].total_po - PR[y].qty_cancel;

                this.CheckAllOutstanding(PR);

                // this.Calculate(x, y);
                // return false;
            }

            if (Number(PR[y].qty_outstanding) < 0) {
                SP[x].detail[y].qty_po = Number(SP[x].detail[y].qty_po) + Number(PR[y].qty_outstanding);
                PR[y].qty_outstanding = 0;
                // PR[y].qty_cancel = null;

                this.CheckAllOutstanding(PR);

                this.Calculate(x, y);
                return false;
            }

            if (
                PR[y].qty_outstanding > 0 &&
                PR[y].qty_cancel &&
                PR[y].qty_cancel > (PR[y].total_po - PR[y].qty_purchase)
            ) {
                PR[y].qty_cancel = PR[y].total_po - PR[y].qty_purchase;
                PR[y].qty_outstanding = 0;

                this.CheckAllOutstanding(PR);

                this.Calculate(x, y);
                return false;
            }
            // => / END : Set Outstanding

            /**
             * Check Outstanding Clear
             */
            this.CheckAllOutstanding(PR);
            // => / END : Check Outstanding Clear

        }, 100);

    }
    CheckAllOutstanding(PR) {
        /**
         * Check Outstanding Clear
         */
        this.OutstandingClear = false;
        var AllOutstanding: number = 0;
        for (let item of PR) {
            AllOutstanding += Number(item.qty_outstanding);
        }
        if (AllOutstanding <= 0) {
            this.OutstandingClear = true;
        }
        // => / END : Check Outstanding Clear
    }
    // => / END : Calculate

    /**
     * Simpan
     */
    Simpan(verify = false) {

        if (verify) {
            swal({
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

                        this.Send(verify);

                    }

                }
            );
        } else {
            this.Send(verify);
        }

    }
    // => / END : Simpan

    /**
     * Reject MR
     */
    dialogReject: MatDialogRef<PQRejectFormDialogComponent>;
    dialogRejectConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowRejectDialog() {

        this.dialogReject = this.dialog.open(
            PQRejectFormDialogComponent,
            this.dialogRejectConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogReject.componentInstance.ComUrl = this.ComUrl;
        this.dialogReject.componentInstance.perm = this.perm;
        this.dialogReject.componentInstance.form = this.form;
        // => / END : Inject Data to Print Dialog

        /**
         * After Dialog Close
         */
        this.dialogReject.afterClosed().subscribe(result => {

            this.dialogReject = null;

            if (result) {
                this.dialogRef.close(result);
            }

        });
        // => / END : After Dialog Close

    }
    // => / END : Reject MR

    /**
     * Send
     */
    Send(verify) {
        var Sent: any = [];

        /**
         * Format Data
         */
        if (this.Data.supplier) {
            for (let supplier of this.Data.supplier) {
                if (supplier.detail) {
                    let i = 0;
                    var Detail = [];
                    for (let detail of supplier.detail) {
                        // if(detail.qty_po){
                        Detail[i] = {
                            id: detail.detail_id,
                            item: detail.id,
                            qty_po: detail.qty_po
                        };

                        i++;
                        // }
                    }
                    var Data = {
                        id: supplier.reply.id,
                        tipe: supplier.cc,
                        detail: JSON.stringify(Detail)
                    };

                    Sent.push(Data);
                }
            }
        }
        // => / END : Format Data

        var Params = {
            id: this.Data.pq.id,
            sup_no_print: this.Data.pq.sup_no_print,
            kode: this.Data.pq.kode,
            pr: JSON.stringify(this.Data.pr),
            data: JSON.stringify(Sent),
            verify: verify
        };

        this.core.Do(this.ComUrl + 'compare.save', Params).subscribe(
            result => {

                if (verify) {
                    if (result.status == 1) {

                        this.core.Sharing('reload', 'reload');

                        this.Data.pq.verified = 1;
                        this.form.verified = 1;

                        if (verify) {
                            this.dialogRef.close({ reopen: 1 });
                        }

                    }
                }

            },
            error => {
                console.error('Compare Save', error);
            }
        );
    }
    // => / END : Send

    /**
     * Approve
     */
    Approve(lvl) {

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
                        kode: this.Data.pq.kode,
                        lvl: lvl,
                        apvd: this.form.apvd,
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                this.core.Sharing('reload', 'reload');

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
                                };
                                this.core.OpenAlert(Success);

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
    // => / END : Approve

    /**
     * Reject
     */
    Reject(lvl) {
        swal({
            title: 'Please Confirm to Reject?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Reject',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.pr_kode,
                        lvl: lvl
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                this.core.Sharing('reload', 'reload');

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
                            console.error('Reject', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => / END : Reject

    /**
     * Print
     */
    WaitPrint;
    OnPrint;
    Print() {
        this.WaitPrint = true;
        this.OnPrint = true;
        setTimeout(() => {

            $('.print-area-compare').print({
                globalStyle: false,
                mediaPrint: true,
                iframe: false,
                title: 'Price Comparison ' + this.Data.pq.kode,
                timeout: 2000,
            });

            setTimeout(() => {
                this.WaitPrint = false;
                this.OnPrint = false;
            }, 500);

        }, 1000);
    }
    // => / END : Print

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

}
