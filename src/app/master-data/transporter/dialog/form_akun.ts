import { Component, OnInit } from '@angular/core';
import { Core } from '../../../../providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-transporter',
    templateUrl: './form_akun.html',
})
export class TransporterFormAkunDialogComponent implements OnInit {

    global: any;
    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;
    Data: any;
    Delay;
    ShowEditor = false;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<TransporterFormAkunDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;

        this.form.pihakketiga = this.Data.id;
        this.form.pihakketiga_kode = this.Data.kode;
        this.form.pihakketiga_nama = this.Data.nama;

        var Time = 1000;
        if (this.form.is_detail) {
            Time = 0;
        }

        setTimeout(() => {
            this.ShowEditor = true;
        }, Time);

    }

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

            var isDetail = true;

            this.CompanyLast = item.nama;

            var Params = {
                id: this.Data.id,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'get_coa', Params).subscribe(
                result => {

                    if (result && result.data) {

                        this.form.is_detail = isDetail;

                        this.form.id = result.data['id'];
                        this.form.account = result.data['coa_kode'] + " - " + result.data['coa_nama'];
                        this.form.coa = result.data['coa'];
                        this.form.coa_kode = result.data['coa_kode'];
                        this.form.coa_nama = result.data['coa_nama'];
                        this.form.account_accrued = result.data['coa_kode_accrued'] + " - " + result.data['coa_nama_accrued'];
                        this.form.coa_accrued = result.data['coa_accrued'];
                        this.form.coa_kode_accrued = result.data['coa_kode_accrued'];
                        this.form.coa_nama_accrued = result.data['coa_nama_accrued'];

                        if (!this.form.is_detail) {
                            setTimeout(() => {
                                $('*[name="account"]').focus();
                            }, 100);
                        }

                    }

                },
                error => {
                    console.error('GetForm', error);
                    this.core.OpenNotif(error);
                }
            );

        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
        this.form.account = null;
        this.form.coa = null;
        this.form.coa_kode = null;
        this.form.coa_nama = null;

        this.CompanyFilter();
    }
    // => / END : AC Company

    /**
     * Account
     */
    Account: any;
    AccountFilter(type) {

        if(type == 0){
            var val = this.form.account;
        }
        else if(type == 1){
            var val = this.form.account_accrued;
        }

        if(val){
            val = val.toString().toLowerCase();

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
    }
    AccountSelect(e, item, type) {

        if (e.isUserInput) {

            if(type == 0){
                this.form.coa = item.id;
                this.form.coa_kode = item.kode;
                this.form.coa_nama = item.nama;
            }
            else if(type == 1){
                this.form.coa_accrued = item.id;
                this.form.coa_kode_accrued = item.kode;
                this.form.coa_nama_accrued = item.nama;
            }

        }
    }
    AccountOfRemove(type) {

        if(type == 0){
            this.form.account = null;
            this.form.coa = null;
            this.form.coa_kode = null;
            this.form.coa_nama = null;
        }
        else if(type == 1){
            this.form.account_accrued = null;
            this.form.coa_accrued = null;
            this.form.coa_kode_accrued = null;
            this.form.coa_nama_accrued = null;
        }

    }
    // => Account

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            setTimeout(() => {
                $('*[name="account"]').focus();
            }, 100);
        }
    }

    /**
     * Simpan
     */
    Simpan() {
        var URL = this.ComUrl + 'add_coa';
        if (this.form.id) {
            URL = this.ComUrl + 'edit_coa';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

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
    // => / END : Simpan

}
