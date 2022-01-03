import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-ap-detail',
    templateUrl: './form.html'
})
export class APDetailFormDialogComponent implements OnInit {

    Material: any[];
    Output: any[];
    Utility: any[];

    Downtime: any[] = [{
        i: 0
    }];

    List: any[] = [{
        i: 0
    }];

    form: any = {};
    perm: any = {};
    Default: any = {};

    JO;

    ComUrl;
    Com;
    Busy;

    DetailID;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<APDetailFormDialogComponent>

    ) {


    }

    ngOnInit() {

        this.DTime = this.Default.downtime;

        if (this.form.id == 'add') {

            $.extend(this.form, this.Default.JO);

            this.Material = this.Default.JO.material;
            this.Output = this.Default.JO.output;
            this.Utility = this.Default.JO.utility;

            this.form.shift = 1;

        } else { //get

            this.form.ap_date = moment(this.form.tanggal).format('YYYY-MM-DD');

            setTimeout(() => {
                this.Material = this.form.material;
                this.Output = this.form.output;
                this.Utility = this.form.utility;
                this.Downtime = this.form.downtime;
                this.List = this.form.list;

                this.CalculateMain();

            }, 100);

        }

        console.log(this.form);

    }

    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (!item.is_fix) {
                var stock: number = item.stock;

                if (item.qty > item.stock) {
                    item.qty = stock;
                }
            }

            this.CalculateMain();

        }, 100);
    }

    CalculateMain() {

        /**
         * Get Total Material
         */
        var Total = 0;
        if (this.form.material) {
            for (let item of this.form.material) {
                if (!item.is_fix) {
                    Total += Number(item.qty) * Number(item.price);
                } else {
                    Total += Number(item.qty) * Number(item.fix_price);
                }
            }
        }
        if (this.form.utility) {
            for (let item of this.form.utility) {
                if (!item.is_fix) {
                    Total += Number(item.qty) * Number(item.price);
                } else {
                    Total += Number(item.qty) * Number(item.fix_price);
                }
            }
        }
        if (this.form.list) {
            for (let item of this.form.list) {
                if (!item.is_fix) {
                    Total += Number(item.qty) * Number(item.price);
                } else {
                    Total += Number(item.qty) * Number(item.fix_price);
                }
            }
        }
        //=> / END : Get Total Material

        /**
         * Total GI Dan Biaya Lain
         */
        Total += Number(this.form.biaya_gi) + Number(this.form.biaya_lain);
        //=> / END : Total GI Dan Biaya Lain

        /**
         * Calculate HPP
         */
        var TotalOutput = 0;
        for (let item of this.form.output) {
            TotalOutput += Number(item.qty);
        }
        for (let item of this.form.output) {

            if (Number(item.qty) > 0) {

                // var Persentase = (Number(item.qty) / TotalOutput);
                // var HPP = (Number(Total) * Persentase) / 100;
                // var UnitPrice = HPP;

                // // console.log(HPP, item.qty, UnitPrice, Persentase, Total);

                // item.hpp_total = UnitPrice * item.qty;
                // item.unit_price = UnitPrice;

                // var Persentase = (Number(item.qty) / TotalOutput);
                var Persentase = Number(item.persentase) / 100;
                var TotalPrice = Number(Total) * Persentase;
                var UnitPrice = TotalPrice / Number(item.qty);

                item.hpp_total = TotalPrice;
                item.unit_price = UnitPrice;

            }
        }
        //=> / END : Calculate HPP

    }

    /**
     * AC Downtime
     */
    DTime: any = [];
    DTimeLen: number;
    DTimeLast;
    WaitDTime: any[] = [];
    DTimeFilter(val: string, i: number) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var DownTime = JSON.parse(JSON.stringify(this.Default.downtime));

            if (val) {

                val = val.toString().toLowerCase();

                let j = 0;
                let Filtered = [];
                for (let item of DownTime) {

                    let k = 0;
                    let Detail = [];
                    for (let detail of item.detail) {

                        if (
                            detail.kode.toLowerCase().indexOf(val) != -1 ||
                            detail.nama.toLowerCase().indexOf(val) != -1
                        ) {
                            Detail[k] = detail;
                            k++;
                        }

                    }

                    if (
                        item.kode.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Detail.length > 0
                    ) {

                        if (Detail.length > 0) {
                            item.detail = Detail;
                        }
                        Filtered[j] = item;
                        j++;
                    }

                }

                this.DTime = Filtered;

            } else {
                this.DTime = DownTime;
            }

        }, 100);

    }
    DTimeSelect(e, item, i: number) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.Downtime, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {

                    this.Downtime[i] = item;

                    this.Downtime[i]['i'] = i;

                    this.DTime = [];

                    this.CreateListDowntime(i);

                    setTimeout(() => {
                        $('#duration-' + i).focus();
                    }, 100);

                } else {

                    var SelectExists = Find[0].i;

                    this.Downtime[i].nama = '';

                    setTimeout(() => {
                        this.WaitItem[i] = false;
                        $('#duration-' + SelectExists).focus();
                    }, 250);

                }

            }, 0);
        }
    }
    // AC Downtime

    /**
     * List
     */
    CreateListDowntime(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            //=> Check List
            if (!this.Downtime[i].kode) {
                this.Downtime[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.Downtime[next]) {
                this.Downtime.push(DataNext);
            }

        }, 100);

    }

    DeleteListDowntime(del) {

        swal({
            title: 'Delete List?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var DATA = Object.keys(this.Downtime);

                    //=> Delete
                    var NewDowntime = [];
                    let index = 0;
                    for (let i = 0; i < DATA.length; i++) {
                        if (del == i) {

                            delete this.Downtime[i];

                        } else {

                            this.Downtime[i].i = index;

                            NewDowntime[index] = this.Downtime[i];
                            index++;
                        }
                    }

                    //=> Recreaten
                    this.Downtime = NewDowntime;

                }

            }
        );

    }
    //=> / END : List

    Item: any;
    WaitItem: any[] = [];
    ItemFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitItem[i] = true;

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    storeloc: this.form.storeloc,
                    keyword: val
                };

                this.core.Do('e/stock/item/inc/list.instock', Params).subscribe(
                    result => {

                        if (result) {
                            this.Item = result;
                        }

                        this.WaitItem[i] = false;

                    },
                    error => {
                        console.error('ItemFilter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }
                );

            }, 100);

        }

    }
    ItemSelect(e, item, i: number) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.List, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {

                    this.List[i] = item;
                    this.List[i]['i'] = i;

                    this.Item = [];

                    this.CreateList(i);

                    setTimeout(() => {
                        $('#qty-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    this.List[i].nama = '';

                    setTimeout(() => {
                        this.WaitItem[i] = false;
                        $('#qty-' + SelectExists).focus();
                    }, 250);
                }

            }, 0);

        }

    }
    //=> / END : AC Item

    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            //=> Check List
            if (!this.List[i].kode) {
                this.List[i] = {};
            }

            //=> Check Next Input
            var next = Number(i) + 1;
            let DataNext = {
                i: next
            };

            if (!this.List[next]) {
                this.List.push(DataNext);
            }

        }, 100);

    }

    DeleteList(del) {

        swal({
            title: 'Delete List?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var DATA = Object.keys(this.List);

                    //=> Delete
                    var NewList = [];
                    let index = 0;
                    for (let i = 0; i < DATA.length; i++) {
                        if (del == i) {

                            delete this.List[i];

                        } else {

                            this.List[i].i = index;

                            NewList[index] = this.List[i];
                            index++;
                        }
                    }

                    //=> Recreaten
                    this.List = NewList;

                }

            }
        );

    }
    //=> / END : List

    Edit() {
        this.form.is_detail = null;
        setTimeout(() => {
            $('*[name="output_qty"]').focus();
        }, 100);
    }

    /**
    * simpan
    */
    Simpan() {

        this.form.material = JSON.stringify(this.Material);
        this.form.output = JSON.stringify(this.Output);
        this.form.utility = JSON.stringify(this.Utility);
        this.form.downtime = JSON.stringify(this.Downtime);
        this.form.list = JSON.stringify(this.List);

        this.form.ap_date_send = moment(this.form.ap_date).format('YYYY-MM-DD');

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        // console.log(this.form);

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

    /**
    * Verify
    */
    Verify() {

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

                        this.CheckCOA(() => {

                            var Params = {
                                id: this.form.id,
                                kode: this.form.kode,
                                total_days: this.form.total_days,
                                biaya_gi: this.form.biaya_gi,
                                biaya_lain: this.form.biaya_lain,
                                biaya_lain_detail: JSON.stringify(this.form.biaya_lain_detail)
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

                        });

                    }

                }
            );

        });
    }
    //=> / END : Verify

    /**
     * Approve
     */
    Approve() {

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

                        var Detail: any = {
                            material: this.form.material,
                            output: this.form.output,
                            utility: this.form.utility,
                            list: this.form.list,
                            downtime: this.form.downtime
                        };

                        this.form.ap_date_send = moment(this.form.ap_date).format('YYYY-MM-DD');

                        var Params = {
                            id: this.form.id,
                            tanggal: this.form.ap_date_send,
                            kode: this.form.kode,
                            jo: this.Default.JO.jo,
                            company: this.Default.JO.company,
                            dept: this.Default.JO.dept,
                            storeloc: this.Default.JO.storeloc,
                            storeloc_kode: this.Default.JO.storeloc_kode,
                            detail: JSON.stringify(Detail),
                            notimeout: 1,

                            total_days: this.form.total_days,
                            biaya_gi: this.form.biaya_gi,
                            biaya_lain: this.form.biaya_lain,
                            biaya_lain_detail: JSON.stringify(this.form.biaya_lain_detail)
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

                                    this.core.Sharing({
                                        reload_def: 1
                                    }, 'reload');
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
     * Check COA
     */
    CheckCOA(cb) {

        /**
         * Merge List
         */
        var CheckIDList = [];
        if (this.Material && this.Material.length > 0) {
            for (let item of this.Material) {
                CheckIDList.push({
                    id: item.id,
                    kode: item.kode,
                    nama: item.nama
                });
            }
        }
        if (this.Output && this.Output.length > 0) {
            for (let item of this.Output) {
                CheckIDList.push({
                    id: item.id,
                    kode: item.kode,
                    nama: item.nama
                });
            }
        }
        if (this.Utility && this.Utility.length > 0) {
            for (let item of this.Utility) {
                CheckIDList.push({
                    id: item.id,
                    kode: item.kode,
                    nama: item.nama
                });
            }
        }
        if (this.List && this.List.length > 0) {
            for (let item of this.List) {
                CheckIDList.push({
                    id: item.id,
                    kode: item.kode,
                    nama: item.nama
                });
            }
        }

        var ParamsCheck: any = {
            company: this.Default.JO.company,
            list: JSON.stringify(CheckIDList),
        };

        //=> / END : Merge List

        this.core.Do('e/stock/item/check.coa', ParamsCheck).subscribe(
            result => {

                if (result.status != 1) {

                    /**
                     * Create MSG
                     */
                    var MSG = '';
                    if (result.items) {
                        MSG = `
                        <div style="text-align: left!important">
                            <div>To verify transaction ref. <strong>${this.form.kode}</strong></div>
                            <div>Please call Accounting Dept to complete COA for the following items:</div>
                            <ol>
                        `;
                        for (let item of result.items) {
                            MSG += `
                                <li>
                                    <strong>${item.kode}</strong> : ${item.nama}
                                </li>
                            `;
                        }
                        MSG += `
                            </ol>
                        </div>
                        `;
                    }
                    //=> / END : Create MSG

                    this.core.OpenAlert({
                        title: 'Item COA Not Available',
                        msg: MSG,
                        width: 600
                    });

                } else {
                    cb();
                }

            }
        );

    }
    //=> / END : Check COA

    /**
     * Before Submit
     */
    BeforeSubmit(cb){

        var Continue = true;

        /**
         * Check Material
         */
        for(let item of this.Material){
            console.log(Number(item.stock), Number(item.qty));
            if(Number(item.stock) < Number(item.qty)){
                Continue = false;
                break;
            }
        }
        //=> / END : Check Material

        /**
         * Check Utility
         */
        for(let item of this.Utility){
            console.log(Number(item.stock), Number(item.qty));
            if(
                Number(item.stock) < Number(item.qty) && 
                Number(item.is_fix) != 1
            ){
                Continue = false;
                break;
            }
        }
        //=> / END : Check Utility

        /**
         * Check Other
         */
        for(let item of this.List){
            console.log(Number(item.stock), Number(item.qty));
            if(Number(item.stock) < Number(item.qty)){
                Continue = false;
                break;
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