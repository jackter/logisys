import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-detail',
    templateUrl: './detail.html',
    styleUrls: ['../contract2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailContract2FormDialogComponent implements OnInit {

    kode: any;
    ComUrl: string;
    Params;
    Busy;
    filter: any = {};
    Data;
    form: any = {};

    GridReady: boolean = false;

    constructor(
        public core: Core,
        public dialogRef: MatDialogRef<DetailContract2FormDialogComponent>
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
                newRowsAction: 'keep'
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

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Date',
            field: 'create_date',
            width: 100,
            valueGetter: function (params) {
                if (params.data) {
                    var Date = moment(params.data.create_date).format('DD/MM/YYYY');
                    return Date;

                }
            }
        },
        {
            headerName: 'Contract',
            field: 'contract_no',
            width: 200,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'No. DO',
            field: 'do_no',
            width: 200
        },
        {
            headerName: 'Transporter',
            field: 'transporter_nama',
            // suppressSizeToFit: true,
            width: 200,
        },
        {
            headerName: 'Weigh IN',
            field: 'weigh_in',
            width: 100,
            // suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;
                    return $this.core.rupiah(Number(data.weigh_in));

                }
            }
        },
        {
            headerName: 'Weigh OUT',
            field: 'weigh_out',
            width: 100,
            // suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;
                    return $this.core.rupiah(Number(data.weigh_out));

                }
            }
        },
        {
            headerName: 'Netto',
            field: 'netto',
            width: 100,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;
                    return $this.core.rupiah(Number(data.netto));

                }
            }
        }
    ];
    // => / END : TableCol

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
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

        }
    }
    // => / END : Grid Style

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {
        var $this = this;

        var dataSource = {
            getRows: function (params) {

                clearTimeout($this.DelayData);
                $this.DelayData = setTimeout(() => {

                    if (!$this.Busy) {

                        $this.Busy = true;

                        var startRow = params.request.startRow;
                        var endRow = params.request.endRow;

                        var Params = {
                            offset: startRow,
                            limit: $this.limit,
                            NoLoader: 1,

                            id: $this.Params.id
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'get.detail', Params).subscribe(
                            result => {

                                if (result) {

                                    setTimeout(() => {

                                        var lastRow = -1;
                                        var rowsThisPage = [];

                                        if (result.data) {

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

                                }

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

    }
    // => / END : Context Menu

}
