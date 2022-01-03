import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { BroadcasterService } from 'ng-broadcaster';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-bank-form-dialog',
    templateUrl: './form.html',
})

export class ExchangeRateDialogComponent implements OnInit{

    form: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;

    Company: any = [];
    CompanyLast;

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<ExchangeRateDialogComponent>,
        private dialog: MatDialog,
        private broadcaster: BroadcasterService
    ) { }

    ngOnInit(): void {
        this.Company = this.Default.company;
    }

    Edit(): void {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    /*AC Company*/
    
    CompanyFilter(): void {
        let val = this.form.company_nama;

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            const Filtered = [];
            for (const item of this.Default.company) {
                const Combine = item.nama + '(' + item.abbr + ')';

                if (
                    item.abbr.toLowerCase().indexOf(val) !== -1 ||
                    item.nama.toLowerCase().indexOf(val) !== -1 ||
                    Combine.toLowerCase().indexOf(val) !== -1
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
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;
        }
    }

    dateChange(){
        this.form.max_date = this.form.min_date;
    }

    /*Simpan*/
    Save(): void {
        swal(
            {
                title: 'Apakah Anda Yakin!',
                html: '<div>Generate Data?</div>',
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
                    let URL = this.ComUrl + 'exchange_scrape';

                    this.form.min_date_send = moment(this.form.min_date, 'DD/MM/YYYY').format('YYYY-MM-DD');              
                    this.form.max_date_send = moment(this.form.max_date, 'DD/MM/YYYY').format('YYYY-MM-DD');  
                    
                    this.form.notimeout = 1;
                    
                    this.core.Do(URL, this.form).subscribe(
                        result => {

                            if (result.status === 1) {
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
