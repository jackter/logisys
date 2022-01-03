import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-dialog-deliver',
    templateUrl: './form.html'
})
export class DeliverRequestFormDialogComponent implements OnInit {

    Material: any[];

    List: any[];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;

    Com;
    Busy;

    DetailID;

    Delay;

    ReadytoSave;

    minDate = moment(new Date()).subtract(10, 'days').format('YYYY-MM-DD').toString();
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        public core: Core,
        private dialogRef: MatDialogRef<DeliverRequestFormDialogComponent>

    ) {


    }

    ngOnInit() {

        // this.Store = this.Default.storeloc;

        if (this.form.id == 'add') {

            var ID = this.form.id;

            this.form = JSON.parse(JSON.stringify(this.Default.MTR));
            this.form.id = ID;

            this.form.prd = this.Default.MTR.id;
            this.form.prd_kode = this.Default.MTR.kode;
            this.List = this.Default.MTR.list;
            this.Material = this.Default.MTR.material;

        } else {

            this.ReadytoSave = 1;

            this.List = this.form.list;
            this.Material = this.form.material;

            // if (this.form.tanggal) {
            //     this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD');
            // }

            /**
             * Trigger Calculate
             */
            if (this.List && this.List.length > 0) {
                for (let item of this.List) {
                    var Find = _.find(this.Default.MTR.list, {
                        id: item.id
                    });
                    if (Find.storeloc_list) {
                        item.storeloc_list = Find.storeloc_list;
                    }

                    this.Calculate(item);
                }
            }
            if (this.Material && this.Material.length > 0) {
                for (let item of this.Material) {
                    var Find = _.find(this.Default.MTR.material, {
                        id: item.id
                    });
                    if (Find.storeloc_list) {
                        item.storeloc_list = Find.storeloc_list;
                    }

                    this.Calculate(item);
                }
            }
            //=> / END : Trigger Calculate


        }

        
    }

    focusTo(target) {
        setTimeout(() => {
            $(target).focus();
        }, 50);
    }

    /**
     * AC Storeloc
     */
    Store: any = {
        material: [],
        list: []
    };
    StoreKeep: any = [];
    StoreLast: any = {
        material: [],
        list: []
    };
    StoreFilter(val, data, storelist) {

        if (!storelist) {
            data.storeloc_list_def = JSON.parse(JSON.stringify(data.storeloc_list));
            this.StoreFilter(val, data, data.storeloc_list_def);
            return false;
        }

        if (data.storeloc != null) {
            this.ReadytoSave = 1;
        } else {
            this.ReadytoSave = null;
        }

        if (val && val != '') {

            let i = 0;
            let Filtered = [];
            for (let item of storelist) {

                var Combine = item.storeloc_kode + ' : ' + item.storeloc_nama;
                if (
                    item.storeloc_kode.toLowerCase().indexOf(val) != -1 ||
                    item.storeloc_nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }

            data.storeloc_list = Filtered;

        } else {
            data.storeloc_list = JSON.parse(JSON.stringify(data.storeloc_list_def));
        }

    }
    StoreSelect(e, item, data, key, i) {
        if (e.isUserInput) {

            data.storeloc = item.storeloc;
            data.storeloc_kode = item.storeloc_kode;
            data.storeloc_nama = item.storeloc_nama;
            data.stock = item.stock;
            data.price = item.price;

            setTimeout(() => {
                $('#' + key + '-qty-' + i).focus();
            }, 100);

        }
    }
    StoreReset(item, key, i) {
        item.storeloc = null;
        item.storeloc_kode = null;
        item.storeloc_nama = null;
        item.price = null;
        item.stock = null;
        item.stock_def = null;
        item.qty = null;

        setTimeout(() => {
            $('#' + key + '-store-' + i).focus();
        }, 100);

        // this.StoreFilter(item.storeloc_nama, item, item.storeloc_list);
    }
    //=> End AC storeloc

    /**
     * Calculate Class
     */
    ReadySave: number;
    Calculate(item) {

        this.ReadySave = null;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (item.qty_receive != null) {
                this.ReadytoSave = 1;
            } else {
                this.ReadytoSave = null;
            }

            if (!item.stock_def) {
                item.stock_def = Number(JSON.parse(JSON.stringify(item.stock)));
                this.Calculate(item);
                return false;
            }

            if(!this.form.is_detail){

                if (Number(item.qty_receive) == 0) {
                    var qty_ref: number = item.qty_ref;
                } else {
                    var qty_ref: number = item.qty_ref - item.qty_receive;
                }

                // var stock: number = item.stock;

                // if(item.qty > item.qty_ref && item.qty_ref < item.stock){
                //     item.qty = qty_ref;
                // }else
                // if(item.qty > item.qty_ref && item.qty_ref > item.stock){
                //     item.qty = stock;
                // }

                if (
                    Number(item.qty) > Number(item.qty_ref) && 
                    Number(item.qty_ref) < Number(item.stock_def)
                ) {
                    item.qty = qty_ref;
                } else
                    if (Number(item.qty) > Number(item.stock_def)) {
                        item.qty = item.stock_def;
                    }

                /**
                 * Update Stock
                 */
                setTimeout(() => {
                    let Stock: number = Number(item.stock_def) - Number(item.qty);
                    if (Stock <= 0) {
                        Stock = 0;
                    }

                    item.stock = Stock;
                }, 100);
                //=> / END : Update Stock

            }

        }, 100);

    }
    //=> / END : Class

    /**
    * simpan
    */
    Simpan() {

        this.form.material = JSON.stringify(this.Material);
        this.form.list = JSON.stringify(this.List);
        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        var HostComUrl = this.ComUrl;

        var URL = HostComUrl + 'edit';
        if (this.form.id == 'add' && this.form.is_reception != 1) {
            URL = HostComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    var Success = {
                        type: 'success',
                        showConfirmButton: false,
                        title: 'Save Complete',
                        // msg: 'Your Request will Continue to Approval Process'
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
                this.Busy = false;

                this.core.OpenNotif(error);
                console.error('Simpan', error);
            }
        );

    }
    // => End Simpan

    /**
    * Verify
    */
    Verify(rcv = null) {

        this.BeforeSubmit(() => {

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
                            id: this.form.id_deliver,
                            kode: this.form.kode,
                            receive_process: rcv
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

        });

    }
    //=> / END : Verify

    /**
     * Approve
     */
    Approve(rcv = null) {

        this.BeforeSubmit(() => {

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
                            prd: this.form.prd,
                            company: this.Default.MTR.company,
                            dept: this.Default.MTR.dept,
                            material: JSON.stringify(this.Material),
                            list: JSON.stringify(this.List),
                            receive_process: rcv,
                            storeloc: this.Default.MTR.storeloc,
                            tanggal: moment(this.form.tanggal).format('YYYY-MM-DD')
                        };

                        console.log(Params);
                         

                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                            result => {

                                if (result.status == 1) {

                                    var Success = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Approve Complete',
                                        // msg: 'This Job Order now available for Actual Production'
                                    };
                                    this.core.OpenAlert(Success);

                                    result.approve = 1;

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

        });

    }
    //=> / END : Approve

    /**
     * Reject
     */
    Reject(rcv = null) {
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
                        kode: this.form.kode,
                        receive_process: rcv
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
                                    info: "MR Rejected"
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
    //=> / END : Reject

    /**
     * Receive Materials
     */
    ButtonReceive() {
        this.form.is_detail = false;
        this.form.ReadOnly = true;

        /**
         * Focus to not readonly
         */
        setTimeout(() => {
            var FindInput = $('#container-list_item :input:not([readonly]):enabled:visible:first');

            $(FindInput).focus();
        }, 100);
        //=> / END : Focus to not readonly
    }
    //=> / END : Receive Materials

    FocusBOM(){
        
    }

    /**
     * Before Submit
     */
    BeforeSubmit(cb){

        var Continue = true;

        /**
         * Check Material
         */
        if(this.Material){
            for(let item of this.Material){
                console.log(Number(item.stock_def), Number(item.qty));
                if(Number(item.stock_def) < Number(item.qty)){
                    Continue = false;
                    break;
                }
            }
        }
        //=> / END : Check Material

        /**
         * Check Utility
         */
        // for(let item of this.Utility){
        //     console.log(Number(item.stock), Number(item.qty));
        //     if(
        //         Number(item.stock) < Number(item.qty) && 
        //         Number(item.is_fix) != 1
        //     ){
        //         Continue = false;
        //         break;
        //     }
        // }
        //=> / END : Check Utility

        /**
         * Check Other
         */
        if(this.List){
            for(let item of this.List){
                console.log(Number(item.stock_def), Number(item.qty));
                if(Number(item.stock_def) < Number(item.qty)){
                    Continue = false;
                    break;
                }
            }
        }
        //=> / END : Check Other

        if(!Continue){
            this.core.OpenAlert({
                title: 'Stock Error',
                msg: `Please check stock availability to finish the action.`
            });
        }else{
            return cb();
        }

    }
    //=> / END : Before Submit

}