import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-detail-report-ac',
    templateUrl: './detail.html'
})
export class ReportACDetailDialogComponent implements OnInit {

    nama: any;
    ComUrl: string;
    Params;
    Busy;
    filter: any = {};
    Data;

    GridReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialogRef<ReportACDetailDialogComponent>
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

     //============================ GRID ===============================
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
            // cellStyle: this.RowStyle,
            // tooltipField: 'history'
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
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.data.is_header && params.data.no_val) {
                        var Tanggal = moment(params.value, 'YYYY-MM-DD').format('DD-MM-YYYY');
                        return Tanggal;
                    } else {
                        return params.value;
                    }
                }
            },
            cellStyle: function (params) {
                var Style: any = {
                };
                if (params.data.is_header) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            },
        },
        {
            headerName: 'Kode',
            field: 'kode',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {
                };
                if (params.data.is_header) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            }
        },
        {
            headerName: 'Product',
            field: 'nama',
            width: 200,
            // suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {};

                if (params.data.is_header) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            }
        },
        {
            headerName: 'JO QTY',
            field: 'jo_qty',
            width: 200,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var $this = params.context.parent;
                if(params.data.is_header || params.data.no_val){
                    return ""
                }else{

                    if (params.data && params.value) {
                        return $this.core.rupiah(params.value, 2, true) + ' ' + params.data.satuan;
                    }else{
                        return '-'
                    }
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                    };

                    var Style = {};
                    Style = get.parent.RowStyle(params);


                    $.extend(Style, Default);

                    return Style;
                }

            },
        },
        {
            headerName: 'SR QTY',
            field: 'qty',
            width: 200,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var $this = params.context.parent;
                if(params.data.is_header || params.data.no_val){
                    return ""
                }else{

                    if (params.data && params.value) {
                        return $this.core.rupiah(params.value, 2, true) + ' ' + params.data.satuan;
                    }else{
                        return '-'
                    }
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                    };

                    var Style = {};
                    Style = get.parent.RowStyle(params);


                    $.extend(Style, Default);

                    return Style;
                }

            },
        },

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
        var $this = this;

        if (
            $this.Params.periode.start &&
            $this.Params.periode.end
        ) {

            /**
             * Load Data
             */
            var Params = {
                NoLoader: 1,
                fdari: moment($this.Params.periode.start).format('YYYY-MM-DD'),
                fhingga: moment($this.Params.periode.end).format('YYYY-MM-DD'),
                id:$this.Params.id
            };

            // console.log(Params);
            

            this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'detail', Params).subscribe(
                result => {

                    var Formatted = [];

                    if (result && result.data) {

                        var Data = result.data;

                        for (let item of Data) {
                            Formatted.push({
                                no_val: true
                            });

                            Formatted.push({
                                is_header: true,
                                kode: item.kode,
                                tanggal: item.tanggal
                            });

                            if (item.detail) {

                                for (let detail of item.detail) {

                                    Formatted.push(detail);

                                }
                            }
                        }

                    }
                    this.gridApi.setRowData(Formatted);

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

        var data = params.node.data;
        var get = params.context;

        menu.push('copy');
        menu.push('excelExport');

        return menu;

    }
    //=> / END : Context Menu


    /**
     * Double Click
     */
    onDoubleClick(params) {

    }
    //=> / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.is_header) {
                return {
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                };
            } else {
                return {};
            }

        }
    }
    //=> / END : Grid Style
    //============================ END : GRID ==============================
}