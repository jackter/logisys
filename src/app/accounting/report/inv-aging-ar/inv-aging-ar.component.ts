import { Component, OnInit } from '@angular/core';
import { FuseConfigService } from 'fuse/services/config.service';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from "lodash";
import { fuseAnimations } from 'fuse/animations';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-inv-aging-ar',
    templateUrl: './inv-aging-ar.component.html',
    styleUrls: ['./inv-aging-ar.component.scss'],
    animations: fuseAnimations
})
export class InvAgingArComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/report/inv-aging-ar/";
    public Com: any = {
        name: 'Invoice Aging AR',
        title: 'Invoice Aging AR',
        icon: 'payment',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    DataReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialog,
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

    Reload() {
        this.LoadData(this.gridParams);
    }

    FocusCompany(){
        $('*[name="company_nama"]').focus();
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
                    }
                    //=> / Check Company
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );
    }
    //=> / END : Load Default

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

                $('*[name="Cust_nama"]').focus();
            }, 100);
        }
    }

    CompanyRemove() {
        this.filter.company = null;
        this.filter.company_abbr = null;
        this.filter.company_nama = null;
    }
    //=> / END : AC Company

    /**
     * AC Cust
     */
    Customer: any;
    CustomerDef: any;
    CustFilter(val: string) {

        setTimeout(() => {

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.CustomerDef) {

                    var Combine = item.cust_nama + ' (' + item.cust_kode + ')';
                    if (
                        item.cust_kode.toLowerCase().indexOf(val) != -1 ||
                        item.cust_nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.Customer = Filtered;

            } else {
                this.Customer = this.CustomerDef;
            }
        });
    }
    CustSelect(e, item) {

        if (e.isUserInput) {

            this.filter.cust = item.cust;
            this.filter.cust_kode = item.cust_kode;
            this.filter.cust_nama = item.cust_nama;

            this.LoadData(this.gridParams);
        }
    }
    CustRemove() {
        this.filter.cust = null;
        this.filter.cust_kode = null;
        this.filter.cust_nama = null;

        this.LoadData(this.gridParams);
    }
    //=> END : AC Cust

    //============================ GRID
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
                newRowsAction: "keep"
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
    //=> / END : Grid Options

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;

        params.api.sizeColumnsToFit();

        this.LoadData(params);
    }
    //=> / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'CUSTOMER CODE',
            field: 'cust_kode',
            suppressSizeToFit: true,
            width: 100,
            colSpan(params) {
                if (params.data) {
                    return params.data.colspan;
                }
            },
            cellStyle(params) {
                if (params.data) {
                    if (params.data.is_header == 1) {
                        return {
                            fontWeight: 'bold'
                        }
                    }
                }
            }
        },
        {
            headerName: 'CUSTOMER NAME',
            field: 'cust_nama',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'CODE',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'DATE',
            field: 'inv_tgl',
            suppressSizeToFit: true,
            width: 125,
            valueFormatter(params) {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'AMOUNT',
            field: 'amount',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE DATE',
            field: 'due_date',
            suppressSizeToFit: true,
            width: 125,
            valueFormatter(params) {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'CURRENT',
            field: 'due_curr',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 1 - 30',
            field: 'due_30',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 30 - 60',
            field: 'due_60',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 60 - 90',
            field: 'due_90',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 91 - OVER',
            field: 'due_over_90',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        }
    ];
    //=> / END : TableCol

    ExcelStyles = [
        {
            id: 'rupiah',
            numberFormat: {
                format: "#,##0.00"
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

        this.DataReady = false;

        if (
            this.filter.tgl_aging &&
            this.filter.company
        ) {
            this.filter.tgl_aging_send = moment(this.filter.tgl_aging).format('YYYY-MM-DD');

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

            this.gridApi.showLoadingOverlay();

            console.log(Params);
            

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    this.DataReady = true;

                    if (result) {

                        var GCust = Object.values(_.groupBy(result.data, 'cust'));

                        var Data = [];
                        var Cust = [];
                        for (let item of GCust) {

                            if (item) {

                                Cust.push({
                                    cust: item[0].cust,
                                    cust_kode: item[0].cust_kode,
                                    cust_nama: item[0].cust_nama
                                });

                                Data.push({
                                    is_header: 1,
                                    cust_kode: item[0].cust_nama.toUpperCase(),
                                    colspan: 11
                                });

                                for (let detail of item) {
                                    if (detail) {
                                        detail.colspan = 1;
                                        detail.is_detail = 1;
                                    }
                                    Data.push(detail);
                                }

                                Data.push({
                                    no_val: true,
                                    colspan: 11
                                });
                            }
                        }

                        this.perm = result.permissions;
                        this.gridApi.setRowData(Data);
                        this.Data = GCust;
                        this.Customer = Cust;
                        this.CustomerDef = Cust;
                        
                    }
                },
                error => {
                    console.error(error);
                    this.Data = [];
                }
            );
        }
    }
    //=> / END : Load Data

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            return {};

        }
    }
    //=> / END : Grid Style

}
