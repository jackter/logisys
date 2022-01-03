import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { Core } from 'providers/core';
import { fuseAnimations } from 'fuse/animations';
import * as XLSX from 'xlsx';

@Component({
    selector: 'all-job-alocation-detail',
    templateUrl: './print.html',
    animations: fuseAnimations
})
export class AllJobAlocationDetailComponent implements OnInit {

    ComUrl = 'e/master/job_alocation/';

    public Com: any = {
        name: 'Job Alocation',
        title: 'List Job Alocation',
        icon: 'view_list',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    GridReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialog
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

    /**
   * Reload Data
   */
    Reload() {
        this.LoadData(this.gridParams);
    }
    // => END : Reload Data

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
            // cellStyle: this.RowStyle,
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
        this.LoadData(params);
    }
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_nama',
            suppressSizeToFit: true,
            suppressFilter: true,
            width: 200
        },
        {
            headerName: 'COA Code',
            field: 'coa_kode',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'COA Name',
            field: 'coa_nama',
            suppressSizeToFit: true,
            width: 200
        },
        {
            headerName: 'Job Alocation',
            field: 'nama',
            suppressSizeToFit: false,
            width: 200
        }
    ];
    // => / END : TableCol

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
                            company: $this.filter.company
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'all.data', Params).subscribe(
                            result => {

                                $this.perm = result.permissions;

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

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        menu.push({
            name: 'Export to Excel (.xls) - Formatted',
            icon: '<i class="fa fa-external-link-square" style="font-size: 18px; padding-top: 2px;"></i>',
            action: function () {

                var FileName = get.parent.filter.company_nama;

                var params = {
                    columnGroups: true,
                    fileName: 'Job Alocation ' + FileName,
                    sheetName: 'Job Alocation'
                };

                get.parent.gridApi.exportDataAsExcel(params);
            }
        });

        menu.push("separator");

        menu.push({
            name: 'Export to Excel (.xlsx)',
            icon: '<i class="fa fa-external-link-square" style="font-size: 18px; padding-top: 2px;"></i>',
            action: function () {

                var content = get.parent.gridApi.getDataAsExcel(params);

                var workbook = XLSX.read(content, {
                    type: "binary"
                });
                var xlsxContent = XLSX.write(workbook, {
                    bookType: "xlsx",
                    type: "base64",
                });

                var FileName = get.parent.filter.company_nama;
                FileName = "Job Alocation " + FileName;

                get.parent.core.DownloadExcel(params, xlsxContent, FileName);

            }
        });

        return menu;

    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        // this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            return {
                color: 'rgba(0, 0, 0, 0.87)',
                backgroundColor: '#e8f756',
                fontStyle: 'italic'
            };
        }
    }
    // => / END : Grid Style
    // ============================ END : GRID

}
