import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-generate-pq',
    templateUrl: './generate.html',
    styleUrls: ['../pq.component.scss']
})
export class PQGenerateDialogComponent implements OnInit {

    WaitPrint: boolean;
    form;
    data;

    distribution;
    distribution_show;
    expire;
    expire_show;

    minDate;
    minDateExpire;

    Busy;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<PQGenerateDialogComponent>
    ) {

    }

    ngOnInit() {

        this.minDate = moment(new Date()).format('DD/MM/YYYY');
        this.distribution = this.minDate;
        this.distribution_show = moment(this.distribution, 'DD/MM/YYYY').format('LL');
        this.minDateExpire = moment(new Date()).add(0, 'days').format('DD/MM/YYYY');

        if (this.form.tanggal) {
            this.form.tanggal_show = moment(this.form.tanggal, 'YYYY-MM-DD').format('DD MMMM YYYY');
        }

        if (this.form.pr_tanggal) {
            this.form.pr_tanggal_show = moment(this.form.pr_tanggal, 'YYYY-MM-DD').format('DD MMMM YYYY');
        }

    }

    // ================= Begin CheckDate() =================
    DelayCheckDate;
    CheckDate() {

        clearTimeout(this.DelayCheckDate);
        this.DelayCheckDate = setTimeout(() => {

            let minDate = moment(this.minDate, 'DD/MM/YYYY');
            let distribution = moment(this.distribution, 'DD/MM/YYYY');
            this.distribution_show = moment(this.distribution, 'DD/MM/YYYY').format('LL');
            let DateDiff = minDate.diff(distribution, 'days');

            if (DateDiff > 0) {
                this.distribution = minDate;
                this.distribution_show = moment(minDate, 'DD/MM/YYYY').format('LL');
            }

            let minDateExpire = moment(this.minDateExpire, 'DD/MM/YYYY');
            let expire = moment(this.expire, 'DD/MM/YYYY');
            this.expire_show = moment(expire, 'DD/MM/YYYY').format('LL');
            let DateDiffExpire = minDateExpire.diff(expire, 'days');

            if (DateDiffExpire > 0) {
                this.expire = minDateExpire;
                this.expire_show = moment(minDateExpire, 'DD/MM/YYYY').format('LL');
            }

        }, 500);

    }
    // ================== END CheckDate() ==================

    Print() {

        this.WaitPrint = true;

        var distribution = moment(this.distribution, 'DD/MM/YYYY').format('YYYY-MM-DD');
        var expire = moment(this.expire, 'DD/MM/YYYY').format('YYYY-MM-DD');

        var Params = {
            id: this.form.id,
            header_pq_supplier: this.data.detail_id,
            distribution: distribution,
            expire: expire,
            to: this.data.jenis + ' ' + this.data.nama,
            supplier: this.data.id
        };
        this.core.Do('e/snd/pq/print', Params).subscribe(
            result => {

                setTimeout(() => {

                    $('.print-area').print({
                        globalStyle: true,
                        mediaPrint: true,
                        title: 'Quotation ' + this.form.pq_kode,
                        timeout: 60000,
                    });

                    this.WaitPrint = false;

                    this.dialogRef.close({ reopen: 1 });
                    this.core.Sharing('reload', 'reload');

                }, 1000);

            },
            error => {
                console.error('Print', error);
            }
        );

        /*this.dialogRef.close({});  

        setTimeout(() => {
            this.core.HideLoader();
        }, 500);*/

    }

}
