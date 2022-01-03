import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-Poting',
    templateUrl: './form_journal.html'
})
export class SP3JournalFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    List: any[] = [{
        i: 0
    }];

    ComUrl;
    Com;
    Busy;
    Data: any;

    Delay;

    journalIsExist = false;


    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<SP3JournalFormDialogComponent>
    ) {

    }

    ngOnInit() {

        var Params = {
            id: this.Data.id
        };

        this.core.Do(this.ComUrl + 'get_jv_sp3', Params).subscribe(
            result => {

                if (result) {

                    if (result.data.list) {
                        this.journalIsExist = true;

                        this.List = result.data.list;

                        var Credit: number = 0;
                        var Debit: number = 0;

                        for (let item of this.List) {
                            if (item.debit) {
                                Debit += Number(item.debit);
                            }
                            if (item.credit) {
                                Credit += Number(item.credit);
                            }
                        }

                        this.form.debitTotal = Debit;
                        this.form.maxDebitTotal = Debit;
                        this.form.creditTotal = Credit;
                    }

                    if (!this.journalIsExist) {
                        if (result.data.detail) {
                            var Credit: number = 0;
                            var Debit: number = 0;
                            var i = 1;

                            for (let item of result.data.detail) {
                                if (item.jumlah > 0) {
                                    item.debit = item.jumlah;
                                    item.credit = 0;
                                }
                                else {
                                    item.credit = item.jumlah * -1;
                                    item.debit = 0;
                                }

                                if (item.debit) {
                                    Debit += Number(item.debit);
                                }
                                if (item.credit) {
                                    Credit += Number(item.credit);
                                }

                                item.id = i;

                                i++;
                            }

                            let DataAkumulasi = {
                                id: i,
                                credit: Debit - Credit
                            };

                            this.List = result.data.detail;

                            this.List.push(DataAkumulasi);

                            var Credit: number = 0;
                            var Debit: number = 0;

                            for (let item of this.List) {
                                if (item.debit) {
                                    Debit += Number(item.debit);
                                }
                                if (item.credit) {
                                    Credit += Number(item.credit);
                                }
                            }

                            this.form.debitTotal = Debit;
                            this.form.maxDebitTotal = Debit;
                            this.form.creditTotal = Credit;

                        }
                    }

                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );

    }
    ChangeValue() {
        var Credit: number = 0;
        var Debit: number = 0;
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            for (let item of this.List) {
                if (item.debit) {
                    Debit += Number(item.debit);
                }
                if (item.credit) {
                    Credit += Number(item.credit);
                }
            }

            this.form.debitTotal = Debit;
            this.form.creditTotal = Credit;

        }, 100);
    }

    /**
    * Focus To
    */
    FocusTo(target) {
        console.log(target);
        setTimeout(() => {
            $(target).focus();
        }, 100);
    }
    // => / END : Focus To

    /**
    * AC COA
    */
    COA: any;
    WaitItem: any[] = [];
    async COAFilter(val: string, i: number) {

        if (val) {

            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {

                this.WaitItem[i] = true;

                val = val.toString().toLowerCase();

                var Params = {
                    NoLoader: 1,
                    company: this.Data.company,
                    keyword: val
                };

                this.core.Do(this.ComUrl + 'coa.list', Params).subscribe(
                    result => {

                        if (result) {
                            this.COA = result;
                        }

                        this.WaitItem[i] = false;
                    },
                    error => {
                        console.error('Coa Filter', error);
                        this.core.OpenNotif(error);
                        this.WaitItem[i] = false;
                    }

                );

            }, 100);

        }

    }
    COASelect(e, item, i: number) {

        if (e.isUserInput) {

            var Find = this.core.FJSON(this.List, 'id', item.id);

            setTimeout(() => {

                if (Find.length <= 0) {
                    this.List[i].kode = item.kode;
                    this.List[i].nama = item.nama;
                    this.List[i]['i'] = i;

                    this.COA = [];

                    // this.CreateList(i);

                    setTimeout(() => {
                        $('#debit-' + i).focus();
                    }, 100);
                } else {
                    var SelectExists = Find[0].i;

                    this.List[i].nama = '';

                    setTimeout(() => {
                        this.WaitItem[i] = false;
                        $('#credit-' + SelectExists).focus();
                    }, 250);
                }

            }, 0);

        }

    }
    // => End AC COA

    /**
     * List
     */
    CreateList(i) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            // => Check List
            // if (!this.List[i].kode) {
            //     this.List[i] = {};
            // }

            // => Check Next Input
            // var next = Number(i) + 1;
            // let DataNext = {
            //     i: next
            // };

            // if (!this.List[next]) {
            //     this.List.push(DataNext);
            // }

            let next = Object.keys(this.List).length + 1;
            let DataNext = {
                id: next
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

                    // => Delete
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

                    // => Recreaten
                    this.List = NewList;

                    this.ChangeValue();
                }

            }
        );

    }
    // => / END : List

    /**
     * Veriry
     */
    Verify() {
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

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                        company: this.form.company,
                        tanggal: this.form.tanggal,
                        list: JSON.stringify(this.form.list)
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: 'Invoice Verified'
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
    // => End : Verify

    /**
     * Simpan
     */
    Simpan() {
        if (this.form.debitTotal != this.form.creditTotal) {
            this.core.OpenAlert({
                title: 'Debit/Credit Not Balace',
                msg: '<div>Debit Total is not balance with Credit Total.</div>',
                width: 400
            });
        }
        else if (this.form.debitTotal != this.form.maxDebitTotal) {
            this.core.OpenAlert({
                title: 'Journal Value Is Not Balance',
                msg: '<div>Journal values is not balance with SP3 Total.</div>',
                width: 400
            });

            // msg: '<div>Journal values (' + this.core.rupiah(this.form.debitTotal) + ') is not balance with SP3 Total (' + this.core.rupiah(this.Data.total) + ').</div>',
        }
        else {

            var URL = this.ComUrl + 'edit_jv_sp3';
            if (!this.journalIsExist) {
                URL = this.ComUrl + 'add_jv_sp3';
            }

            this.form.list = JSON.stringify(this.List);

            this.form.id = this.Data.id;

            this.Busy = true;
            this.core.Do(URL, this.form).subscribe(
                result => {

                    if (result.status == 1) {

                        this.core.Sharing('reload', 'reload');

                        var Success = {
                            type: 'success',
                            showConfirmButton: false,
                            title: 'Request Saved',
                            msg: 'Please Verify your input to confirm and continue the process!'
                        };
                        this.core.OpenAlert(Success);

                        this.dialogRef.close(result);

                    } else {
                        this.Busy = false;

                        var Alert = {
                            msg: result.error_msg
                        };
                        this.core.OpenAlert(Alert);
                    }

                },
                error => {
                    this.Busy = false;

                    console.error('Simpan', error);
                }
            );
        }

    }
    // => / END : Simpan

}
