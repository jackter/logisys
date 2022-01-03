import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-coa',
    templateUrl: './form.html'
})
export class COAFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<COAFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;
        this.AccountType = this.Default.account_type;

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
        // => / Check Company

    }

    FocusAccountOf() {
        setTimeout(() => {
            $('*[name="account_of"]').focus();
        }, 100);

    }

    Edit(): void {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    /**
     * Simpan
     */
    Simpan() {

        if (this.form.date_balance) {
            this.form.date_balance_send = moment(this.form.date_balance).format('YYYY-MM-DD');
        }

        if (this.form.sub != 1) { // tanpa sub akun
            this.form.lv1 = 1;
            this.form.lv2 = 0;
            this.form.lv3 = 0;
            this.form.lv4 = 0;
            this.form.lv5 = 0;
        }

        this.form.year = moment(this.form.date_balance).format('YYYY');
        this.form.month = moment(this.form.date_balance).format('MM');

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
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
    // => / END : Simpan

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
                $('*[name="account_type"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.form.sub = null;

        this.Company = this.Default.company;

        this.AccountOfRemove();

    }
    // => / END : AC Company

    /**
     * Account Type
     */
    AccountType: any = [];
    AccountTypeFilter() {

        var val = this.form.account_type;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.account_type) {

                if (
                    item.nama.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.AccountType = Filtered;

        } else {
            this.AccountType = this.Default.account_type;
        }
    }
    AccountTypeSelect(e, item) {
        if (e.isUserInput) {

            this.form.type = item.id;

            setTimeout(() => {
                $('*[name="account_no"]').focus();
            }, 100);

        }

    }
    AccountTypeRemove() {

        this.form.type = null;
        this.form.account_type = null;

        this.AccountType = this.Default.account_type;
    }
    // => ENd Account Type

    /**
     * Account Of
     */
    AccountOf: any;
    AccountOfFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'coa.list', Params).subscribe(
                result => {

                    if (result) {
                        this.AccountOf = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    AccountOfSelect(e, item) {

        if (e.isUserInput) {

            this.form.accountof = item.id;
            this.form.lv1 = item.lv1;
            this.form.lv2 = item.lv2;
            this.form.lv3 = item.lv3;
            this.form.lv4 = item.lv4;
            this.form.lv5 = item.lv5;

            for (let lv = 2; lv <= 5; lv++) { // sub akun

                if (
                    item['lv' + (lv)] &&
                    item['lv' + (lv)] == 0
                ) {
                    this.form['lv' + lv] = item.id;

                    lv = 6;
                }
            }

            setTimeout(() => {
                $('*[name="opening_balance"]').focus();
            }, 100);

        }
    }
    AccountOfRemove() {

        this.form.account_of = null;
        this.form.accountof = null;
        this.form.lv1 = null;
        this.form.lv2 = null;
        this.form.lv3 = null;
        this.form.lv4 = null;
        this.form.lv5 = null;

    }
    // => Account Of

}
