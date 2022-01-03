import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BroadcasterService } from 'ng-broadcaster';
import Swal from 'sweetalert2';

@Component({
    selector: 'dialog-form-invoice',
    templateUrl: './form.html',
    styleUrls: ['../invoice-miscellaneous.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InvoiceMiscellaneousFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Delay;

    List: any[] = [{
        i: 0
    }];

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();
    Currency: any;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<InvoiceMiscellaneousFormDialogComponent>
    ) { }

    ngOnInit() {
        this.Company = this.Default.company;
        this.Currency = this.Default.currency;

        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
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

        if (this.form.id != 'add') {
            this.List = this.form.list;

            if (this.form.tipe_pihak_ketiga == 1) {
                this.form.tipe_show = 'SUPPLIER';
            } else if (this.form.tipe_pihak_ketiga == 2) {
                this.form.tipe_show = 'CONTRACTOR';
            } else if (this.form.tipe_pihak_ketiga == 3) {
                this.form.tipe_show = 'CUSTOMER';
            } else if (this.form.tipe_pihak_ketiga == 4) {
                this.form.tipe_show = 'TRANSPORTER';
            } else if (this.form.tipe_pihak_ketiga == 5) {
                this.form.tipe_show = 'GENERAL';
            }

            if (this.form.jurnal_post == 0) {
                this.form.jurnal_show = 'Direct Posting';
            } else if (this.form.jurnal_post == 1) {
                this.form.jurnal_show = 'Posting on Payment';
            }

            if(this.form.is_detail){
                this.Edit();
            }
        }

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

            setTimeout(() => {
                $('*[name="tipe_pihak_ketiga"]').focus();
            }, 100);
        }
    }
    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;
        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
        this.form.pihak_ketiga = null;
        this.form.pihak_ketiga_kode = null;
        this.form.pihak_ketiga_nama = null;
        this.form.ref_kode = null;
        this.form.ref_tgl = null;
        this.form.pajak_no = null;
        this.form.pajak_tgl = null;
    }
    // => / END : AC Company

    /**
     * AC Supplier
     */
    PihakKetiga: any = [];
    PihakKetigaFilter(val: string) {

        this.PihakKetiga = [];

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                tipe: this.form.tipe_pihak_ketiga
            };

            this.core.Do(this.ComUrl + 'list.pihak_ketiga', Params).subscribe(
                result => {

                    if (result) {
                        this.PihakKetiga = result;
                    }
                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    PihakKetigaSelect(e, item) {

        if (e.isUserInput) {

            this.form.pihak_ketiga = item.id;
            this.form.pihak_ketiga_kode = item.kode;
            this.form.pihak_ketiga_nama = item.nama;

            setTimeout(() => {
                $('*[name="po_kode"]').focus();
            }, 100);

        }
    }
    PihakKetigaRemove() {
        this.form.pihak_ketiga = null;
        this.form.pihak_ketiga_kode = null;
        this.form.pihak_ketiga_nama = null;
    }
    // => END : AC Supplier

    /**
     * AC COA
     */
    COA: any;
    COAFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.form.company,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.coa', Params).subscribe(
                result => {

                    if (result.coa) {
                        this.COA = result.coa;
                    }
                },
                error => {
                    console.error('Coa Filter', error);
                    this.core.OpenNotif(error);
                }
            );
        }, 100);
    }

    COASelect(e, item, i: number) {

        if (e.isUserInput) {
            setTimeout(() => {
                this.List[i].coa = item.id;
                this.List[i].coa_kode = item.kode;
                this.List[i].coa_nama = item.nama;

                this.COA = [];

                this.CreateList(i);

                setTimeout(() => {
                    $('#amount-' + i).focus();
                }, 100);
            }, 0);

            this.COA = [];
        }
    }

    COARemove(item, i: number) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            this.List[i].coa = null;
            this.List[i].coa_kode = null;
            this.List[i].coa_nama = null;
        }, 100);
    }
    // => END : AC COA

    CreateList(i) {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {
            // => Check Next Input
            let next = Object.keys(this.List).length + 1;
            let DataNext = {
                i: next
            };
            if (!this.List[next]) {
                this.List.push(DataNext);
            }

        }, 100);
    }

    DeleteList(i, item) {
        let x = Swal({
            title: 'Delete List?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {
                if (result.value) {
                    if (x) {
                        let DATA = Object.keys(this.List);
                        // => Delete
                        let NewDetail = [];
                        let index = 0;
                        for (let j = 0; j < DATA.length; j++) {
                            if (j == i) {
                                delete this.List[j];
                            } else {
                                this.List[j].i = index;
                                NewDetail[index] = this.List[j];
                                index++;
                            }
                        }
                        // => Recreaten
                        this.List = NewDetail;
                        // this.CalculateMisc();                       
                    }
                }
            }
        );
    }

    GetTotal() {
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Total: number = 0;
            for (let item of this.List) {
                if (item.amount) {
                    Total += Number(item.amount);
                }
            }
            this.form.total_amount = Total;
        }, 100);
    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.List.push({
                i: 0
            });
        }
    }

    /**
     * Submit
     */
    Submit() {

        Swal({
            title: 'Submit Invoice ?',
            html: '<div>Please confirm to Continue Submit?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    if(this.form.inv_tgl){
                        this.form.tanggal_inv_send = moment(this.form.inv_tgl).format('YYYY-MM-DD');
                    }
                    if (this.form.ref_tgl) {
                        this.form.ref_tgl_send = moment(this.form.ref_tgl).format('YYYY-MM-DD');
                    }
                    if (this.form.pajak_tgl) {
                        this.form.pajak_tgl_send = moment(this.form.pajak_tgl).format('YYYY-MM-DD');
                    }
                    if (this.form.tgl_jatuh_tempo) {
                        this.form.tgl_jatuh_tempo_send = moment(this.form.tgl_jatuh_tempo).format('YYYY-MM-DD');
                    }

                    this.form.list_send = JSON.stringify(this.List);

                    var URL = this.ComUrl + 'edit';
                    if (this.form.id == 'add') {
                        URL = this.ComUrl + 'add';
                    }

                    this.Busy = true;
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    icon: 'success',
                                    showConfirmButton: false,
                                    title: 'Request Saved',
                                    msg: 'Please Verify your input to confirm and continue the process!'
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
                            console.error('Submit', error);
                        }
                    );
                }
            }
        );
    }
    // => / END : Submit

    rupiah(val) {
        return this.core.rupiah(val);
    }

}
