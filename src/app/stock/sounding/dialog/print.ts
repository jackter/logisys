import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from "providers/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';


@Component({
    selector: 'dialog-form-print',
    templateUrl: './print.html',
    styleUrls: ['../sounding.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SoundingPrintFormDialogComponent implements OnInit {

    WaitPrint: boolean;

    form: any = {};
    perm: any = {};
    Default: any = {};

    List: any[] = [];

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<SoundingPrintFormDialogComponent>
    ) { }


    ngOnInit() {

        this.form.tanggal_show = moment(this.form.tanggal).locale('id').format('LL');
        
    }

    rupiah(val, dec = 0, force = false){
        if(val){
            return this.core.rupiah(val, dec, force);
        }else{
            return '-';
        }
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'LAPORAN SOUNDING HARIAN# ' + this.form.tanggal_show,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }
}