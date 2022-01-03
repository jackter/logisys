import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-contract-progress',
    templateUrl: './contract-progress.component.html',
    styleUrls: ['./contract-progress.component.scss'],
    animations: fuseAnimations

})
export class ContractProgressComponent implements OnInit {

    ComUrl = "e/wb/report/contract/";

    public Com: any = {
        name: 'Contract Data',
        title: 'Contract Progress',
        icon: 'description',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data;

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
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
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: "keep",
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
            headerName: 'Contract No.',
            field: 'kode',
            width: 300,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Qty Contract',
            field: 'qty',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish != 1) {

                        Style = {
                            color: 'red',
                            backgroundColor: '#fff799',
                            fontStyle: 'italic',
                            textAlign: 'right'
                        };
                    }

                    return Style;
                }
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
            headerName: 'Qty Src',
            field: 'qty_src',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish != 1) {

                        Style = {
                            color: 'red',
                            backgroundColor: '#fff799',
                            fontStyle: 'italic',
                            textAlign: 'right'
                        };
                    }

                    return Style;
                }
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
            headerName: 'Qty SBI',
            field: 'qty_sbi',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish != 1) {

                        Style = {
                            color: 'red',
                            backgroundColor: '#fff799',
                            fontStyle: 'italic',
                            textAlign: 'right'
                        };
                    }

                    return Style;
                }
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
            headerName: 'Progress',
            valueFormatter: function (params) {
                var data = params.data;
                var $this = params.context.parent;

                if (data) {

                    var Val = $this.core.rupiah(((data.qty_sbi) / (data.qty)) * 100, 2);
                    return Val + '%';

                } else {
                    return '-';
                }
            }
        },
    ];
    //=> / END : TableCol



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
                            notimeout: 1
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'data', Params).subscribe(
                            result => {

                                if (result) {

                                    //$this.count = result.count;
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

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit) {
            menu.push({
                name: 'Edit',
                action: function () {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
                ]
            });
        }

        if (get.parent.perm.hapus) {
            menu.push('separator');
            menu.push({
                name: 'Delete',
                action: function () {
                    get.parent.Delete(data);
                },
                icon: '<i class="fa fa-trash red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'red-fg'
                ]
            });
        }

        return menu;

    }
    //=> / END : Context Menu


    /**
     * Double Click
     */
    onDoubleClick(params) {
        // this.OpenForm('detail-' + params.data.id);
    }
    //=> / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.finish != 1) {

                return {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }
        }
    }
    //=> / END : Grid Style
    //============================ END : GRID ==============================

}
