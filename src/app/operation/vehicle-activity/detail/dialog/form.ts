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
export class VehicleActivityDetailFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    
    ComUrl;
    Com;
    Busy;

    DetailID;

    Delay;
    Data;

    minDate;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<VehicleActivityDetailFormDialogComponent>

    ) {


    }

    ngOnInit() {

        if(this.Default.coa){
            this.COA = this.Default.coa;
        }
        if(this.Default.tipe){
            this.TIPE = this.Default.tipe;
        }

        if (this.form.id == 'add') {
            this.form.tanggal = moment(new Date).format('YYYY-MM-DD');
        }
    }

    /**
     * Check Value
     */
    CheckValue(val) {

        clearTimeout(this.Delay); 
        this.Delay = setTimeout(() => {

            if(val == 'waktu_start') {

                var TODAY = moment(this.form.tanggal).format('YYYY-MM-DD');
                var CHECK = moment(this.Data.tanggal).format('YYYY-MM-DD');

                if (TODAY == CHECK) {
                    
                    var WAKTU = moment(this.form.waktu_start, 'HH:mm').format('HH:mm');
                    var MIN_WAKTU = moment(this.Data.waktu_end, 'HH:mm:ss').format('HH:mm');
                    
                    if (WAKTU < MIN_WAKTU) {
        
                        this.form.waktu_start = MIN_WAKTU;
                    }
                }
            }

            if(val == 'jarak_start') {

                var MIN_JARAK = Number(this.Data.jarak_end);

                if (this.form.jarak_start < this.Data.jarak_end) {
    
                    this.form.jarak_start = MIN_JARAK;
                }
            }

        }, 300);

    }
    //=> END : Check Value

    /**
     * AC COA
     */
    COA: any = {};
    COAFilter(val: string) {

        val = this.form.coa_nama;

        if(val){
            
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.coa) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.COA = Filtered;
        } else {
            this.COA = this.Default.coa;
        }

    }
    COASelect(e, item) {

        if (e.isUserInput) {

            this.form.coa = item.id;
            this.form.coa_kode = item.kode;
            this.form.coa_nama = item.nama;

            setTimeout(() => {
                $('*[name="muatan_nama"]').focus();
            }, 100);

        }
    }
    COARemove() {
        this.form.coa = null;
        this.form.coa_kode = null;
        this.form.coa_nama = null;
    }
    // => End AC COA

    /**
     * AC COA
     */
    TIPE: any = {};
    TipeFilter(val: string) {

        val = this.form.muatan_nama;

        if(val){
            
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.tipe) {

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
            this.TIPE = Filtered;
        } else {
            this.TIPE = this.Default.tipe;
        }

    }
    TipeSelect(e, item) {

        if (e.isUserInput) {

            this.form.muatan = item.id;
            this.form.muatan_abbr = item.abbr;
            this.form.muatan_nama = item.nama;
            this.form.uom = item.uom;

            setTimeout(() => {
                $('*[name="qty"]').focus();
            }, 100);

        }
    }
    TipeRemove() {
        this.form.muatan = null;
        this.form.muatan_abbr = null;
        this.form.muatan_nama = null;
        this.form.uom = null;
    }
    // => End AC COA

         /**
     * Simpan
     */
    Simpan() {

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        if(this.form.tanggal) {
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');
        }

        /**
         * Hitung Waktu
         */
        var WSTART = moment(this.form.waktu_start, 'HH:mm').format('HH:mm:ss');
        var WEND = moment(this.form.waktu_end, 'HH:mm').format('HH:mm:ss');
        var TOTAL_WAKTU = Number(moment(WEND, 'HH:mm').diff(moment(WSTART, 'HH:mm'), 'minutes')) / 60;
        //=> END : Hitung Waktu

        var JSTART = Number(this.form.jarak_start);
        var JEND = Number(this.form.jarak_end);
        var TOTAL_JARAK = JEND - JSTART;

        this.form.waktu_start_send = WSTART;
        this.form.waktu_end_send = WEND;
        this.form.total_waktu = TOTAL_WAKTU;
        this.form.jarak_start_send = JSTART;
        this.form.jarak_end_send = JEND;
        this.form.total_jarak = TOTAL_JARAK;

        this.form.company = this.Default.data.company;
        this.form.company_abbr = this.Default.data.company_abbr;
        this.form.company_nama = this.Default.data.company_nama;
        this.form.vehicle = this.Default.data.id;
        this.form.vgrup = this.Default.data.vgrup;
        this.form.vgrup_abbr = this.Default.data.vgrup_abbr;
        this.form.vgrup_nama = this.Default.data.vgrup_nama;
        
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
    Edit(){
        if(this.form.is_detail){
            this.form.is_detail = null;
        }
    }
    //=> END : Edit

    /**
     * Approve
     */
    Approve(){
        swal({
            title: 'Please Confirm to Approve?',
            html: '<div>This action cannot be undone?</div>',
            type: 'success',
            reverseButtons      : true,
            focusCancel         : true,
            showCancelButton    : true,
            confirmButtonText   : 'Approve',
            cancelButtonText    : 'Cancel'
        }).then(
            result => {

                if(result.value){

                    var Params = {
                        id: this.form.id,
                        notimeout: 1
                    }

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'approve', Params).subscribe(
                        result => {

                            if(result.status == 1){

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Approved',
                                    msg: 'Approve Success!'
                                }
                                this.core.OpenAlert(Success);

                                this.dialogRef.close(result);

                            }else{
                                var Alert = {
                                    msg: result.error_msg
                                }
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
    //=> / END : Approve

}