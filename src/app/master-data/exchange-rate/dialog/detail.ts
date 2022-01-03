import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-detail-report-item',
    templateUrl: './detail.html'
})
export class ExchangeRateDetailDialogComponent implements OnInit {

    nama: any;
    ComUrl: string;
    form: any = {};
    Params;
    Busy;
    filter: any = {};
    Data;

    GridReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialogRef<ExchangeRateDetailDialogComponent>
    ) {

    }

    ngOnInit() {

        setTimeout(() => {
            this.GridReady = true;
        }, 1000);

        /**
         * Detail Container Size
         */
        var H = $(window).height();
        var W = $(window).width();
        $('#detail-container').height(H / 2).width(W);
        // => / END : Detail Container Size

    }

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
                newRowsAction: "keep"
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history',
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

        rowModelType: 'serverSide',
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
    // => / END : Grid Options

    TableCol = [
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    var Tanggal = moment(params.value, 'YYYY-MM-DD').format('DD MMM YYYY');
                    return Tanggal;
                }
            }
        },
        {
            headerName: 'Currency Code',
            field: 'cur_kode',
            width: 150,
            suppressSizeToFit: true,
        },
        {
            headerName: 'Currency Name',
            field: 'cur_nama',
            width: 150,
        },
        {
            headerName: 'Rate',
            field: 'rate',
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: "keep"
            },
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                if (params.data) {
                    var Default: any = {
                        textAlign: 'right',
                        fontWeight: 'bold',
                    };

                    Default.color = "red";

                    return Default;
                }

            },
        },
        {
            headerName: 'Country',
            field: 'country',
            width: 150,
        }
    ];

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;

        params.api.sizeColumnsToFit();

        this.LoadData(params);
    }
    // => / END : Grid Ready

    /**
    * Load Data
    */
    DelayData;
    LoadData(params) {
        const $this = this;
        const dataSource = {
            getRows(params): void {
                clearTimeout($this.DelayData);
                $this.DelayData = setTimeout(() => {
                    if (!$this.Busy) {
                        $this.Busy = true;

                        const startRow = params.request.startRow;
                        const endRow = params.request.endRow;
                        const Params = {
                            offset: startRow,
                            limit: $this.limit,
                            NoLoader: 1,
                            tgl: $this.form.tgl
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'detail', Params).subscribe(
                            result => {
                                setTimeout(() => {
                                    let lastRow = -1;
                                    let rowsThisPage = [];

                                    if (result) {
                                        $this.Data = result.data;
                                        rowsThisPage = result.data;

                                        if (result.count <= endRow) {
                                            lastRow = result.count;
                                        }
                                    } else {
                                        lastRow = result.count;
                                    }
                                    params.successCallback(rowsThisPage, lastRow);
                                    $this.Busy = false;
                                }, 100);
                            },
                            error => {
                                console.error(error);
                                $this.core.OpenNotif(error);
                                $this.Busy = false;
                            }
                        );
                    }
                }, 100);
            }
        };
        params.api.setServerSideDatasource(dataSource);
    }
    // => / END : Load Data


    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

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

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        return menu;

    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        //   this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click
    // ============================ END : GRID


}