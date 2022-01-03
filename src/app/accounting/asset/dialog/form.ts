import { Component, OnInit } from "@angular/core";
import { Core } from "providers/core";
import { MatDialogRef, MatDialog } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-form-Poting',
    templateUrl: './form.html'
})
export class AssetFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    assetType: any = {};
    assetTypePerCompany: any = {};
    COAPerCompany: any = {};
    Default: any = {};

    List: any[] = [{
        i: 0
    }];

    ComUrl;
    Com;
    Busy;

    Delay;

    coaIsExist: boolean = false;

    constructor(
        private core: Core,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<AssetFormDialogComponent>
    ) {

    }

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
        }
        //=> / Check Company

        /**
         * Form Edit
         */
        if (this.form.id != 'add') {

            this.List = this.form.list;       

            if (this.form.tanggal) {
                this.form.tanggal = moment(this.form.tanggal, 'YYYY-MM-DD');
            }

            this.COAPerCompany = _.filter(this.Default.coa, {
                company: this.form.company
            });

            this.form.depreYear = null;
            if (this.form.is_po == 1) {
                this.form.is_po = true;
            }
            else {
                this.form.is_po = false;
            }

            this.form.asset_usage_empty = true;   

            if(this.form.detail){
                this.form.coa_expenditure = this.form.detail.coa_expenditures;
                if (this.form.coa_expenditure > 0) {
                    this.form.coa_kode_expenditure = this.form.detail.coa_kode_expenditures;
                    this.form.coa_nama_expenditure = this.form.detail.coa_nama_expenditures;
                    this.form.coa_expenditure_input = this.form.detail.coa_kode_expenditures + " - " + this.form.detail.coa_nama_expenditures;
                }

                this.form.coa_asset = this.form.detail.coa_asset;
                if (this.form.coa_asset > 0) {
                    this.form.coa_kode_asset = this.form.detail.coa_kode_asset;
                    this.form.coa_nama_asset = this.form.detail.coa_nama_asset;
                    this.form.coa_asset_input = this.form.detail.coa_kode_asset + " - " + this.form.detail.coa_nama_asset;
                }


                this.form.coa_depreciation = this.form.detail.coa_depreciation;
                if (this.form.coa_depreciation > 0) {
                    this.form.coa_kode_depreciation = this.form.detail.coa_kode_depreciation;
                    this.form.coa_nama_depreciation = this.form.detail.coa_nama_depreciation;
                    this.form.coa_depreciation_input = this.form.detail.coa_kode_depreciation + " - " + this.form.detail.coa_nama_depreciation;
                }


                this.form.coa_accumulated_depreciation = this.form.detail.coa_accumulated_depreciation;
                if (this.form.coa_accumulated_depreciation > 0) {
                    this.form.coa_kode_accumulated_depreciation = this.form.detail.coa_kode_accumulated_depreciation;
                    this.form.coa_nama_accumulated_depreciation = this.form.detail.coa_nama_accumulated_depreciation;
                    this.form.coa_accumulated_depreciation_input = this.form.detail.coa_kode_accumulated_depreciation + " - " + this.form.detail.coa_nama_accumulated_depreciation;
                }
            }

        }
        //=> / END : Form Edit

    }

    /**
    * FocusCompany
    */
    FocusCompany() {
        setTimeout(() => {
            $('*[name="company_nama"]').focus();
        }, 100);
    }
    //=> / END : FocusCompany

    //=> / END : Focus To

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
        }
    }

    /**
     * AC Item
     */
    COA: any;
    WaitItem = false;
    COAFilter(name) {

        var val = this.form.coa_persediaan_input;

        if (name == "coa_expenditure") {
            val = this.form.coa_expenditure_input;
        }
        else if (name == "coa_asset") {
            val = this.form.coa_asset_input;
        }
        else if (name == "coa_depreciation") {
            val = this.form.coa_depreciation_input;
        }
        else if (name == "coa_accumulated_depreciation") {
            val = this.form.coa_accumulated_depreciation_input;
        }


        if (val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];

            for (let item of this.COAPerCompany) {

                var Combine = item.nama + ' (' + item.kode + ')';
                if (Combine.toLowerCase().indexOf(val) != -1) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.COA = Filtered;

        }
        else {
            this.COA = this.COAPerCompany;
        }

    }
    COASelect(e, item, name) {
        if (e.isUserInput && name == 'coa_expenditure') {
            this.form.coa_expenditure_input = item.kode + ' - ' + item.nama;
            this.form.coa_expenditure = item.id;
            this.form.coa_kode_expenditure = item.kode;
            this.form.coa_nama_expenditure = item.nama;
        }
        else if (e.isUserInput && name == 'coa_asset') {
            this.form.coa_asset_input = item.kode + ' - ' + item.nama;
            this.form.coa_asset = item.id;
            this.form.coa_kode_asset = item.kode;
            this.form.coa_nama_asset = item.nama;
        }
        else if (e.isUserInput && name == 'coa_depreciation') {
            this.form.coa_depreciation_input = item.kode + ' - ' + item.nama;
            this.form.coa_depreciation = item.id;
            this.form.coa_kode_depreciation = item.kode;
            this.form.coa_nama_depreciation = item.nama;
        }
        else if (e.isUserInput && name == 'coa_accumulated_depreciation') {
            this.form.coa_accumulated_depreciation_input = item.kode + ' - ' + item.nama;
            this.form.coa_accumulated_depreciation = item.id;
            this.form.coa_kode_accumulated_depreciation = item.kode;
            this.form.coa_nama_accumulated_depreciation = item.nama;
        }
    }
    ClearInput(name) {
        if (name == 'coa_expenditure') {
            this.form.coa_expenditure_input = "";
            this.form.coa_expenditure = "";
            this.form.coa_kode_expenditure = "";
            this.form.coa_nama_expenditure = "";
        }
        else if (name == 'coa_asset') {
            this.form.coa_asset_input = "";
            this.form.coa_asset = "";
            this.form.coa_kode_asset = "";
            this.form.coa_nama_asset = "";
        }
        else if (name == 'coa_depreciation') {
            this.form.coa_depreciation_input = "";
            this.form.coa_depreciation = "";
            this.form.coa_kode_depreciation = "";
            this.form.coa_nama_depreciation = "";
        }
        else if (name == 'coa_accumulated_depreciation') {
            this.form.coa_accumulated_depreciation_input = "";
            this.form.coa_accumulated_depreciation = "";
            this.form.coa_kode_accumulated_depreciation = "";
            this.form.coa_nama_accumulated_depreciation = "";
        }
    }
    //=> / END : AC Item

    /**
    * AC poCode
    */
    POCode: any;
    POCodeFilter(val: string) {

        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Params = {
                NoLoader: 1,
                keyword: val,
                company: this.form.company,
                supplier: this.form.supplier
            };

            this.core.Do(this.ComUrl + 'po.list', Params).subscribe(
                result => {

                    if (result) {
                        this.POCode = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    POCodeSelect(e, item) {

        if (e.isUserInput) {

            this.form.po = item.po;
            this.form.po_kode = item.kode;

            this.form.item_nama = item.nama;
            this.form.item = item.item;

            this.form.supplier = item.supplier;
            this.form.supplier_kode = item.supplier_kode;
            this.form.supplier_nama = item.supplier_nama;

            this.form.gr = item.gr;
            this.form.gr_kode = item.gr_kode;

            this.form.acquisition_value = (item.qty_receipt - item.qty_return) * item.price;

            this.form.coa_expenditure_input = item.coa_kode_beban + ' - ' + item.coa_nama_beban;
            this.form.coa_expenditure = item.coa_beban;
            this.form.coa_kode_expenditure = item.coa_kode_beban;
            this.form.coa_nama_expenditure = item.coa_nama_beban;

            setTimeout(() => {
                $('*[name="est_year"]').focus();
            }, 100);

        }

    }
    POCodeRemove() {

        this.form.po = null;
        this.form.po_kode = null;

        this.form.item_nama = null;
        this.form.item = null;

        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.gr = null;
        this.form.gr_kode = null;

        this.form.acquisition_value = null;

        this.form.coa_expenditure_input = null;
        this.form.coa_expenditure = null;
        this.form.coa_kode_expenditure = null;
        this.form.coa_nama_expenditure = null;

    }
    //=> / END : AC poCode

    /**
     * Verify
     */
    Verify() {
        swal({
            title: 'Please Confirm to Verify?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: this.form.id,
                        kode: this.form.kode,
                        company: this.form.company,
                        tanggal: this.form.tanggal,
                        asset_usage: this.form.asset_usage
                    };

                    this.Busy = true;
                    this.core.Do(this.ComUrl + 'verify', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Verify Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);

                                this.core.send({
                                    info: "Asset Verified"
                                });

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
                            console.error('Verify', error);
                            this.core.OpenNotif(error);

                            this.Busy = false;
                        }
                    );

                }

            }
        );
    }
    //=> End : Verify

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {
        var val = this.form.company_nama;

        if (val != this.CompanyLast) {
            this.form.company = null;
            this.form.company_abbr = null;

            // this.form.dept = null;
            // this.form.dept_abbr = null;
            // this.form.dept_nama = null;
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
            this.form.company = item.id;
            this.form.company_nama = item.nama;
            this.form.company_abbr = item.abbr;

            this.CompanyLast = item.nama;

            this.assetTypePerCompany = _.filter(this.assetType, {
                company: item.id
            });

            this.AssetType = this.assetTypePerCompany;

            this.COAPerCompany = _.filter(this.Default.coa, {
                company: item.id
            });

            setTimeout(() => {
                $('*[name="asset_type_nama"]').focus();
            }, 100);
        }
    }

    CompanyRemove() {
        this.form.company = null;
        this.form.company_nama = null;
        this.form.company_abbr = null;

        this.Company = this.Default.company;
    }
    //=> / END : AC Company

    /**
     * AC AssetType
     */
    AssetType: any = [];
    AssetTypeLen: number;
    AssetTypeLast;
    AssetTypeFilter() {
        var val = this.form.asset_type_nama;

        if (val != this.AssetTypeLast) {
            this.form.asset_type = null;
            this.form.asset_initial = null;
            this.form.asset_type_nama = null;
        }

        if (val) {
            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.assetTypePerCompany) {

                if (
                    item.nama.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }

            }
            this.AssetType = Filtered;

        } else {
            this.AssetType = this.assetTypePerCompany;
        }

    }
    AssetTypeSelect(e, item) {
        if (e.isUserInput) {
            this.form.asset_type = item.id;
            this.form.asset_initial = item.initial_code;
            this.form.asset_type_nama = item.nama;
            this.form.depreciation_method = item.depreciation_method;
            this.form.est_year = item.est_year;
            this.form.est_month = 0;

            this.AssetTypeLast = item.nama;

            this.form.po = null;
            this.form.po_kode = null;

            this.form.item_nama = null;
            this.form.item = null;

            this.form.supplier = null;
            this.form.supplier_kode = null;
            this.form.supplier_nama = null;

            this.form.gr = null;
            this.form.gr_kode = null;

            this.form.acquisition_value = null;

            this.form.coa_expenditure_input = null;
            this.form.coa_expenditure = null;
            this.form.coa_kode_expenditure = null;
            this.form.coa_nama_expenditure = null;

            setTimeout(() => {
                $('*[name="asset_usage"]').focus();
            }, 100);
        }
    }
    AssetTypeRemove() {
        this.form.asset_type = null;
        this.form.asset_initial = null;
        this.form.asset_type_nama = null;
        this.form.depreciation_method = null;
        this.form.est_year = null;
        this.form.est_month = 0;

        this.form.po = null;
        this.form.po_kode = null;

        this.form.item_nama = null;
        this.form.item = null;

        this.form.supplier = null;
        this.form.supplier_kode = null;
        this.form.supplier_nama = null;

        this.form.gr = null;
        this.form.gr_kode = null;

        this.form.acquisition_value = null;

        this.form.coa_expenditure_input = null;
        this.form.coa_expenditure = null;
        this.form.coa_kode_expenditure = null;
        this.form.coa_nama_expenditure = null;
        this.form.coa_asset_input = null;
        this.form.coa_asset = null;
        this.form.coa_kode_asset = null;
        this.form.coa_nama_asset = null;
        this.form.coa_depreciation_input = null;
        this.form.coa_depreciation = null;
        this.form.coa_kode_depreciation = null;
        this.form.coa_nama_depreciation = null;
        this.form.coa_accumulated_depreciation_input = null;
        this.form.coa_accumulated_depreciation = null;
        this.form.coa_kode_accumulated_depreciation = null;
        this.form.coa_nama_accumulated_depreciation = null;

        this.AssetType = this.assetType;

        setTimeout(() => {
            $('*[name="remarks"]').focus();
        }, 50);

        setTimeout(() => {
            $('*[name="asset_type_nama"]').focus();
        }, 100);
    }
    //=> / END : AC AssetType

    assetUsage(){
        this.form.asset_usage_empty = true;
    }

    postedToAsset(){
        this.form.prog_cip_post_asset = 1;
        this.form.asset_usage_empty = true;

        var total:number = 0;
        for(let item of this.List){
            total += item.amount;
        }
        this.form.acquisition_value = total;
        this.form.is_detail = null;
    }

    /**
     * Simpan
     */
    Simpan() {
        var summaryMonth: number = (Number(this.form.est_year) * 12) + Number(this.form.est_month);
        var tempTanggal;

        if(this.form.asset_usage == 0){
            let depreYear = [];

            for (var i = 0; i < summaryMonth; i++) {
                tempTanggal = moment(this.form.tanggal).add(i + 1, 'months').endOf('month');

                depreYear.push({
                    tanggal: moment(tempTanggal).format('YYYY-MM-DD'),
                    value: this.form.acquisition_value / summaryMonth
                });
            }

            this.form.depreYear = JSON.stringify(depreYear);
        }

        this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD');

        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add' || this.form.prog_cip_post_asset == 1) {
            URL = this.ComUrl + 'add';

            if(this.form.prog_cip_post_asset == 1){
                let depreYear = [];

                for (var i = 0; i < summaryMonth; i++) {
                    tempTanggal = moment(this.form.tanggal).add(i + 1, 'months').endOf('month');

                    depreYear.push({
                        tanggal: moment(tempTanggal).format('YYYY-MM-DD'),
                        value: this.form.acquisition_value / summaryMonth
                    });
                }

                this.form.depreYear = JSON.stringify(depreYear);

                this.form.asset_usage = 0;

                this.assetTypePerCompany = _.filter(this.assetType, {
                    company: this.form.company
                });               
                
                var Find =  _.find(this.assetTypePerCompany, {
                    id: this.form.asset_type
                });

                if(Find){
                    this.form.asset_initial = Find['asset_initial'];
                }
            }
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    if(this.form.prog_cip_post_asset == 1){
                        var Params = {
                            id: result.id,
                            kode: this.form.kode,
                            company: this.form.company,
                            tanggal: this.form.tanggal,
                            asset_usage: this.form.asset_usage
                        };
    
                        this.Busy = true;
                        this.core.Do(this.ComUrl + 'verify', Params).subscribe();
                    }

                    var Success = {
                        type: 'success',
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

                console.error('Simpan', error);
            }
        );

    }
    //=> / END : Simpan

}