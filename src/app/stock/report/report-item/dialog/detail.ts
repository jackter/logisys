import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-detail-report-item',
    templateUrl: './detail.html'
})
export class ReportItemDetailDialogComponent implements OnInit {

    nama: any;
    ComUrl: string;
    Params;
    Busy;
    filter: any = {};
    Data;

    GridReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialogRef<ReportItemDetailDialogComponent>
    ) {

    }

    ngOnInit() {

        console.log(this.Params);

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

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'PT',
            field: 'company_abbr',
            suppressSizeToFit: true,
            width: 50
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Date',
            field: 'tanggal',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'Ref. Code',
            field: 'ref_kode',
            suppressSizeToFit: true,
            width: 175
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'OPEN',
            field: 'saldo',
            suppressFilter: true,
            suppressSizeToFit: true,
            width: 75,
            cellStyle: {
                textAlign: 'right'
            },
            valueGetter: function (params) {
                var get = params.context;
                if (
                    params.data && 
                    params.data.is_header != 1
                ) {

                    /**
                     * Normalisasi stock open from close before
                     */
                    var Prev = params.api.getDisplayedRowAtIndex(params.node.id - 1);
                    if(
                        Prev && 
                        params.data.is_header != 1 && 
                        Prev.data.saldo_akhir
                    ){
                        params.data.saldo = Number(Prev.data.saldo_akhir);
                    }
                    //=> / END : Normalisasi stock open from close before

                    if (params.data.saldo != 0) {
                        return get.parent.core.rupiah(params.data.saldo, 2, true);
                    } else {
                        return "-";
                    }
                }
            }
        },
        {
            headerName: 'IN',
            field: 'debit',
            suppressFilter: true,
            suppressSizeToFit: true,
            width: 75,
            cellStyle: {
                textAlign: 'right'
            },
            valueGetter: function (params) {
                var get = params.context;
                if (params.data) {
                    if (params.data.debit > 0) {
                        return get.parent.core.rupiah(params.data.debit);
                    } else {
                        return "-";
                    }
                }
            }
        },
        {
            headerName: 'OUT',
            field: 'credit',
            suppressFilter: true,
            suppressSizeToFit: true,
            width: 75,
            cellStyle: {
                textAlign: 'right'
            },
            valueGetter: function (params) {
                var get = params.context;
                if (params.data) {
                    if (params.data.credit > 0) {
                        return get.parent.core.rupiah(params.data.credit);
                    } else {
                        return "-";
                    }
                }
            }
        },
        {
            headerName: 'CLOSE',
            // field: 'saldo_akhir',
            suppressFilter: true,
            suppressSizeToFit: true,
            width: 75,
            cellStyle: {
                textAlign: 'right'
            },
            valueGetter: function (params) {
                var get = params.context;
                if (
                    params.data && 
                    params.data.is_header != 1
                ){

                    var saldo_akhir = (Number(params.data.saldo) + Number(params.data.debit)) - Number(params.data.credit);

                    params.data.saldo_akhir = Number(saldo_akhir);

                    return get.parent.core.rupiah(saldo_akhir, 2, true);

                    // if (params.data.saldo_akhir > 0) {
                    //     return get.parent.core.rupiah(params.data.saldo_akhir);
                    // } else {
                    //     return "-";
                    // }
                }
            }
        },
        {
            headerName: 'Location',
            field: 'storeloc_kode',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Created By',
            field: 'create_by',
            tooltipField: 'create_by',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Description',
            field: 'keterangan',
            tooltipField: 'ketereangan'
        },
    ];
    //=> / END : TableCol

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
     * Grid Style
     */
    RowStyle(params) {

        var Style: any = {};

        if (params.data) {

            if(params.data.is_header == 1){
                Style = {
                    fontWeight: 'bold'
                }
            }

        }

        return Style;
    }
    //=> / END : Grid Style

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

                            periode_start: moment($this.Params.periode.start).format('YYYY-MM-DD'),
                            periode_end: moment($this.Params.periode.end).format('YYYY-MM-DD'),
                            company: $this.Params.company,
                            storeloc: $this.Params.storeloc,
                            item: $this.Params.item
                        };

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

                                            // rowsThisPage = result.data;

                                            /**
                                             * Insert Storage Nama sebagai header
                                             */
                                            var LastStore;
                                            var NewData: any[] = [];
                                            for(let item of result.data){
                                                
                                                if(LastStore != item.storeloc_kode){
                                                    LastStore = item.storeloc_kode;

                                                    NewData.push({
                                                        tanggal: item.storeloc_kode,
                                                        ref_kode: item.storeloc_nama,
                                                        is_header: 1
                                                    });

                                                    result.count = Number(result.count) + 1;
                                                }

                                                NewData.push(item);
                                            }
                                            rowsThisPage = NewData;
                                            //=> / END : Insert Storage Nama sebagai header

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

    }
    //=> / END : Context Menu

}
