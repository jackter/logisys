import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'dialog-form-kontraktor',
    templateUrl: './form.html'
})
export class KontraktorFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<KontraktorFormDialogComponent>
    ) {

    }

    ngOnInit() {
        this.Jenis = this.Default.jenis;

        if (this.Default.kabkota) {
            this.Kabkota = this.Default.kabkota;
        }

        if (this.Default.provinsi) {
            this.Provinsi = this.Default.provinsi;
        }
    }

    /**
     * Edit
     */
    Edit() {
        this.form.is_detail = null;

        this.FocusTo('[name="nama"]');
    }
    // => / END : Edit */

    /**
     * Focus to
     */
    FocusTo(target = null) {
        if (target) {

            setTimeout(() => {
                $(target).focus();
            }, 250);

        }
    }
    // => / END : Focus To */

    /**
     * AC Jenis
     */
    Jenis: any = [];
    JenisFilter(val) {

        var val = this.form.jenis;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            if (this.Default.jenis) {
                for (let item of this.Default.jenis) {
                    if (
                        item &&
                        item.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }
                }
            }
            this.Jenis = Filtered;
        } else {
            this.Jenis = this.Default.jenis;
        }
    }

    JenisSelect(e, item) {
        if (e.isUserInput) {
            this.form.jenis = item;
            this.form.jenis_show = 1;

            setTimeout(() => {
                $('*[name="alamat"]').focus();
            }, 100);
        }
    }
    // => / END : AC Jenis

    /**
     * AC Kabkota
     */
    Kabkota: any = [];
    KabkotaFilter(val) {

        var val = this.form.kabkota;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            if (this.Default.kabkota) {
                for (let item of this.Default.kabkota) {
                    if (
                        item &&
                        item.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }
                }
            }
            this.Kabkota = Filtered;
        } else {
            this.Kabkota = this.Default.kabkota;
        }
    }

    KabkotaSelect(e, item) {
        if (e.isUserInput) {
            this.form.kabkota = item;
            this.form.kabkota_show = 1;

            setTimeout(() => {
                $('*[name="provinsi"]').focus();
            }, 100);
        }
    }
    // => / END : AC Kabkota

    /**
     * AC Provinsi
     */
    Provinsi: any = [];
    ProvinsiFilter(val) {

        var val = this.form.provinsi;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            if (this.Default.provinsi) {
                for (let item of this.Default.provinsi) {
                    if (
                        item &&
                        item.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }
                }
            }
            this.Provinsi = Filtered;
        } else {
            this.Provinsi = this.Default.provinsi;
        }
    }
    
    ProvinsiSelect(e, item) {
        if (e.isUserInput) {
            this.form.provinsi = item;
            this.form.provinsi_show = 1;

            setTimeout(() => {
                $('*[name="declaration"]').focus();
            }, 100);
        }
    }
    // => / END : AC Provinsi

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

                    this.core.Sharing('reload', 'reload');

                    if (this.form.id == 'add') {
                        this.dialogRef.close(result);
                    } else {
                        this.form.is_detail = true;
                        this.Busy = false;
                    }
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
