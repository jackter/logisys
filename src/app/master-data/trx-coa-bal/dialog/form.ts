import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-coa',
    templateUrl: './form.html'
})
export class TrxBalFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<TrxBalFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;

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
                $('*[name="doc_name"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.form.sub = null;

        this.Company = this.Default.company;

        this.DocNameRemove();
        this.AccountOfRemove();

    }
    // => / END : AC Company

    /**
     * Doc Trx
     */
    DocTrx: any;
    DocNameFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {            
            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'doc_trx.list', Params).subscribe(
                result => {

                    if (result) {
                        this.DocTrx = result;                        
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    DocNameSelect(e, item) {

        if (e.isUserInput) {

            this.form.doc_id = item.id;
            this.form.doc_source = item.doc_source;
            this.form.doc_nama = item.doc_nama;


            setTimeout(() => {
                $('*[name="account"]').focus();
            }, 100);

        }
    }
    DocNameRemove() {

        this.form.doc_id = null;
        this.form.doc_source = null;
        this.form.doc_name = null;
        this.AccountOfRemove();

    }
    // => Doc Trx

    /**
     * Account
     */
    Account: any;
    AccountFilter(val: string) {

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
                        this.Account = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    AccountSelect(e, item) {

        if (e.isUserInput) {

            this.form.coa = item.id;
            this.form.coa_kode = item.kode;
            this.form.coa_nama = item.nama;


            setTimeout(() => {
                $('*[name="opening_balance"]').focus();
            }, 100);

        }
    }
    AccountOfRemove() {

        this.form.account = null;
        this.form.coa = null;
        this.form.coa_kode = null;
        this.form.coa_nama = null;

    }
    // => Account

}
