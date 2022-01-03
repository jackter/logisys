import { Component } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
    selector: 'detail-tb-summary',
    templateUrl: './detail.html'
})
export class TBSummaryDialogComponent {

    nama: any;
    ComUrl: string;
    Params;
    Busy;
    filter: any = {};
    Data;

    GridReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialogRef<TBSummaryDialogComponent>
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
        //=> / END : Detail Container Size

    }

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
    //=> / END : Grid Options

    TableCol = [
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    var Tanggal = moment(params.value).format('DD/MM/YYYY');
                    return Tanggal;
                }
            }
        },
        {
            headerName: 'Account',
            field: 'account',
            width: 300,
            suppressSizeToFit: true
        },
        {
            headerName: 'Source',
            field: 'ref_kode',
            width: 175,
            suppressSizeToFit: true
        },
        {
            headerName: 'Description',
            field: 'keterangan',
            width: 175,
            suppressSizeToFit: false
        },
        {
            headerName: 'Debit',
            field: 'debit',
            width: 175,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };
                return Style;
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'Credit',
            field: 'credit',
            width: 175,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };
                return Style;
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah((params.value * -1), 2, true);
                    }
                }
            }
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
    //=> / END : Grid Ready

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

                        // var Params = {
                        //     offset: startRow,
                        //     limit: $this.limit,
                        //     NoLoader: 1,

                        //     company: $this.Params.company,
                        //     F_Start: $this.Params.F_Start,
                        //     F_End: $this.Params.F_End,
                        //     coa: $this.Params.coa
                        // }

                        var Params: any = {
                            offset: startRow,
                            limit: $this.limit,
                            NoLoader: 1,
                            fdari: $this.Params.fdari,
                            fhingga: $this.Params.fhingga,
                            company: $this.Params.company,
                            coa: $this.Params.coa
                        };

                        // console.log(Params);

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'detail', Params).subscribe(
                            result => {

                                if (result) {

                                    //$this.count = result.count;
                                    //$this.perm = result.permissions;

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
    //=> / END : Load Data


    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

        }
    }
    //=> / END : Grid Style

    /**
     * Filter Changed
     */
    FilterChanged(params) {

        var ParamsFilter = this.gridApi.getFilterModel();

        this.filter.ftable = JSON.stringify(ParamsFilter);

    }
    //=> / END : Filter Changed

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        return menu;

    }
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        //   this.OpenForm('detail-' + params.data.id);
    }
    //=> / END : Double Click
    //============================ END : GRID


}