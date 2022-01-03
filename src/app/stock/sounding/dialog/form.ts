import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as _ from 'lodash';
import { SoundingPrintFormDialogComponent } from './print';

@Component({
    selector: 'dialog-form-sounding',
    templateUrl: './form.html'
})
export class SoundingFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    List: any[] = [];
    Calibrate: any = [];
    Fraksi: any = [];
    Density: any = [];

    ComUrl;
    Com;
    Busy;

    Delay;
    // minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString(); 
    minDate;
    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<SoundingFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Density = this.Default.density;

        for(let item of this.Density){
            item.suhu = Number(item.suhu);
        }

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

        if(this.form.id == 'add'){
            /**
             * Define min date
             */
            var Day = moment(this.maxDate).isSameOrBefore(this.form.last_tanggal, 'day');
            if(Day){
                this.minDate = moment(this.form.last_tanggal).format('YYYY-MM-DD').toString();;
                this.form.tanggal = this.maxDate;
            }
            //=> / END : Define min date
        }

        if(this.form.id != 'add') {
            var ListStoreloc = _.filter(this.Default.storeloc, {
                company: this.form.company
            });
            this.Calibrate = this.Default.calibrate;
            this.Fraksi = this.Default.fraksi;

            this.List = JSON.parse(JSON.stringify(ListStoreloc));

            for(let item of this.List) {

                for(let detail of this.form.list) {

                    if (detail.id == item.id) {
                        item.temp = detail.temp;
                        item.tinggi = detail.tinggi;
                        item.tinggi_meja = detail.tinggi_meja;
                        item.tabel = detail.tabel;
                        item.density = detail.density;
                        item.faktor_koreksi = detail.faktor_koreksi;
                        item.volume = detail.volume;
                        item.weight = detail.weight;
                        item.remarks = detail.remarks;
                    }
                }

                this.calcLevel(item, true);
            }            
        }
    }

    rupiah(val, dec = 0, force = false){
        if(val){
            return this.core.rupiah(val, dec, force);
        }else{
            return '-';
        }
    }

    focusToRemarks(){
        setTimeout(() => {
            $('*[name="remarks"]').focus();
        }, 100);
    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter(val) {
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

        this.List = [];

        if (e.isUserInput) {
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            this.CompanyLast = item.nama;

            this.core.ShowLoader();
            setTimeout(() => {
                
                // this.List = this.core.FJSON(this.Default.storeloc, 'company', this.form.company);
                var ListStoreloc = _.filter(this.Default.storeloc, {
                    company: this.form.company
                });
                this.Calibrate = _.filter(this.Default.calibrate,{
                    company: this.form.company
                });
                this.Fraksi = _.filter(this.Default.fraksi,{
                    company: this.form.company
                });

                this.List = JSON.parse(JSON.stringify(ListStoreloc));

                /**
                 * Reset Calc
                 */
                for(let item of this.List){
                    this.calcLevel(item, true);
                }
                //=> / END : Reset Calc

                this.core.HideLoader();
                setTimeout(() => {
                    if(!this.form.tanggal){
                        $('*[name="tanggal"]').focus();
                    }else{
                        $('*[name="remarks"]').focus();
                    }
                }, 100);
            }, 100);

        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        // this.StorelocRemove();
    }
    // => / END : AC Company

    delayLevel;
    calcLevel(item, startup = false) {

        var Time = 0;
        if(!startup){
            clearTimeout(this.delayLevel);
            Time = 300;
        }
        this.delayLevel = setTimeout(() => {

            if(
                item.tinggi <= 0 || 
                item.temp <= 0 || 
                !item.tinggi || 
                !item.temp
            ){
                item.weight = 0;
                item.density = 0;
                item.volume = 0;
                item.tinggi_meja = 0;
                
                return false;
            }

            var FindCalibrate = _.filter(this.Calibrate, {
                storeloc: item.id
            });           

            var Highest = _.orderBy(JSON.parse(JSON.stringify(FindCalibrate)), ['high'], ['desc']);

            /**
             * Find Max Tinggi
             */
            if(Highest[0].high < (Number(item.meja_ukur) + Number(item.tinggi))){
                item.tinggi = Highest[0].high - Number(item.meja_ukur);

                this.calcLevel(item);
                return false;
            }
            //=> / END : Find Max Tinggi

            item.tinggi_meja = Number(item.meja_ukur) + Number(item.tinggi);

            var point = Math.round((Number(item.tinggi_meja) - Math.floor(Number(item.tinggi_meja))) * 10);
            // if(point === 0){
            //     point = 10;
            // }

            var tinggi_meja = Math.round((Number(item.tinggi_meja)));
            
            var FindCalibrateStore = _.find(FindCalibrate, {
                high: parseInt(item.tinggi_meja, 10)
            });

            // var diff: number = FindCalibrateStore['diff'];
            var tabel: number = FindCalibrateStore['volume'];
            
            var FindFraksi = _.filter(this.Fraksi, {
                storeloc: item.id
            }); 
            var FindFraksiStore = _.find(_.filter(FindFraksi, function(o) {
                return o.cm_from < tinggi_meja && o.cm_to > tinggi_meja
            }), {
                mm : point
            });
            
            // var diff_fraksi: number = (point / 10) * diff;
            var diff_fraksi: number = 0;
            if (typeof FindFraksiStore !== 'undefined'){
                diff_fraksi = FindFraksiStore['liter'];
            }            
            
            var vol_ltr: number = (Number(tabel) + Number(diff_fraksi));              

            item.fraksi = diff_fraksi;
            item.tabel = FindCalibrateStore['volume'];
            item.volume = vol_ltr * item.faktor_koreksi;

            var FindDensity = _.find(this.Density, {
                company: item.company,
                produk: item.produk,
                suhu: item.temp,
            });

            if(FindDensity){
                item.density = FindDensity['density'];
                if(item.density){
                    item.weight = item.volume * item.density;
                }
                else{
                    item.weight = 0;
                }
            }else{
                item.weight = 0;
            }


            if(item.temp){
                this.calcDensity(item);
            }

        }, Time);

    }

    delayDensity;
    calcDensity(item) {

        clearTimeout(this.delayDensity);
        this.delayDensity = setTimeout(() => {

            if(item.tinggi <= 0 || item.temp <= 0){
                item.weight = 0;
                item.density = 0;
                return false;
            }

            var FindDensity = _.find(this.Density, {
                company: item.company,
                produk: item.produk,
                suhu: item.temp,
            });

            var Highest = _.orderBy(JSON.parse(JSON.stringify(_.filter(this.Density, {
                company: item.company,
                produk: item.produk
            }))), ['suhu'], ['desc']);

            /**
             * Find Max Temp
             */
            if(Highest[0].suhu < item.temp){
                item.temp = Highest[0].suhu;

                this.calcDensity(item);
                return false;
            }
            //=> / END : Find Max Temp

            item.faktor_koreksi = 1+0.0000348*(Number(item.temp) - Number(item.suhu));
            
            if(FindDensity){
                item.density = FindDensity['density'];        
                item.tinggi_meja = Number(item.meja_ukur) + Number(item.tinggi);

                var FindCalibrate = _.filter(this.Calibrate, {
                    storeloc: item.id
                });

                var point = Math.round((Number(item.tinggi_meja) - Math.floor(Number(item.tinggi_meja))) * 10);
                // if(point === 0){
                //     point = 10;
                // }

                var FindCalibrateStore = _.find(FindCalibrate, {
                    high: parseInt(item.tinggi_meja, 10)
                });

                var tinggi_meja = Math.round((Number(item.tinggi_meja)));

                var FindFraksi = _.filter(this.Fraksi, {
                    storeloc: item.id
                }); 
                var FindFraksiStore = _.find(_.filter(FindFraksi, function(o) {
                    return o.cm_from < tinggi_meja && o.cm_to > tinggi_meja
                }), {
                    mm : point
                });

                // var diff: number = FindCalibrateStore['diff'];
                var tabel: number = FindCalibrateStore['volume'];
                // var diff_fraksi: number = (point / 10) * diff;
                // var vol_ltr: number = Number(tabel) + Number(diff_fraksi);

                var diff_fraksi: number = 0;
                if (typeof FindFraksiStore !== 'undefined'){
                    diff_fraksi = FindFraksiStore['liter'];
                }  

                var vol_ltr: number = Number(tabel) + Number(diff_fraksi);  
                
                item.fraksi = diff_fraksi;
                item.tabel = FindCalibrateStore['volume'];
                item.volume = vol_ltr * item.faktor_koreksi;
                // item.volume = vol_ltr;
                item.weight = item.volume * item.density;

            }else{
                item.density = 0;
                item.weight = 0;
            }

        }, 300);
    }

    calcTinggi(item) {
        
        clearTimeout(this.delayDensity);
        this.delayDensity = setTimeout(() => {
            item.tinggi = item.tinggi_meja - item.meja_ukur;

            this.calcLevel(item);
        }, 300);
    }

    /**
     * Simpan
     */
    Simpan() {
        swal(
            {
                title: 'Please Confirm to Submit?',
                html: '<div>Are you sure to continue?</div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    if(this.form.tanggal) {
                        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
                    }

                    this.form.list = JSON.stringify(this.List);

                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.dialogRef.close(result);
                            } else {
                                var Alert = {
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
            }
        );
    }
    // => / END : Simpan

    /**
     * Edit
     */
    Edit() {
        this.form.is_detail = null;
    }
    //=> END : Edit

    /**
     * Approve
     */
    Approve() {
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
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
                        notimeout: 1
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
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
    }
    // => / END : Approve

    /**
     * Open Print
     */
    PrintRef: MatDialogRef<SoundingPrintFormDialogComponent>;
    PrintRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    WaitPrint: boolean;

    ShowPrintDialog() {
        this.WaitPrint = true;

        this.PrintRef = this.dialog.open(
            SoundingPrintFormDialogComponent,
            this.PrintRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.PrintRef.componentInstance.Default = this.Default;
        this.PrintRef.componentInstance.Com = this.Com;
        this.PrintRef.componentInstance.form = this.form;
        this.PrintRef.componentInstance.List = this.List;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.PrintRef.afterClosed().subscribe(result => {

            this.PrintRef = null;

        });
        //=> / END : After Dialog Close

        this.WaitPrint = false;

    }
    //=> END Open Print
}