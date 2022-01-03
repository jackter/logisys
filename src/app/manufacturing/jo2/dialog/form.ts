import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { JO2PrintDialogComponent } from './print';

@Component({
    selector: 'dialog-form-jo',
    templateUrl: './form.html',
    styleUrls: ['../jo2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class JO2FormDialogComponent implements OnInit {

    Material: any[];
    Output: any[];
    Utility: any[];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    minDate = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD').toString();

    InfOrder: any[] = [{
        i: 0
    }];

    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<JO2FormDialogComponent>

    ) {


    }

    ngOnInit() {
        if (this.form.id != 'add') {

            if (this.form.tanggal) {
                this.form.jo_date = moment(this.form.tanggal, 'YYYY-MM-DD');
            }

            setTimeout(() => {
                this.Material = this.form.material;
                this.Output = this.form.output;
                this.Utility = this.form.utility;

            

                this.BOMLast = this.form.bom_kode;
            }, 100);

            if (this.form.inforder) {
                this.InfOrder = JSON.parse(this.form.inforder);
                if (!this.form.is_detail) {
                    this.InfOrder.push({ i: 0 });
                }
            }
        }

        this.form.storeloc_show = this.form.storeloc_nama + ' (' + this.form.storeloc_kode + ')';
    }

    Edit() {
        this.form.is_detail = null;
        setTimeout(() => {
            $('*[name="output_qty"]').focus();
        }, 100);
    }

    /**
     * AC BOM
     */
    BOM: any = [];
    BOMLast;
    BOMFilter() {

        this.BOM = this.Default.bom;

        var val = this.form.bom_kode;

        if (val != this.BOMLast) {

            this.form.bom = null;
            this.form.bom_kode = null;
            this.form.plant = null;
            this.form.storeloc = null;
            this.form.storeloc_kode = null;
            this.form.storeloc_nama = null;

            $('*[name="bom_kode"]').focus();

        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.bom) {

                var Combine = item.kode + ' : ' + item.description;
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.description.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.BOM = Filtered;

        }

    }
    BOMSelect(e, item) {
        // console.log(item);

        if (e.isUserInput) {

            this.form.bom = item.id;
            this.form.bom_kode = item.kode;
            this.form.storeloc = item.storeloc;
            this.form.storeloc_kode = item.storeloc_kode;
            this.form.storeloc_nama = item.storeloc_nama;
            this.form.plant = item.plant;

            this.form.storeloc_show = this.form.storeloc_nama + ' (' + this.form.storeloc_kode + ')';

            this.Material = item.material;
            this.Output = item.output;
            this.Utility = item.utility;

            this.form.shift_rate = item.capacity / item.shift_total;
            this.form.man_power = 4;
            this.form.running_hours = 8;
            this.form.shift_rate = 2500000 / 3;

            this.BOMLast = item.kode;

            // console.log(this.form);

            setTimeout(() => {
                $('*[name="output_qty"]').focus();
            }, 250);

        }

    }
    BOMReset() {
        this.form.bom = null;
        this.form.bom_kode = null;

        var Selector = '*[name="bom_kode"]';

        setTimeout(() => {
            if ($(Selector).is(':focus')) {
                $(Selector).blur();

                setTimeout(() => {
                    $(Selector).focus();
                }, 200);
            }
        }, 100);
    }
    // End AC BOM

    /**
     * CalculateQty
     */
    CalculateQty() {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            let MainQty = this.Output[0].ref_qty;
            let Count = this.Output[0].qty / MainQty;


            // => Loop Target
            for (let item of this.Output) {

                item.qty = item.ref_qty * Count;

            }

            // => Loop Material
            for (let item of this.Material) {

                item.qty = item.ref_qty * Count;

            }

            // => Loop Utility
            for (let item of this.Utility) {

                item.qty = item.ref_qty * Count;

            }

        }, 250);

    }
    // => / END : CalculateQty

    // Create List
    CreateList(i) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            if (!this.InfOrder[i].info) {
                this.InfOrder[i] = {};
            }
            // Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.InfOrder[next]) {
                this.InfOrder.push(DataNext);
            }
        }, 100);
    }

    /**
     * simpan
     */
    Simpan() {

        this.form.material = JSON.stringify(this.Material);
        this.form.output = JSON.stringify(this.Output);
        this.form.utility = JSON.stringify(this.Utility);

        var InfOrder = [];
        for (let item of this.InfOrder) {
            if (item.info) {
                InfOrder.push(item);                
            }
        }
        this.form.inforder = JSON.stringify(InfOrder);

        if (this.form.jo_date) {
            this.form.jo_date_send = moment(this.form.jo_date).format('YYYY-MM-DD');
        }

        if (this.form.start_date) {
            this.form.start_date_send = moment(this.form.start_date).format('YYYY-MM-DD');
        }

        if (this.form.end_date) {
            this.form.end_date_send = moment(this.form.end_date).format('YYYY-MM-DD');
        }

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {
                    this.dialogRef.close(result);
                } else {
                    this.Busy = false;
                }
            },
            error => {
                this.Busy = false;

                this.core.OpenNotif(error);
                console.error('Simpan', error);
            }
        );
    }
    // => End Simpan

    FocusBOM() {
        setTimeout(() => {
            $('*[name="bom_kode"]').focus();
        }, 100);
    }

    /**
     * Verify
     */
    Verify() {
        swal({
            title: 'Please Confirm to Verify?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: 'Your Request will Continue to Approval Process'
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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    // => / END : Verify

    /**
     * Approve
     */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
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
                        kode: this.form.kode,
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approve Complete',
                                    msg: 'This Job Order now available for Actual Production'
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
    Reject() {
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
                        kode: this.form.kode
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Material Request Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'JO Rejected'
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
     * Print JO
     */
    dialogPrint: MatDialogRef<JO2PrintDialogComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowPrintDialog() {

        this.dialogPrint = this.dialog.open(
            JO2PrintDialogComponent,
            this.dialogPrintConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Default = this.Default;
        this.dialogPrint.componentInstance.perm = this.perm;
        this.dialogPrint.componentInstance.form = this.form;
        // => / END : Inject Data to Print Dialog

        /**
         * After Dialog Close
         */
        this.dialogPrint.afterClosed().subscribe(result => {

            this.dialogPrint = null;

            if (result) {

            }

        });
        // => / END : After Dialog Close

    }

}
