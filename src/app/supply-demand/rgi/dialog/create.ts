import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-create-rgi',
    templateUrl: './create.html',
    styleUrls: ['../rgi.component.scss'],
})
export class RGICreateFormDialogComponent implements OnInit {

    form: any = {};
    ComUrl: string;
    perm: any;
    Delay: any;
    Default: any;

    Busy;

    minDate = moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD').toString();

    maxDate = moment(new Date()).format('YYYY-MM-DD').toString();

    constructor(
        private core: Core,
        private dialogRef: MatDialogRef<RGICreateFormDialogComponent>
    ) {

    }

    ngOnInit() {
        if(this.Default.day_subs){
            this.minDate = moment(new Date()).subtract(this.Default.day_subs, 'days').format('YYYY-MM-DD').toString();
        }
    }

    /**
     * CEK QTY RETURN
     */
    ReadySave: number = 0;
    Calculate(item) {

        this.ReadySave = 0;

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Receipt: number = item.qty_max_return;

            if (item.qty_return > Receipt) {
                item.qty_return = Receipt;
            }

            let i = 0;
            for (let detail of this.form.list) {
                if (detail.qty_return > 0) {
                    this.ReadySave += detail.qty_return;
                }
                else {
                    this.form.list[i].qty_return = 0;
                }
                i++;
            }

        }, 100);

    }
    // => AND CEK QTY RETURN

    /**
     * AC GI CODE
     */
    GICode: any;
    GICodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val
            };

            this.core.Do(this.ComUrl + 'list.gi', Params).subscribe(
                result => {

                    if (result) {
                        this.GICode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );

        }, 250);


    }

    GICodeSelect(e, item) {

        if (e.isUserInput) {
            this.form.gi_kode = item.kode;
            this.form.gi = item.id;
            this.form.company = item.company;
            this.form.company_abbr = item.company_abbr;
            this.form.company_nama = item.company_nama;
            this.form.dept = item.dept;
            this.form.dept_abbr = item.dept_abbr;
            this.form.dept_nama = item.dept_nama;
            this.form.jurnal = item.jurnal;
            this.form.list = item.list;
            this.form.enable_journal = item.enable_journal;

            setTimeout(() => {
                $('*[name="tanggal"]').focus();
            }, 100);
        }

    }
    GICodeRemove() {

        this.form.gi_kode = null;
        this.form.gi = null;
        this.form.company = null;
        this.form.company_abbr = null;
        this.form.company_nama = null;
        this.form.dept = null;
        this.form.dept_abbr = null;
        this.form.dept_nama = null;
        this.form.list = null;
        this.form.enable_journal = null;

        setTimeout(() => {
            this.GICodeFilter(this.form.gi_kode);
        }, 100);
    }
    // => END AC GI CODE

    Simpan() {

        this.form.list_send = JSON.stringify(this.form.list);
        this.form.tanggal = moment(this.form.tanggal, 'DD/MM/YYYY').format('YYYY-MM-DD');

        this.Busy = true;
        this.core.Do(this.ComUrl + 'partial.rgi', this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.core.Sharing('reload', 'reload');

                    this.dialogRef.close(result);

                } else {

                    var Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);

                    this.Busy = false;
                }
            },
            error => {
                this.Busy = false;
                this.core.OpenNotif(error);
            }
        );

    }

}
