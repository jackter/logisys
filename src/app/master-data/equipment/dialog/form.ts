import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-equipment',
    templateUrl: './form.html'
})
export class EquipmentFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<EquipmentFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Company = this.Default.company;   

    }

    /**
     * Edit
     */
    Edit() {
        this.form.is_detail = null;
    }
    // => / END : Edit */

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLast;
    CompanyFilter(val) {
        var val = this.form.company_nama;

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

            setTimeout(() => {
                $('*[name="wo_location_nama"]').focus();
            }, 100);
        }
    }
    CompanyRemove(){
        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;

        this.form.wo_location = null;
        this.form.wo_location_nama = null;

        this.Company = this.Default.company;

    }
    // => END : AC Company


    /**
     * AC Lokcations
     */
    Locations: any = [];
    LocationsFilter(val){
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list.locations', Params).subscribe(
                result => {
                    if (result.locations) {
                        this.Locations = result.locations;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }
    LocationsSelect(e, item){
        if(e.isUserInput){
            this.form.wo_location = item.id;

            setTimeout(() => {
                $('*[name="kode"]').focus();
            }, 100);
        }
    }
    LocationsRemove(){
        this.form.wo_location = null;
        this.form.wo_location_nama = null;

        this.LocationsFilter('');
    }
    // => END : AC Locations

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
                    this.Busy = false;

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
