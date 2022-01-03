import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { FuseConfigService } from 'fuse/services/config.service';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from "lodash";

@Component({
    selector: 'app-inv-aging-ar-summary',
    templateUrl: './inv-aging-ar-summary.component.html',
    styleUrls: ['./inv-aging-ar-summary.component.scss']
})
export class InvAgingArSummaryComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/report/inv-aging-ar-summary/";
    public Com: any = {
        name: 'Invoice Aging AR Summary',
        title: 'Invoice Aging AR Summary',
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
        private LS: LocalStorageService,
        public _fuseConfigService: FuseConfigService
    ) { 
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    folded: true
                }
            }
        };
    }

    ngOnInit(): void {
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
            }, 100);
        }
    }

    CompanyRemove() {
        this.filter.company = null;
        this.filter.company_abbr = null;
        this.filter.company_nama = null;
    }
    //=> / END : AC Company

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
            width: 150
        },
        {
            headerName: 'CUSTOMER NAME',
            field: 'cust_nama',
            suppressSizeToFit: false,
            width: 300
        },
        {
            headerName: 'AMOUNT',
            field: 'total_amount',
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
            headerName: 'CURRENT',
            field: 'total_current',
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
            field: 'total_due30',
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
            field: 'total_due60',
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
            field: 'total_due90',
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
            field: 'total_due_over',
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

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    this.DataReady = true;

                    if(result) {
                        
                        var GCust = Object.values(_.groupBy(result.data, 'cust'));

                        var Data = [];
                        for(let item of GCust) {
                            var TotalAmount = 0,
                                TotalCurrent = 0,
                                TotalDue30 = 0,
                                TotalDue60 = 0,
                                TotalDue90 = 0,
                                TotalDueOver = 0;
                            for(let detail of item) {
                                if(detail.amount) {
                                    TotalAmount += Number(detail.amount);
                                }
                                if(detail.due_curr) {
                                    TotalCurrent += Number(detail.due_curr);
                                }
                                if(detail.due_30) {
                                    TotalDue30 += Number(detail.due_30);
                                }
                                if(detail.due_60) {
                                    TotalDue60 += Number(detail.due_60);
                                }
                                if(detail.due_90) {
                                    TotalDue90 += Number(detail.due_90);
                                }
                                if(detail.due_over_90) {
                                    TotalDueOver += Number(detail.due_over_90);
                                }
                            }

                            Data.push({
                                cust: item[0].cust,
                                cust_kode: item[0].cust_kode,
                                cust_nama: item[0].cust_nama,
                                total_amount: TotalAmount,
                                total_current: TotalCurrent,
                                total_due30: TotalDue30,
                                total_due60: TotalDue60,
                                total_due90: TotalDue90,
                                total_due_over: TotalDueOver
                            });
                        }  

                        var OrderData = _.orderBy(Data, 'cust_nama', ['asc']);

                        this.perm = result.permissions;
                        this.gridApi.setRowData(OrderData);

                        this.Data = OrderData;
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

}
