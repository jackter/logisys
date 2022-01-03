import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-print-contract-invoice-dp',
    templateUrl: './print.html',
    styleUrls: ['../contract-invoice-dp.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContractInvoiceDpPrintDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    WaitPrint: boolean;
    List: any = [];

    ComUrl;
    Com;
    Busy;

    Delay;

    constructor(
        public core: Core,
        public dialogRef: MatDialogRef<ContractInvoiceDpPrintDialogComponent>
    ) {

    }

    ngOnInit() {
        this.TotalAmount();
        this.form.total_dpp = Number(this.form.total_amount_dp);
    }

    TotalAmount() {
        var TotalAmount = 0;
        for(let item of this.List) {
            TotalAmount += Number(item.amount);
        }

        var PPN = 0;
        if(this.form.ppn) {
            PPN = TotalAmount * 10 / 100;
        }

        var PPH = 0;
        if(this.form.pph) {
            PPH = TotalAmount * this.form.pph / 100;
        }

        if(this.form.other_invoice_type == 1){
            this.form.total_amount_dp = TotalAmount / 100 * this.form.dp_percent;
            this.form.total_ppn_dp = PPN / 100 * this.form.dp_percent;
            this.form.total_pph_dp = PPH / 100 * this.form.dp_percent;
            this.form.grand_total_dp = this.form.total_amount_dp + this.form.total_ppn_dp - this.form.total_pph_dp;
        }
        else{
            this.form.total_amount_dp = TotalAmount;
            this.form.total_ppn_dp = PPN;
            this.form.total_pph_dp = PPH;
            this.form.grand_total_dp = this.form.total_amount_dp + this.form.total_ppn_dp - this.form.total_pph_dp;
        }
    }

    rupiah(val) {
        return this.core.rupiah(val, 2, true);
    }

    date_indo(val) {
        return moment(val).locale('id').format('LL');
    }

    date(val) {
        return moment(val).format('DD/MM/YYYY');
    }


    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'CONTRACT INVOICE NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
