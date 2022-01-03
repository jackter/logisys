import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import * as XLSX from 'xlsx'; 

@Component({
    selector: 'dialog-print-tb',
    templateUrl: './print.html'
})
export class TBPrintDialogComponent {

    Data;
    filter: any = {};
    Busy;
    WaitPrint: boolean;
    WaitDownload: boolean;

    constructor(
        private core: Core,
        public dialog: MatDialogRef<TBPrintDialogComponent>
    ) { }

    ngOnInit() {
        
    }

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

    date_indo(val) {
        if(val) {
            return moment(val).format('DD/MM/YYYY');
        }
    }

    /**
     * Print
     */
    Print() {

        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'TRIAL BALANCE DETAIL',
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);

    }
    // => / END : Print

    ExportExcel() {
        this.WaitDownload = true;

        setTimeout(() => {

            // var fileName = 'RekapAbsensiBulanan.xlsx';
            var fileName = 'TB_Detail_' + this.filter.company_abbr + '.xlsx';  

            let element = document.getElementById("excel-area");
            const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

            /* generate workbook and add the worksheet */
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            /* save to file */
            XLSX.writeFile(wb, fileName);

            this.WaitDownload = false;

        }, 1000);
    }
}