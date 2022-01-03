import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';

type AOA = any[][];

@Component({
    selector: 'app-import-jv',
    templateUrl: './import.html',
    styleUrls: [
        '../journal-entry.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class ImportJVDialogComponent implements OnInit {

    form: any = {};
    Default: any = {};
    perm;

    Data: any = [];
    ComUrl;
    Busy: boolean;

    ReadySave: boolean;

    maxDate;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<ImportJVDialogComponent>
    ) { }

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

            this.LoadCOA();
        }
        // => / Check Company
    }

    FocusCompany() {
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 100);
    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyFilter() {

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

            this.LoadCOA();

            setTimeout(() => {
                $('*[name="ref_type"]').focus();
            }, 100);
        }
    }

    CompanyRemove() {
        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;

        this.Data = [];
    }
    // => / END : AC Company

    LoadCOA() {
        var Params = {
            NoLoader: 1,
            company: this.form.company
        };

        this.core.Do(this.ComUrl + 'list.coa', Params).subscribe(
            result => {

                if (result.coa) {
                    this.Default.coa = JSON.parse(JSON.stringify(result.coa));
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );
    }

    /**
     * Uploader
     */
    DataAOA: AOA = [];
    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    fileName: string = 'Template.xlsx';
    onFileChange(evt: any) {

        swal({
            title: 'Upload Data Journal Voucher?',
            html: '<div>Apakah Anda yakin Upload Data Journal Voucher?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yakin',
            cancelButtonText: 'Batal',
            width: 500
        }).then(
            result => {

                if (result.value) {
                    this.core.ShowLoader();

                    setTimeout(() => {
                        this.execFileChange(evt);
                    }, 1000);
                }

            }

        );

    }
    execFileChange(evt: any) {
        /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {

            this.Data = [];

            setTimeout(() => {

                /* read workbook */
                const bstr: string = e.target.result;
                const wb: XLSX.WorkBook = XLSX.read(bstr, {
                    type: 'binary',
                    cellDates: true,
                    dateNF: 'yyyy/mm/dd;@'
                });

                /* grab first sheet */
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                /* save data */
                this.DataAOA = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));

                /**
                 * Format Data Grid
                 */
                var Format: any[] = [];

                var DataNew = Object.values(this.DataAOA);
                delete DataNew[0];

                for (let item of DataNew) {
                    if (item) {
                        var coa = _.find(this.Default.coa, {
                            kode: item[2]
                        });

                        if (item[3] || item[4]) {
                            Format.push({
                                nomor: item[0],
                                tanggal: moment(item[1]).add(1, 'days').format('YYYY-MM-DD'),
                                status: coa ? 1 : 0,
                                coa: coa ? coa.id : '',
                                coa_kode: coa ? coa.kode : '',
                                coa_nama: coa ? coa.nama : '',
                                debit: item[3],
                                credit: item[4],
                                keterangan: item[5]
                            });
                        }
                    }
                }

                var GroupNomor = Object.values(_.groupBy(Format, 'nomor'));

                var False = 0;
                for (let item of GroupNomor) {

                    var TotalDebit = _.sumBy(item, 'debit');
                    var TotalCredit = _.sumBy(item, 'credit');

                    var Selisih = 0;
                    if (TotalDebit != TotalCredit) {
                        Selisih = 1;
                        this.ReadySave = false;
                    } else {
                        for (let detail of item) {
                            if (detail.status != 1) {
                                False += 1;
                            }
                        }
                        if (False > 0) {
                            this.ReadySave = false;
                        } else {
                            this.ReadySave = true;
                        }
                    }

                    this.Data.push({
                        nomor: item[0].nomor,
                        tanggal: item[0].tanggal,
                        company: this.form.company,
                        company_abbr: this.form.company_abbr,
                        company_nama: this.form.company_nama,
                        detail: item,
                        total_debit: TotalDebit,
                        total_credit: TotalCredit,
                        selisih: Selisih
                    });
                }

                setTimeout(() => {
                    this.core.HideLoader();
                }, 1000);
            }, 100);
        };
        reader.readAsBinaryString(target.files[0]);
    }
    // => / END: Uploader

    date_indo(val) {
        if (val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

    rupiah(val) {
        if (val) {
            return this.core.rupiah(val, 0, true);
        }
    }

    /**
     * Simpan
     */
    Submit() {

        swal(
            {
                title: 'Mohon Konfirmasi?',
                html: '<div>Apakah Anda yakin Import data Journal Voucher?</div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yakin',
                cancelButtonText: 'Batal',
                width: 500
            }
        ).then(
            result => {
                if (result.value) {
                    this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

                    for (let item of this.Data) {
                        item.detail_send = JSON.stringify(item.detail);
                    }
                    this.form.list = JSON.stringify(this.Data);

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'submit', this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Journal Voucher Saved',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

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
            }
        );
    }
    // => / END : Simpan

}
