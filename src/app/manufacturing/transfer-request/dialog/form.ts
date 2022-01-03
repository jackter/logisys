import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-dialog',
    templateUrl: './form.html'
})
export class TransferRequestFormDialogComponent implements OnInit {

    Material: any[];

    List: any[] = [{
        i: 0
    }];

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl = "e/manufacturing/mtr/";

    Com;
    Busy;

    from_ap;

    DetailID;

    Delay;

    constructor(
        public core: Core,
        private dialogRef: MatDialogRef<TransferRequestFormDialogComponent>

    ) {


    }

    ngOnInit() {

        if (this.from_ap == 1) {

            this.Material = this.Default.JO.material;
            this.form = this.Default.JO;
        } else {

            this.JO = this.Default.JO;

            if (this.form.id != 'add') {
                this.List = this.form.list;
                this.Material = this.form.material;

                console.log(this.List);
                console.log(this.Material);
            }
        }

        

    }

    /**
     * Calculate
     */
    ReadytoSave;
    Calculate(item) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            if (item.qty != null) {
                this.ReadytoSave = 1;
            } else {
                this.ReadytoSave = null;
            }

        }, 100);

    }
    //=> End Calculate

    JO: any = [];
    JOLen: number;
    JOLast;
    JOFilter() {

        var val = this.form.jo_kode;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.JO) {

                if (
                    item.jo_kode.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.JO = Filtered;

        } else {

            this.JO = this.Default.JO;
        }

    }
    JOSelect(e, item) {

        if (e.isUserInput) {

            this.form.jo = item.id;

            this.form.company = item.company;
            this.form.company_nama = item.company_nama;
            this.form.company_abbr = item.company_abbr;

            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;

            this.JOLast = item.jo_kode;

            this.Material = item.material;

            setTimeout(() => {
                $('*[name="note"]').focus();
            }, 100);

        }

    }
    JORemove() {
        this.form.jo = null;
        this.form.jo_kode = null;
        
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.form.dept = null;
        this.form.dept_nama = null;
        this.form.dept_abbr = null;

        this.JOLast = null;

        this.Material = null;

        this.JO = this.Default.JO;
    }

    /**
    * simpan
    */
    Simpan() {

        this.form.material = JSON.stringify(this.Material);
        this.form.list = JSON.stringify(this.List);

        if (this.from_ap == 1) {

            var URL = this.ComUrl + 'add';
        } else {

            var URL = this.ComUrl + 'edit';
            if (this.form.id == 'add') {
                URL = this.ComUrl + 'add';
            }
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
     * AC Item
     */
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
                    keyword: val
                };

                this.core.Do('e/stock/item/inc/list.normal', Params).subscribe(
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
                                    title: 'Request Transfer Rejected',
                                    msg: 'Material Transfer Request Rejected'
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'MTR Rejected'
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