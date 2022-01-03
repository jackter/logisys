import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { Router } from '@angular/router';
import { FuseConfigService } from 'fuse/services/config.service';
import { fuseAnimations } from 'fuse/animations';

@Component({
	selector: 'app-actual-production2',
	templateUrl: './actual-production2.component.html',
    styleUrls: ['./actual-production2.component.scss'],
    animations: fuseAnimations
})
export class ActualProduction2Component implements OnInit {

    ComUrl = "e/manufacturing/ap2/";

    public Com: any = {
        name: 'Actual Production Data',
        title: 'Actual Production',
        icon: 'event_note',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

	constructor(
        private core: Core,
        private router: Router,
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

    ngOnInit() {
    }

    /**
     * Reload Data
     */
    Reload() {
    	// this.LoadData(this.gridParams);
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
            minWidth: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: "keep"
            },
            cellStyle: this.RowStyle
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
        maxBlocksInCache: 2
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
            headerName: 'Create Date',
            field: 'create_date',
            width: 125,
            suppressSizeToFit: true
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 175,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Storage Location',
            field: 'storeloc_kode',
            width: 150,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Plant',
            field: 'plant',
            suppressSizeToFit: true,
            width: 125,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (params.data.plant == 1) {
                        Return = 'Refinery';
                    } else {
                        Return = 'Fractionation';
                    }

                    return Return;
                }
            }
        },
        {
            headerName: 'Description',
            field: 'description',
            tooltipField: 'description',
            // suppressSizeToFit: true,
            width: 300,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Target',
            field: 'qty',
            tooltipField: 'qty',
            width: 125,
            minWidth: 125,
            valueFormatter: function (params) {
                if (params.data) {
                    var data = params.data;
                    var $this = params.context.parent;
                    return $this.core.rupiah(params.value) + ' ' + data.satuan;
                }
            },
            cellStyle: function (params) {
                if (params.data) {
                    if(params.data.finish == 1){
                        return {
                            textAlign: 'right',
                            backgroundColor: '#CCC',
                            fontStyle: 'italic'
                        };
                    }else{
                        return {
                            textAlign: 'right',
                        }
                    }
                }
            }
        },
        {
            headerName: 'Productions',
            filter: false,
            width: 125,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var data = params.data;
                var $this = params.context.parent;

                if (data.total_actual_production) {
                    var Val = $this.core.rupiah((Number(data.total_actual_production)));
                    return Val + ' ' + data.satuan;
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {
                if (params.data) {
                    if(params.data.finish == 1){
                        return {
                            textAlign: 'right',
                            backgroundColor: '#CCC',
                            fontStyle: 'italic'
                        };
                    }else{
                        return {
                            textAlign: 'right',
                        }
                    }
                }
            }
        },
        {
            headerName: 'Progress',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var data = params.data;
                var $this = params.context.parent;

                if (data.total_actual_production) {
                    var Val = $this.core.rupiah((Number(data.total_actual_production) / Number(data.qty)) * 100, 2);
                    return Val + '%';
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {
                if (params.data) {
                    if(params.data.finish == 1){
                        return {
                            textAlign: 'right',
                            backgroundColor: '#CCC',
                            fontStyle: 'italic'
                        };
                    }else{
                        return {
                            textAlign: 'right',
                        }
                    }
                }
            }
        },
        {
            headerName: 'FG Code',
            field: 'item_kode',
            tooltipField: 'item_kode',
            minWidth: 75,
        },
        {
            headerName: 'Finish Goods',
            field: 'nama',
            tooltipField: 'nama',
            minWidth: 300,
        },

    ];
    // => / END : TableCol

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
                            NoLoader: 1
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'data', Params).subscribe(
                            result => {

                                // $this.count = result.count;
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
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        return menu;

    }
    // => / END : Get Context Menu

    /**
     * Filter Changed
     */
    FilterChanged(params) {

        var ParamsFilter = this.gridApi.getFilterModel();

        this.filter.ftable = JSON.stringify(ParamsFilter);

    }
    // => / END : Filter Changed

    /**
     * Double Click
     */
    onDoubleClick(params) {

    }
    // => / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.finish == 1) {

                return {
                    backgroundColor: '#CCC',
                    fontStyle: 'italic'
                };
            }
        }
    }
    // => / END : Grid Style

    /**
     * Click
     */
    onClick(params) {
        this.router.navigate(['/manufacturing/actual_production2/detail/' + params.data.id]);
    }
    // => / END : Click

    // ============================ END : GRID

}
