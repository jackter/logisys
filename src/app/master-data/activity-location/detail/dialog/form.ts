import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-activity-location-detail',
    templateUrl: './form.html'
})
export class ActivityLocationDetailFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    
    ComUrl;
    Com;
    Busy;

    DetailID;
    Company: any = [];
    DocTrx: any = [];

    Delay;
    Data;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        private dialogRef: MatDialogRef<ActivityLocationDetailFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;
        this.DocTrx = this.Default.trx_type;
        this.COA = this.Default.coa;

        if(this.form.company){
            var i = 0
            for(let item of this.Company){
                if(item.id == this.form.company){
                    this.form.company_abbr = this.Company[i].abbr;
                    this.form.company_nama = this.Company[i].nama;
                }
                i++
            }
        }

        if(this.form.doc_id){
            var i = 0
            for(let item of this.DocTrx){
                if(item.id == this.form.doc_id){
                    this.form.doc_source = this.DocTrx[i].doc_source;
                    this.form.doc_nama = this.DocTrx[i].doc_nama;
                }
                i++
            }
        }

        if (this.form.id != 'add') {
            this.form.coa_name = this.form.coa_kode + ' - ' + this.form.coa_nama
        }

    }

    /**
     * AC COA
     */
    COA: any = {};
    COAFilter(val: string) {

        if(val){
            
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            
            for (let item of this.Default.coa) {

                var Combine = item.nama + ' (' + item.kode + ')';

                if (Combine.toLowerCase().indexOf(val) != -1){
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

        }

    }
    COARemove() {

        this.form.coa = null;
        this.form.coa_kode = null;
        this.form.coa_nama = null;
        this.form.coa_name = null;

    }
    // => End AC COA

    /**
     * Simpan
     */
    Simpan() {

        swal(
            {
                title: 'Apakah Anda Yakin!',
                html: '<div>Simpan Data?',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {
                if (result.value) {

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }                    
                    
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
    Edit(){
        if(this.form.is_detail){
            this.form.is_detail = null;
        }
    }
    //=> END : Edit

}