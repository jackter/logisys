import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-iga',
    templateUrl: './form.html'
})
export class IGAFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    coaIsExist: boolean = false;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<IGAFormDialogComponent>
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;

        this.InitCOAFilter();

        if(this.form.id != 'add'){
            this.form.coa_persediaan_input = this.form.coa_kode_persediaan +' - '+this.form.coa_nama_persediaan;
            this.form.coa_beban_input = this.form.coa_kode_beban +' - '+this.form.coa_nama_beban;
            this.form.coa_penjualan_input = this.form.coa_kode_penjualan +' - '+this.form.coa_nama_penjualan;
            this.form.coa_disc_penjualan_input = this.form.coa_kode_disc_penjualan +' - '+this.form.coa_nama_disc_penjualan;
            this.form.coa_retur_penjualan_input = this.form.coa_kode_retur_penjualan +' - '+this.form.coa_nama_retur_penjualan;
            this.form.coa_retur_pembelian_input = this.form.coa_kode_retur_pembelian +' - '+this.form.coa_nama_retur_pembelian;
            this.form.coa_hpp_input = this.form.coa_kode_hpp +' - '+this.form.coa_nama_hpp;
            this.form.coa_accrued_input = this.form.coa_kode_accrued +' - '+this.form.coa_nama_accrued;
            
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
    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            setTimeout(() => {
                $('*[name="coa_persediaan"]').focus();
            }, 100);
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

        console.log(this.form);

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
               $('*[name="grup_nama"]').focus();
           }, 100);
           
       }
   }
   CompanyRemove() {
       this.form.company = null;
       this.form.company_nama = null;
       this.form.company_abbr = null;

       this.form.grup = null;
       this.form.grup_nama = null;

       this.Company = this.Default.company;

   }
   // => / END : AC Company

   /**
     * AC Grup
     */
    Grup: any = [];
    GrupFilter() {

        var val = this.form.grup_nama;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.grup) {

                var Combine = item.nama + ' : ' + item.kode + ')';
                if (
                    item.kode.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.Grup = Filtered;

        } else {
            this.Grup = this.Default.grup;
        }

    }
    GrupSelect(e, item) {
        if (e.isUserInput) {
            this.form.grup = item.id;
            this.form.grup_nama = item.nama;
            this.form.grup_kode = item.kode;

            setTimeout(() => {
                $('*[name="coa_persediaan"]').focus();
            }, 100);
        }
    }
    // => / END : AC Grup

    /**
     * AC Item
     */
    COA: any;
    WaitItem = false;
    InitCOAFilter() {
        let i = 0;
        let Filtered = [];
        for (let item of this.Default.coa) {

            if (this.form.company == item.company
            ) {
                Filtered[i] = item;
                this.coaIsExist = true;
                i++;
            }

        }
        this.COA = Filtered;
    }
    COAFilter(name) {

        var val = this.form.coa_persediaan_input;

        if (name == 'coa_beban') {
            val = this.form.coa_beban_input;
        }
        else if (name == 'coa_penjualan') {
            val = this.form.coa_penjualan_input;
        }
        else if (name == 'coa_disc_penjualan') {
            val = this.form.coa_disc_penjualan_input;
        }
        else if (name == 'coa_retur_penjualan') {
            val = this.form.coa_retur_penjualan_input;
        }
        else if (name == 'coa_retur_pembelian') {
            val = this.form.coa_retur_pembelian_input;
        }
        else if (name == 'coa_hpp') {
            val = this.form.coa_hpp_input;
        }
        else if (name == 'coa_accrued') {
            val = this.form.coa_accrued_input;
        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.coa) {
                if(this.form.company == item.company){
                    var Combine = item.nama + ' (' + item.kode + ')';
                    if (item.kode.toString().toLowerCase().indexOf(val) != -1 ||
                            item.nama.toString().toLowerCase().indexOf(val) != -1 ||
                            Combine.toString().toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        this.coaIsExist = true;
                        i++;
                    }
                }
            }
            this.COA = Filtered;

        }/*else{
            this.COA = this.Default.coa;
        }*/

    }
    COASelect(e, item, name) {
        if (e.isUserInput && name == 'coa_persediaan') {
            this.form.coa_persediaan_input = item.kode + ' - ' + item.nama;
            this.form.coa_persediaan = item.id;
            this.form.coa_kode_persediaan = item.kode;
            this.form.coa_nama_persediaan = item.nama;

            setTimeout(() => {
                $('*[name="coa_beban"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_beban') {
            this.form.coa_beban_input = item.kode + ' - ' + item.nama;
            this.form.coa_beban = item.id;
            this.form.coa_kode_beban = item.kode;
            this.form.coa_nama_beban = item.nama;

            setTimeout(() => {
                $('*[name="coa_penjualan"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_penjualan') {
            this.form.coa_penjualan_input = item.kode + ' - ' + item.nama;
            this.form.coa_penjualan = item.id;
            this.form.coa_kode_penjualan = item.kode;
            this.form.coa_nama_penjualan = item.nama;

            setTimeout(() => {
                $('*[name="coa_disc_penjualan"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_disc_penjualan') {
            this.form.coa_disc_penjualan_input = item.kode + ' - ' + item.nama;
            this.form.coa_disc_penjualan = item.id;
            this.form.coa_kode_disc_penjualan = item.kode;
            this.form.coa_nama_disc_penjualan = item.nama;

            setTimeout(() => {
                $('*[name="coa_retur_penjualan"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_retur_penjualan') {
            this.form.coa_retur_penjualan_input = item.kode + ' - ' + item.nama;
            this.form.coa_retur_penjualan = item.id;
            this.form.coa_kode_retur_penjualan = item.kode;
            this.form.coa_nama_retur_penjualan = item.nama;

            setTimeout(() => {
                $('*[name="coa_retur_pembelian"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_retur_pembelian') {
            this.form.coa_retur_pembelian_input = item.kode + ' - ' + item.nama;
            this.form.coa_retur_pembelian = item.id;
            this.form.coa_kode_retur_pembelian = item.kode;
            this.form.coa_nama_retur_pembelian = item.nama;

            setTimeout(() => {
                $('*[name="coa_hpp"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_hpp') {
            this.form.coa_hpp_input = item.kode + ' - ' + item.nama;
            this.form.coa_hpp = item.id;
            this.form.coa_kode_hpp = item.kode;
            this.form.coa_nama_hpp = item.nama;

            setTimeout(() => {
                $('*[name="coa_accrued"]').focus();
            }, 100);
        }
        else if (e.isUserInput && name == 'coa_accrued') {
            this.form.coa_accrued_input = item.kode + ' - ' + item.nama;
            this.form.coa_accrued = item.id;
            this.form.coa_kode_accrued = item.kode;
            this.form.coa_nama_accrued = item.nama;
        }
    }
    ClearInput(name) {
        if (name == 'coa_persediaan') {
            this.form.coa_persediaan_input = '';
            this.form.coa_persediaan = '';
            this.form.coa_kode_persediaan = '';
            this.form.coa_nama_persediaan = '';
        }
        else if (name == 'coa_beban') {
            this.form.coa_beban_input = '';
            this.form.coa_beban = '';
            this.form.coa_kode_beban = '';
            this.form.coa_nama_beban = '';
        }
        else if (name == 'coa_penjualan') {
            this.form.coa_penjualan_input = '';
            this.form.coa_penjualan = '';
            this.form.coa_kode_penjualan = '';
            this.form.coa_nama_penjualan = '';
        }
        else if (name == 'coa_disc_penjualan') {
            this.form.coa_disc_penjualan_input = '';
            this.form.coa_disc_penjualan = '';
            this.form.coa_kode_disc_penjualan = '';
            this.form.coa_nama_disc_penjualan = '';
        }
        else if (name == 'coa_retur_penjualan') {
            this.form.coa_retur_penjualan_input = '';
            this.form.coa_retur_penjualan = '';
            this.form.coa_kode_retur_penjualan = '';
            this.form.coa_nama_retur_penjualan = '';
        }
        else if (name == 'coa_retur_pembelian') {
            this.form.coa_retur_pembelian_input = '';
            this.form.coa_retur_pembelian = '';
            this.form.coa_kode_retur_pembelian = '';
            this.form.coa_nama_retur_pembelian = '';
        }
        else if (name == 'coa_hpp') {
            this.form.coa_hpp_input = '';
            this.form.coa_hpp = '';
            this.form.coa_kode_hpp = '';
            this.form.coa_nama_hpp = '';
        }
        else if (name == 'coa_accrued') {
            this.form.coa_accrued_input = '';
            this.form.coa_accrued = '';
            this.form.coa_kode_accrued = '';
            this.form.coa_nama_accrued = '';
        }
    }
    // => / END : AC Item

}