import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-location',
    templateUrl: './form.html'
})
export class LocationFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    def_sounding = "0";

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<LocationFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;
        this.Product = this.Default.product;

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

        if(this.form.id != 'add'){
            this.CompanyLast = this.form.company_nama;
        }
        else{
            this.form.sounding = "0";
        }        

    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter(val) {

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
                $('*[name="grup_nama"]').focus();
            }, 100);
        }
    }
    // => / END : AC Company

    /**
     * Product
     */
    Product: any = [];
    ProductFilter(val) {
        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.product) {

                if (
                    item.nama.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Product = Filtered;

        } else {
            this.Product = this.Default.product;
        }
    }
    ProductSelect(e, item) {
        if (e.isUserInput) {

            this.form.prod_id = item.id;

            setTimeout(() => {
                $('*[name="meja_ukur"]').focus();
            }, 100);

        }

    }
    ProductRemove() {

        this.form.prod_id = null;
        this.form.product = null;

        this.Product = this.Default.product;
    }
    // => ENd Product

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

    /**
     * SetSTKode
     */
    SetSTKode(kode) {
        this.form.kategori_kode = kode.toUpperCase();
        $('*[name="nama"]').focus();
    }
    // => / END : SetSTKode

}
