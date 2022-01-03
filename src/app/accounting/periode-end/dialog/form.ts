import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { Subscription, timer } from "rxjs";

@Component({
    selector: 'dialog-form-location',
    templateUrl: './form.html'
})
export class PeriodeEndFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    time;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<PeriodeEndFormDialogComponent>
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
        //=> / Check Company

        this.getTahun();

    }

    getDisplayTimer(time: number) {
        var hours = '' + Math.floor(time / 3600);
        var minutes = '' + Math.floor(time % 3600 / 60);
        var seconds = '' + Math.floor(time % 3600 % 60);


        if (Number(hours) < 10) {
            hours = '0' + hours;
        } else {
            hours = '' + hours;
        }
        if (Number(minutes) < 10) {
            minutes = '0' + minutes;
        } else {
            minutes = '' + minutes;
        }
        if (Number(seconds) < 10) {
            seconds = '0' + seconds;
        } else {
            seconds = '' + seconds;
        }

        return {
            hours: hours ,
            minutes: minutes ,
            seconds: seconds
        };
    }

    Tahun = [];

    Bulan = [
        { bulan: 'January', nilai: '01' },
        { bulan: 'February', nilai: '02' },
        { bulan: 'March', nilai: '03' },
        { bulan: 'April', nilai: '04' },
        { bulan: 'Mey', nilai: '05' },
        { bulan: 'June', nilai: '06' },
        { bulan: 'July', nilai: '07' },
        { bulan: 'August', nilai: '08' },
        { bulan: 'September', nilai: '09' },
        { bulan: 'October', nilai: '10' },
        { bulan: 'November', nilai: '11' },
        { bulan: 'December', nilai: '12' }
    ];

    getTahun() {

        var Tahun = 2018;
        var range = [];

        range.push(Tahun);

        for (var i = 1; i < 30; i++) {
            range.push(Tahun + i);
        }

        this.Tahun = range;

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

            this.CompanyLast = item.nama;

            setTimeout(() => {
                $('*[name="year"]').focus();
            }, 100);
        }
    }

    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.Company = this.Default.company;
    }
    //=> / END : AC Company

    subscription: Subscription;

    /**
     * Simpan
     */
    Simpan() {

        this.form.tgl = moment(this.form.year + "-" + this.form.month + "-01", "YYYY-MM-DD").endOf('month').format("YYYY-MM-DD");

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.form.notimeout = 1;

        this.Busy = true;
        this.subscription = timer(0, 1000).subscribe((n) => {
            this.time = this.getDisplayTimer(n);       
        });

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

                console.error('Process', error);

                var Alert = {
                    msg: 'Error'
                };
                this.core.OpenAlert(Alert);
            }
        );

    }
    //=> / END : Simpan

}
