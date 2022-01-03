import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig, MatDatepicker } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { LocalStorageService } from 'angular-2-local-storage';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-report-item',
    templateUrl: './report-inventory-tb.component.html',
    styleUrls: ['./report-inventory-tb.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ReportInventoryTbComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/stock/report/inventory-tb/';
    public Com: any = {
        name: 'Inventory Trial Balance',
        title: 'Inventory Trial Balance',
        icon: 'chrome_reader_mode',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private LS: LocalStorageService,
        public _fuseConfigService: FuseConfigService,
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    folded: true
                }
            }
        };
    }

    ngOnInit() {
        this.LoadDefault();
    }

    /* FilHingga */
    FillHingga() {
        this.Data = [];

        var FinalHingga = '';

        if (!this.filter.fhingga) {
            var END = moment(this.filter.fdari, 'YYYY-MM-DD').endOf('month');
            FinalHingga = END.format('YYYY-MM-DD').toString();
            if (moment(END, 'YYYY-MM-DD') > moment(this.maxDate, 'YYYY-MM-DD')) {
                FinalHingga = this.maxDate;
            }
            setTimeout(() => {
                $('*[name="company_nama"]').focus();
            }, 250);
        } else {
            var Dari = moment(this.filter.fdari, 'YYYY-MM-DD');
            var Hingga = moment(this.filter.fhingga, 'YYYY-MM-DD');
            if (Dari > Hingga) {
                var END = moment(this.filter.fdari, 'YYYY-MM-DD').endOf('month');
                FinalHingga = END.format('YYYY-MM-DD').toString();
                if (moment(END, 'YYYY-MM-DD') > moment(this.maxDate, 'YYYY-MM-DD')) {
                    FinalHingga = this.maxDate;
                }
            }
        }
        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }
        this.LoadData(this.gridParams);
    }

    /**
     * Load Default
     */
    LoadDefault() {

        var Params = {
            NoLoader: 1
        };

        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {

                if (result) {
                    this.Default = result;

                    this.Company = this.Default.company;

                    /**
                     * Check Company
                     * 
                     * Jika Company hanya 1, maka system akan melakukan Autoselect
                     * dan Mematikan fungsi Auto Complete
                     */
                    this.CompanyLen = Object.keys(this.Company).length;
                    if (this.CompanyLen == 1) {
                        this.filter.company = this.Company[0].id;
                        this.filter.company_abbr = this.Company[0].abbr;
                        this.filter.company_nama = this.Company[0].nama;

                        /**
                         * Set Storeloc by Company
                         */
                        var Find: any = _.find(this.Default.company, {
                            id: this.filter.company
                        });
                        if (Object.keys(Find).length > 0) {
                            this.Storeloc = Find.store;
                            this.StorelocKeep = Find.store;
                        }
                        // => / END : 
                    }
                    // => / Check Company
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Load Default

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        setTimeout(() => {

            var val = this.filter.company_nama;

            if (val != this.CompanyLast) {
                this.Data = [];

                this.filter.company = null;
                this.filter.company_abbr = null;

                this.StorelocReset();
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

        }, 0);

    }
    CompanySelect(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter.company = item.id;
                this.filter.company_nama = item.nama;
                this.filter.company_abbr = item.abbr;

                this.CompanyLast = item.nama;

                this.Storeloc = item.store;
                this.StorelocKeep = item.store;

                this.LoadData(this.gridParams);
            }, 100);
        }
    }
    // => / END : AC Company

    /**
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocKeep: any = [];
    StorelocLast;
    async StorelocFilter() {

        setTimeout(() => {

            var val = this.filter.storeloc_nama;

            if (val != this.StorelocLast) {

                this.Data = [];

                this.filter.storeloc = null;
                this.filter.storeloc_kode = null;

                this.Storeloc = this.StorelocKeep;

            }

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.StorelocKeep) {

                    var Combine = item.kode + ' : ' + item.nama;
                    if (
                        item.kode.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.Storeloc = Filtered;

            } else {
                this.Storeloc = this.StorelocKeep;

                this.LoadData(this.gridParams);
            }

        }, 0);

    }
    StorelocSelect(e, item) {
        if (e.isUserInput) {

            setTimeout(() => {

                this.filter.storeloc = item.id;
                this.filter.storeloc_kode = item.kode;

                this.StorelocLast = item.nama;

                this.LoadData(this.gridParams);

            }, 100);

        }
    }
    StorelocReset() {
        /**
         * Reset Storeloc
         */
        this.Data = [];

        this.filter.storeloc = null;
        this.filter.storeloc_kode = null;
        this.filter.storeloc_nama = null;
        // => / END : Reset Storeloc
    }
    // => / END : AC Storeloc

    // ============================ GRID
    /**
     * Grid Options
     */
    limit = 100;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            width: 100,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep'
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history'
        },
        context: {
            parent: this
        },

        enableFilter: true,
        floatingFilter: true,
        animateRows: true,
        enableColResize: true,
        allowContextMenuWithControlKey: true,
        suppressScrollOnNewData: true,

        rowModelType: 'clientSide',
        rowBuffer: this.limit / 2,
        debug: false,
        rowSelection: 'multiple',
        rowDeselection: true,
        cacheOverflowSize: 2,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 1,
        cacheBlockSize: this.limit,
        maxBlocksInCache: 10
    };

    defaultExportParams = {
        suppressTextAsCDATA: true
    };
    // => / END : Grid Options

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;

        params.api.sizeColumnsToFit();
        // => / END : Reload
    }
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'COA CODE',
            field: 'coa_kode',
            suppressSizeToFit: true,
            width: 200
        },
        {
            headerName: 'COA NAME',
            field: 'coa_nama',
            suppressSizeToFit: true,
            width: 250
        },
        {
            headerName: 'OPENING QTY',
            field: 'sum_opening',
            suppressSizeToFit: true,
            width: 150,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right',
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'OPENING AMT',
            field: 'sum_opening_amt',
            suppressSizeToFit: true,
            width: 180,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right',
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'IN QTY',
            field: 'sum_debit',
            suppressSizeToFit: true,
            width: 150,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    // fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'IN AMT',
            field: 'sum_debit_amt',
            suppressSizeToFit: true,
            width: 180,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    // fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'OUT QTY',
            field: 'sum_credit',
            suppressSizeToFit: true,
            width: 150,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    // fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'OUT AMT',
            field: 'sum_credit_amt',
            suppressSizeToFit: true,
            width: 180,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'CLOSING QTY',
            field: 'close',
            suppressSizeToFit: true,
            width: 150,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    // fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        },
        {
            headerName: 'CLOSING AMT',
            field: 'close_amt',
            suppressSizeToFit: true,
            width: 180,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    // fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
        }
    ];
    // => / END : TableCol

    ExcelStyles = [
        {
            id: 'rupiah',
            numberFormat: {
                format: '#,##0.00'
            }
        }
    ];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        // console.log(this.filter);

        if (
            this.filter.fdari &&
            this.filter.fhingga &&
            this.filter.company
        ) {

            /**
             * Load Data
             */
            var Params = {
                NoLoader: 1,
                notimeout: 1
            };

            if (this.filter) {
                $.extend(Params, this.filter);
            }

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    this.perm = result.permissions;
                    var Data = [];
                    var DataItem = [];
                    var DataStore = [];
                    /**
                     * Reformat Data
                     */
                    Data = _.uniqBy(result.data, 'coa_kode');

                    // DataItem = _.uniqBy(result.data, 'item');

                    // DataStore = _.uniqBy(DataItem, 'storeloc');

                    // console.log(DataItem);
                    // console.log(DataStore);

                    // var DetailData = result.data;

                    console.log(Data);


                    for (let item of Data) {
                        item.sum_debit = 0;
                        item.sum_credit = 0;
                        item.sum_debit_amt = 0;
                        item.sum_credit_amt = 0;
                        item.sum_opening = 0;
                        item.sum_opening_amt = 0;
                        for (let value of result.data) {
                            if (item.coa_kode == value.coa_kode) {
                                item.sum_opening = Number(item.sum_opening) + Number(value.opening);
                                item.sum_opening_amt = item.sum_opening_amt + Number(value.opening_amt);
                                item.sum_debit = Number(item.sum_debit) + Number(value.debit);
                                item.sum_debit_amt = item.sum_debit_amt + Number(value.debit_amt);
                                item.sum_credit = Number(item.sum_credit) + Number(value.credit);
                                item.sum_credit_amt = item.sum_credit_amt + Number(value.credit_amt);
                            }
                        }
                        item.close = Number(item.sum_opening) + Number(item.sum_debit) - Number(item.sum_credit);
                        item.close_amt = Number(item.sum_opening_amt) + Number(item.sum_debit_amt) - Number(item.sum_credit_amt);
                    }


                    // => / END : Reformat Data 
                    this.gridApi.setRowData(Data);

                },
                error => {
                    console.error(error);
                    this.Data = [];
                }
            );

        }

    }
    // => / END : Load Data

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            return {};

            /*if(params.data.finish != 1){

                if(
                    params.data.finish_percent > 0
                ){
                    return {
                        color: 'blue',
                        fontStyle: 'italic'
                    }
                }else{
                    return {
                        color: 'red',
                        backgroundColor: '#fff799',
                        fontStyle: 'italic'
                    }
                }
            }*/

        }
    }
    // => / END : Grid Style

    /**
     * Filter Changed
     */
    FilterChanged(params) {

        var ParamsFilter = this.gridApi.getFilterModel();

        this.filter.ftable = JSON.stringify(ParamsFilter);

    }
    // => / END : Filter Changed

}
