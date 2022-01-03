import { Component, OnInit } from '@angular/core';
import { Core } from '../../../../providers/core';
import { MatDialogRef } from '@angular/material';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector: 'dialog-form-item',
    templateUrl: './form_akun.html',
})
export class ItemFormAkunDialogComponent implements OnInit {

    global: any;
    form: any = {};
    formCOA: any = {};
    perm: any = {};
    Default: any = {};

    ComUrl;
    Com;
    Busy;
    Data: any;

    Delay;

    coaIsExist: boolean = false;

    FroalaOptions: Object = {
        charCounterCount: true,
        wordAllowedStyleProps: [
            'font-size'
        ],
        wordDeniedAttrs: [
            'style'
        ],
        wordPasteModal: false,
        toolbarButtons: [
            'bold',
            'italic',
            'underline',
            'paragraphFormat',
            '|',
            'align',
            'formatOL',
            'formatUL',
            '|',
            'insertTable',
            '|',
            'strikeThrough',
            'subscript',
            'superscript',
            '|',
            'color',
            // 'inlineStyle',
            // '|',
        ],
        placeholder: 'Type Item Description',
        /*events : {
            'froalaEditor.keyup' : (e, editor) => {
                
            }
        }*/

    };
    ShowEditor = false;

    constructor(
        private core: Core,
        public dialogRef: MatDialogRef<ItemFormAkunDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {

        this.Company = this.Default.company;

        this.InitCOAFilter();

        this.formCOA.item_id = this.Data.id;

        this.formCOA.item_type = this.Data.item_type;

        var Time = 1000;
        if (this.formCOA.is_detail) {
            Time = 0;
        }

        setTimeout(() => {
            this.ShowEditor = true;
        }, Time);

    }

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        var val = this.formCOA.company_nama;

        if (val != this.CompanyLast) {
            this.formCOA.company = null;
            this.formCOA.company_abbr = null;
        }

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
            this.formCOA.company = item.id;
            this.formCOA.company_nama = item.nama;
            this.formCOA.company_abbr = item.abbr;

            var isDetail = true;

            this.CompanyLast = item.nama;

            var Params = {
                id: this.Data.id,
                company: this.formCOA.company
            };

            // console.log(Params);

            this.core.Do(this.ComUrl + 'get_coa', Params).subscribe(
                result => {

                    if (result && result.data) {

                        this.formCOA.is_detail = isDetail;

                        var ListCoa = [
                            'persediaan',
                            'beban',
                            'penjualan',
                            'disc_penjualan',
                            'retur_penjualan',
                            'retur_pembelian',
                            'hpp',
                            'accrued'
                        ];

                        this.formCOA.id = result.data['id'];

                        for (let item of ListCoa) {
                            if (result.data['coa_' + item]) {
                                this.formCOA['coa_' + item] = result.data['coa_' + item];
                                this.formCOA['coa_kode_' + item] = result.data['coa_kode_' + item];
                                this.formCOA['coa_nama_' + item] = result.data['coa_nama_' + item];
                                this.formCOA['coa_' + item + '_input'] = result.data['coa_kode_' + item] + ' - ' + result.data['coa_nama_' + item];
                            }
                        }

                        if (!this.formCOA.is_detail) {
                            // console.log('here');
                            setTimeout(() => {
                                $('*[name="coa_persediaan"]').focus();
                            }, 100);
                        }

                    }

                },
                error => {
                    console.error('GetForm', error);
                    this.core.OpenNotif(error);
                }
            );

        }
    }
    CompanyRemove() {
        this.formCOA.company = null;
        this.formCOA.company_nama = null;
        this.formCOA.company_abbr = null;

        var ListCoa = [
            'persediaan',
            'beban',
            'penjualan',
            'disc_penjualan',
            'retur_penjualan',
            'retur_pembelian',
            'hpp',
            'accrued'
        ];

        for (let item of ListCoa) {
            this.formCOA['coa_' + item] = null;
            this.formCOA['coa_kode_' + item] = null;
            this.formCOA['coa_nama_' + item] = null;
            this.formCOA['coa_' + item + '_input'] = null;
        }

        this.CompanyFilter();
    }
    // => / END : AC Company

    /**
     * AC Item
     */
    COA: any;
    WaitItem = false;
    InitCOAFilter() {
        let i = 0;
        let Filtered = [];
        for (let item of this.Default.coa) {

            if (this.formCOA.company == item.company
            ) {
                Filtered[i] = item;
                this.coaIsExist = true;
                i++;
            }

        }
        this.COA = Filtered;
    }
    COAFilter(name) {

        var val = this.formCOA.coa_persediaan_input;

        if (name == 'coa_beban') {
            val = this.formCOA.coa_beban_input;
        }
        else if (name == 'coa_penjualan') {
            val = this.formCOA.coa_penjualan_input;
        }
        else if (name == 'coa_disc_penjualan') {
            val = this.formCOA.coa_disc_penjualan_input;
        }
        else if (name == 'coa_retur_penjualan') {
            val = this.formCOA.coa_retur_penjualan_input;
        }
        else if (name == 'coa_retur_pembelian') {
            val = this.formCOA.coa_retur_pembelian_input;
        }
        else if (name == 'coa_hpp') {
            val = this.formCOA.coa_hpp_input;
        }
        else if (name == 'coa_accrued') {
            val = this.formCOA.coa_accrued_input;
        }

        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.Default.coa) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (
                    (item.kode.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1) && this.formCOA.company == item.company
                ) {
                    Filtered[i] = item;
                    this.coaIsExist = true;
                    i++;
                }

            }
            this.COA = Filtered;

        }/*else{
            this.COA = this.Default.coa;
        }*/

    }
    COASelect(e, item, name) {
        if (e.isUserInput && name == 'coa_persediaan') {
            this.formCOA.coa_persediaan_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_persediaan = item.id;
            this.formCOA.coa_kode_persediaan = item.kode;
            this.formCOA.coa_nama_persediaan = item.nama;
        }
        else if (e.isUserInput && name == 'coa_beban') {
            this.formCOA.coa_beban_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_beban = item.id;
            this.formCOA.coa_kode_beban = item.kode;
            this.formCOA.coa_nama_beban = item.nama;
        }
        else if (e.isUserInput && name == 'coa_penjualan') {
            this.formCOA.coa_penjualan_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_penjualan = item.id;
            this.formCOA.coa_kode_penjualan = item.kode;
            this.formCOA.coa_nama_penjualan = item.nama;
        }
        else if (e.isUserInput && name == 'coa_disc_penjualan') {
            this.formCOA.coa_disc_penjualan_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_disc_penjualan = item.id;
            this.formCOA.coa_kode_disc_penjualan = item.kode;
            this.formCOA.coa_nama_disc_penjualan = item.nama;
        }
        else if (e.isUserInput && name == 'coa_retur_penjualan') {
            this.formCOA.coa_retur_penjualan_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_retur_penjualan = item.id;
            this.formCOA.coa_kode_retur_penjualan = item.kode;
            this.formCOA.coa_nama_retur_penjualan = item.nama;
        }
        else if (e.isUserInput && name == 'coa_retur_pembelian') {
            this.formCOA.coa_retur_pembelian_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_retur_pembelian = item.id;
            this.formCOA.coa_kode_retur_pembelian = item.kode;
            this.formCOA.coa_nama_retur_pembelian = item.nama;
        }
        else if (e.isUserInput && name == 'coa_hpp') {
            this.formCOA.coa_hpp_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_hpp = item.id;
            this.formCOA.coa_kode_hpp = item.kode;
            this.formCOA.coa_nama_hpp = item.nama;
        }
        else if (e.isUserInput && name == 'coa_accrued') {
            this.formCOA.coa_accrued_input = item.kode + ' - ' + item.nama;
            this.formCOA.coa_accrued = item.id;
            this.formCOA.coa_kode_accrued = item.kode;
            this.formCOA.coa_nama_accrued = item.nama;
        }
    }
    ClearInput(name) {
        if (name == 'coa_persediaan') {
            this.formCOA.coa_persediaan_input = '';
            this.formCOA.coa_persediaan = '';
            this.formCOA.coa_kode_persediaan = '';
            this.formCOA.coa_nama_persediaan = '';
        }
        else if (name == 'coa_beban') {
            this.formCOA.coa_beban_input = '';
            this.formCOA.coa_beban = '';
            this.formCOA.coa_kode_beban = '';
            this.formCOA.coa_nama_beban = '';
        }
        else if (name == 'coa_penjualan') {
            this.formCOA.coa_penjualan_input = '';
            this.formCOA.coa_penjualan = '';
            this.formCOA.coa_kode_penjualan = '';
            this.formCOA.coa_nama_penjualan = '';
        }
        else if (name == 'coa_disc_penjualan') {
            this.formCOA.coa_disc_penjualan_input = '';
            this.formCOA.coa_disc_penjualan = '';
            this.formCOA.coa_kode_disc_penjualan = '';
            this.formCOA.coa_nama_disc_penjualan = '';
        }
        else if (name == 'coa_retur_penjualan') {
            this.formCOA.coa_retur_penjualan_input = '';
            this.formCOA.coa_retur_penjualan = '';
            this.formCOA.coa_kode_retur_penjualan = '';
            this.formCOA.coa_nama_retur_penjualan = '';
        }
        else if (name == 'coa_retur_pembelian') {
            this.formCOA.coa_retur_pembelian_input = '';
            this.formCOA.coa_retur_pembelian = '';
            this.formCOA.coa_kode_retur_pembelian = '';
            this.formCOA.coa_nama_retur_pembelian = '';
        }
        else if (name == 'coa_hpp') {
            this.formCOA.coa_hpp_input = '';
            this.formCOA.coa_hpp = '';
            this.formCOA.coa_kode_hpp = '';
            this.formCOA.coa_nama_hpp = '';
        }
        else if (name == 'coa_accrued') {
            this.formCOA.coa_accrued_input = '';
            this.formCOA.coa_accrued = '';
            this.formCOA.coa_kode_accrued = '';
            this.formCOA.coa_nama_accrued = '';
        }
    }
    // => / END : AC Item

    Edit() {
        if (this.formCOA.is_detail) {
            this.formCOA.is_detail = null;
            setTimeout(() => {
                $('*[name="coa_persediaan"]').focus();
            }, 100);
        }
    }

    /**
     * Simpan
     */
    Simpan() {
        if (this.coaIsExist) {
            var URL = this.ComUrl + 'add_coa';
            if (this.formCOA.id) {
                URL = this.ComUrl + 'edit_coa';
            }

            console.log(URL);

            this.Busy = true;
            this.core.Do(URL, this.formCOA).subscribe(
                result => {

                    if (result.status == 1) {

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
        else {
            this.core.OpenAlert({
                title: 'Account master is not defined',
                msg: '<div>To create or defining Account master, please coordinate with IT.</div>',
                width: 400
            });
        }
    }
    // => / END : Simpan

}
