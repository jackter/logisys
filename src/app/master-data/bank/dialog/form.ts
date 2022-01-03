import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { BroadcasterService } from 'ng-broadcaster';
import swal from 'sweetalert2';

@Component({
    selector: 'app-bank-form-dialog',
    templateUrl: './form.html',
})

export class BankDialogFormComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    Bank: any = {};
    COA: any = {};

    ComUrl;
    Com;
    Busy;

    Company: any = [];
    CompanyLast;

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<BankDialogFormComponent>,
        private dialog: MatDialog,
        private broadcaster: BroadcasterService
    ) { }

    ngOnInit(): void {
        this.Company = this.Default.company;
        this.Bank = this.Default.bank;
        this.COA = this.Default.coa;

        if (this.form.id != 'add') {
            this.form.coa_input = this.form.coa_kode + " - " + this.form.coa_nama;
            if (this.form.cash == 0) {
                this.form.cash = false;
            }
            else {
                this.form.cash = true;
            }
        }
    }

    Edit(): void {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    /*AC Company*/
    CompanyFilter(val): void {
        var val = this.form.company_nama;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            const Filtered = [];
            for (const item of this.Default.company) {
                const Combine = item.nama + '(' + item.abbr + ')';

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

    CompanySelect(e, item): void {
        if (e.isUserInput) {
            setTimeout(() => {

                this.form.company = item.id;
                this.form.company_nama = item.nama;
                this.form.company_abbr = item.abbr;
                this.form.nama_rekening = item.nama;

                this.InitCOAFilter();

                setTimeout(() => {
                    $('*[name="bank_nama"]').focus();
                }, 100);

            }, 100);
        }

    }
    //=> / END : AC Company

    /*AC Bank*/
    BankFilter(val) {

        var val = this.form.bank_nama;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            const Filtered = [];

            for (const item of this.Default.bank) {
                const Combine = item.nama + '(' + item.currency + ')';

                if (
                    item.currency.toLowerCase().indexOf(val) != -1 ||
                    item.nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }
            this.Bank = Filtered;
        } else {
            this.Bank = this.Default.bank;
        }
    }
    BankSelect(e, item): void {
        if (e.isUserInput) {
            setTimeout(() => {

                this.form.bank = item.id;
                this.form.bank_kode = item.kode;
                this.form.bank_nama = item.nama;
                this.form.currency = item.currency;

                setTimeout(() => {
                    $('*[name="coa_input"]').focus();
                }, 100);

            }, 100);
        }
    }
    ClearBank() {
        this.form.bank = null;
        this.form.bank_kode = null;
        this.form.bank_nama = null;
        this.form.currency = null;
    }
    //=> / END : AC Bank

    /**
     * AC Item
     */
    // COA: any;
    // WaitItem = false;
    InitCOAFilter() {
        let i = 0;
        let Filtered = [];
        for (let item of this.Default.coa) {

            if (this.form.company == item.company) {
                Filtered[i] = item;
                i++;
            }

        }
        this.COA = Filtered;
    }
    COAFilter(name) {

        var val = this.form.coa_input;

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];

            for (let item of this.Default.coa) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    (item.kode.toString().toLowerCase().indexOf(val) != -1 ||
                        item.nama.toString().toLowerCase().indexOf(val) != -1 ||
                        Combine.toString().toLowerCase().indexOf(val) != -1) && this.form.company == item.company
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.COA = Filtered;

        } else {
            this.InitCOAFilter();
        }

    }
    COASelect(e, item) {
        if (e.isUserInput) {
            this.form.coa_input = item.kode + ' - ' + item.nama;
            this.form.coa = item.id;
            this.form.coa_kode = item.kode;
            this.form.coa_nama = item.nama;
        }
    }
    ClearCOA() {
        this.form.coa_input = null;
        this.form.coa = null;
        this.form.coa_kode = null;
        this.form.coa_nama = null;
    }
    //=> / END : AC Item

    /*Simpan*/
    Save(): void {
        swal(
            {
                title: 'Apakah Anda Yakin!',
                html: '<div>Simpan Data?</div><div><small><strong>' + this.form.bank_nama + " (" + this.form.nama_rekening + ")" + '</strong></small></div>',
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
                    if (!this.form.cash) {
                        this.form.cash = 0;
                    }
                    else {
                        this.form.cash = 1;
                    }

                    let URL = this.ComUrl + 'edit';

                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.broadcaster.broadcast('reload', true);
                                this.form.is_detail = true;

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
            }
        );
    }

}
