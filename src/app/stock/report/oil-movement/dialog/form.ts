import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-report-oil-movement',
    templateUrl: './form.html'
})
export class ReportOilMovementDetailDialogComponent implements OnInit {

    ComUrl: string;
    Busy;
    filter: any = {};
    Data;

    GridReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialogRef<ReportOilMovementDetailDialogComponent>
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
    //=> / END : Grid Options

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter(params) {
                if(params.value) {
                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'Temp (C)',
            field: 'temp',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 0);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Sounding (cm)',
            field: 'tinggi',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 2, true);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Opening',
            field: 'opening',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 2, true);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Receive',
            field: 'receive',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 2, true);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Issued',
            field: 'issued',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 2, true);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Closing',
            field: 'closing',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 2, true);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Diff',
            field: 'diff',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value) {
                    return get.parent.core.rupiah(params.value, 2, true);
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Resume',
            field: 'resume',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Remarks',
            field: 'keterangan',
            width: 200,
            suppressSizeToFit: false
        }
    ];
    //=> / END : TableCol

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

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
        
        var DataSounding = [];
        for(let item of this.Data.detail) {

            if(item.closing) {
                DataSounding.push(item);
            }
        }

        this.gridApi.showLoadingOverlay();
        this.gridApi.setRowData(DataSounding);

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
