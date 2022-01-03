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
export class AP2DetailFormDialogComponent implements OnInit {

    Material: any[];
    Output: any[];
    Utility: any[];

    ManPower: any[] = [{
        i: 0
    }];

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
        private dialogRef: MatDialogRef<AP2DetailFormDialogComponent>

    ) {


    }

    MaterialBE = {
        in_decimal : 1,
        is_fix : 1,
        kode: 'BEMIX0001',
        nama: 'Bleaching Earth Mixed',
        satuan: 'Kg',
        tipe: 1,
        id: 3000
    }

    ngOnInit() {

        // this.DTime = this.Default.downtime;

        if (this.form.id == 'add') {

            $.extend(this.form, this.Default.JO);

            this.Material = [];
            this.Output = [];
            this.Utility = [];

            this.Material = JSON.parse(JSON.stringify(this.Default.JO.material));
            this.Material.push(this.MaterialBE);

            this.Output = JSON.parse(JSON.stringify(this.Default.JO.output));
            this.Utility = JSON.parse(JSON.stringify(this.Default.JO.utility));

        } else { //get

            this.form.ap_date = moment(this.form.tanggal).format('YYYY-MM-DD');

            this.List = this.form.list;
            this.ManPower = this.form.list_man_power;

            setTimeout(() => {
                this.Material = this.form.material;

                this.Output = this.form.output;
                this.Utility = this.form.utility;

                this.CalculateMain();

            }, 100);

        }
    }

    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (!item.is_fix) {
                var stock_def: number = item.stock_def;

                item.stock = stock_def - item.qty;

                if (item.qty > stock_def) {
                    item.qty = stock_def;
                    item.stock = 0;
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
                    this.List[i]['stock_def'] = item.stock;
                    
                    this.List[i]['i'] = i;

                    this.Item = [];

                    this.CreateList(i, 'item');

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
     * AC Man Power
     */
    ListManPower: any = [];
    WaitManPower: any[] = [];
    FilterManPower(val, i: number) {

        if(val) {
            this.ListManPower = [];

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
    
                this.WaitManPower[i] = true;
    
                var Params = {
                    NoLoader: 1,
                    company: this.form.company,
                    keyword: val
                };
    
                this.core.Do(this.ComUrl + 'detail/list.karyawan', Params).subscribe(
                    result => {
                        if (result.list_karyawan) {
                            this.ListManPower = result.list_karyawan;
                            
                            this.WaitManPower[i] = false;
                        } else {
                            this.WaitManPower = [];
                            this.CreateList(i, 'man_power');
                        }
                    },
                    error => {
                        this.core.OpenNotif(error);
                        this.WaitManPower[i] = false;
                    }
                );
            }, 100);
        }
    }

    SelectManPower(e, item, i: number, type: string) {
        if (e.isUserInput) {

            var Find = this.core.FJSON(this.ManPower, 'kid', item.id);

            setTimeout(() => {

                if(Find.length <= 0) {
                    this.ManPower[i].kid = item.id;
                    this.ManPower[i].nik = item.nik;
                    this.ManPower[i].nama = item.nama;
    
                    this.ManPower[i]['i'] = i;
    
                    this.ListManPower = [];
                    this.CreateList(i, type);
                } else {
                    var SelectExists = Find[0].i;

                    this.ManPower[i].nama = '';

                    setTimeout(() => {
                        this.WaitManPower[i] = false;
                        $('#nama-' + SelectExists).focus();
                    }, 250);
                }
            });
        }
    }
    //=> END : AC Man Power

    /**
     * List
     */
    CreateList(i, type: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (type == 'item') {
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
            } else 
            if (type == 'man_power') {
                if (!this.ManPower[i].nama) {
                    this.ManPower[i] = {};
                }

                //=> Check Next Input
                var next = Number(i) + 1;
                let DataNext = {
                    i: next
                };

                if (!this.ManPower[next]) {
                    this.ManPower.push(DataNext);
                }

                this.form.man_power = this.ManPower.length - 1;
            }

        }, 100);

    }

    DeleteList(del, type: string) {

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

                    if(type == 'item') {
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
                    } else
                    if (type == 'man_power') {
                        var DATA = Object.keys(this.ManPower);

                        //=> Delete
                        var NewList = [];
                        let index = 0;
                        for (let i = 0; i < DATA.length; i++) {
                            if (del == i) {
    
                                delete this.ManPower[i];
    
                            } else {
    
                                this.ManPower[i].i = index;
    
                                NewList[index] = this.ManPower[i];
                                index++;
                            }
                        }
    
                        //=> Recreaten
                        this.ManPower = NewList;

                        this.form.man_power = NewList.length - 1;
                    }
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
        this.form.list = JSON.stringify(this.List);
        this.form.list_man_power = JSON.stringify(this.ManPower);

        this.form.ap_date_send = moment(this.form.ap_date).format('YYYY-MM-DD');

        var URL = this.ComUrl + 'detail/edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'detail/add';
        }

        console.log(this.form);

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

        // this.BeforeSubmit(() => {

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
                                notimeout: 1,
                                // total_days: this.form.total_days,
                                // biaya_gi: this.form.biaya_gi,
                                // biaya_lain: this.form.biaya_lain,
                                // biaya_lain_detail: JSON.stringify(this.form.biaya_lain_detail)
                            };

                            this.Busy = true;
                            this.core.Do(this.ComUrl + 'detail/verify', Params).subscribe(
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

        // });
    }
    //=> / END : Verify

    /**
     * Approve
     */
    Approve() {

        // this.BeforeSubmit(() => {

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

                        // var Detail: any = {
                        //     material: this.form.material,
                        //     output: this.form.output,
                        //     utility: this.form.utility,
                        //     list: this.form.list,
                        //     list_man_power: this.form.list_man_power
                        // };

                        // this.form.ap_date_send = moment(this.form.ap_date).format('YYYY-MM-DD');

                        var Params = {
                            id: this.form.id,
                            kode: this.form.kode,
                            company: this.form.company,
                            dept: this.form.dept,
                            storeloc: this.form.storeloc,
                            output: JSON.stringify(this.form.output),
                            material: JSON.stringify(this.form.material),
                            utility: JSON.stringify(this.form.utility),
                            list: JSON.stringify(this.form.list),
                            tanggal: this.form.tanggal,
                            // tanggal: this.form.ap_date_send,
                            // jo: this.Default.JO.jo,
                            // company: this.Default.JO.company,
                            // dept: this.Default.JO.dept,
                            // storeloc: this.Default.JO.storeloc,
                            // storeloc_kode: this.Default.JO.storeloc_kode,
                            // detail: JSON.stringify(Detail),
                            notimeout: 1,

                            // total_days: this.form.total_days,
                            // biaya_gi: this.form.biaya_gi,
                            // biaya_lain: this.form.biaya_lain,
                            // biaya_lain_detail: JSON.stringify(this.form.biaya_lain_detail)
                        };

                        console.log(Params);
                        

                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'detail/approve', Params).subscribe(
                            result => {

                                if (result.status == 1) {

                                    var Success = {
                                        type: 'success',
                                        showConfirmButton: false,
                                        title: 'Approve Complete',
                                        msg: 'This Job Order now available for Actual Production'
                                    };
                                    this.core.OpenAlert(Success);

                                    // this.core.Sharing({
                                    //     reload_def: 1
                                    // }, 'reload');
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

        // });

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
                    this.core.Do(this.ComUrl + 'detail/reject', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'error',
                                    showConfirmButton: false,
                                    title: 'Request Rejected',
                                    msg: 'Actual Production Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "AP Rejected"
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
        // var CheckIDList = [];
        // if (this.Material && this.Material.length > 0) {
        //     for (let item of this.Material) {
        //         CheckIDList.push({
        //             id: item.id,
        //             kode: item.kode,
        //             nama: item.nama
        //         });
        //     }
        // }
        // if (this.Output && this.Output.length > 0) {
        //     for (let item of this.Output) {
        //         CheckIDList.push({
        //             id: item.id,
        //             kode: item.kode,
        //             nama: item.nama
        //         });
        //     }
        // }
        // if (this.Utility && this.Utility.length > 0) {
        //     for (let item of this.Utility) {
        //         CheckIDList.push({
        //             id: item.id,
        //             kode: item.kode,
        //             nama: item.nama
        //         });
        //     }
        // }
        // if (this.List && this.List.length > 0) {
        //     for (let item of this.List) {
        //         CheckIDList.push({
        //             id: item.id,
        //             kode: item.kode,
        //             nama: item.nama
        //         });
        //     }
        // }

        // var ParamsCheck: any = {
        //     company: this.Default.JO.company,
        //     list: JSON.stringify(CheckIDList),
        // };

        // //=> / END : Merge List

        // this.core.Do('e/stock/item/check.coa', ParamsCheck).subscribe(
        //     result => {

        //         if (result.status != 1) {

        //             /**
        //              * Create MSG
        //              */
        //             var MSG = '';
        //             if (result.items) {
        //                 MSG = `
        //                 <div style="text-align: left!important">
        //                     <div>To verify transaction ref. <strong>${this.form.kode}</strong></div>
        //                     <div>Please call Accounting Dept to complete COA for the following items:</div>
        //                     <ol>
        //                 `;
        //                 for (let item of result.items) {
        //                     MSG += `
        //                         <li>
        //                             <strong>${item.kode}</strong> : ${item.nama}
        //                         </li>
        //                     `;
        //                 }
        //                 MSG += `
        //                     </ol>
        //                 </div>
        //                 `;
        //             }
        //             //=> / END : Create MSG

        //             this.core.OpenAlert({
        //                 title: 'Item COA Not Available',
        //                 msg: MSG,
        //                 width: 600
        //             });

        //         } else {
        //             cb();
        //         }

        //     }
        // );

        cb();

    }
    //=> / END : Check COA

    /**
     * Before Submit
     */
    BeforeSubmit(cb){

        // var Continue = true;

        // /**
        //  * Check Material
        //  */
        // for(let item of this.Material){
        //     console.log(Number(item.stock), Number(item.qty));
        //     if(Number(item.stock) < Number(item.qty)){
        //         Continue = false;
        //         break;
        //     }
        // }
        // //=> / END : Check Material

        // /**
        //  * Check Utility
        //  */
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
        // //=> / END : Check Utility

        // /**
        //  * Check Other
        //  */
        // for(let item of this.List){
        //     console.log(Number(item.stock), Number(item.qty));
        //     if(Number(item.stock) < Number(item.qty)){
        //         Continue = false;
        //         break;
        //     }
        // }
        // //=> / END : Check Other

        // if(!Continue){
        //     this.core.OpenAlert({
        //         title: 'Stock Error',
        //         msg: `Please check stock availability to finish the action.`
        //     });
        // }else{
        //     return cb();
        // }

        cb();

    }
    //=> / END : Before Submit

    rupiah(val, fix) {
        if(val) {
            if(!fix) {
                return this.core.rupiah(val);
            }
        }
    }
}