import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-tax',
    templateUrl: './form.html'
})

export class TaxDialogFormComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;


    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<TaxDialogFormComponent>,
        private broadcaster: BroadcasterService
    ) { }

    ngOnInit(): void {
        this.Company = this.Default.company;
        this.Coa = this.Default.coa;

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
   }
   // => / END : AC Company

    /*AC COA */
    Coa: any;
    CoaFilter(val: string): void {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            const Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company
            };

            this.core.Do(this.ComUrl + 'list_coa', Params).subscribe(
                result => {
                    if (result) {
                        this.Coa = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }

    CoaSelect(e, item): void {
        if (e.isUserInput) {
            this.form.coa = item.id;
            this.form.coa_kode = item.kode;
            this.form.coa_nama = item.nama;

            setTimeout(() => {
                $('*[name="coa_nama"]').focus();
            }, 100);
        }
    }

    /*Edit*/
    Edit(): void {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    /*Simpan*/
    Save(): void {
        let URL = this.ComUrl + 'edit';

        if (this.form.id === 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {
                if (result.status === 1) {
                    this.dialogRef.close(result);
                } else {
                    this.Busy = false;

                    const Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);
                }
            },
            error => {
                this.Busy = false;
                console.error('Save', error);
            }
        );
    }
}
