import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-vehicle',
    templateUrl: './form.html'
})
export class VehicleFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<VehicleFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;

        /*Check Company
         * Jika Company hanya 1, maka system akan melakukan Autoselect
         * dan Mematikan fungsi Auto Complete*/
        if (this.Company) {
            this.CompanyLen = Object.keys(this.Company).length;
            if (this.CompanyLen == 1) {
                this.form.company = this.Company[0].id;
                this.form.company_abbr = this.Company[0].abbr;
                this.form.company_nama = this.Company[0].nama;
            }
        }

        /*Form Edit*/
        if (this.form.id != 'add') {

            var FCompany: any = _.find(this.Company, {
                nama: this.form.company_nama,
                id: this.form.company
            });
        }

    }

    /*AC Company*/
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
                $('*[name="vgrup_nama"]').focus();
            }, 100);
        }
    }

    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.CompanyFilter();
    }
    //=> END : AC Company

    /**
     * AC Tipe Vehicle
     */
    Vehicle: any = [];
    VehicleFilter(val: string) {

        val = this.form.vgrup_nama;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.vehicle) {

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
            this.Vehicle = Filtered;
        } else {
            this.Vehicle = this.Default.vehicle;
        }

    }

    VehicleSelect(e, item) {

        if (e.isUserInput) {

            setTimeout(() => {

                this.form.vgrup = item.id;
                this.form.vgrup_abbr = item.abbr;
                this.form.vgrup_nama = item.nama;

                this.Vehicle = this.Default.vehicle;

                setTimeout(() => {
                    $('*[name="keterangan"]').focus();
                }, 100);

            }, 0);

        }
    }

    VehicleRemove() {

        this.form.vgrup = null;
        this.form.vgrup_abbr = null;
        this.form.vgrup_nama = null;

    }
    // => End : Tipe Vehicle

    /**
    * Simpan
    */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {
                    this.dialogRef.close(result);
                } else {
                    const Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);
                }
            },
            error => {
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Simpan

    /**
     * Edit
     */
    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }
    //=> END : Edit
}