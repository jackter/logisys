import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import { TrxFormDialogComponent } from './dialog/form';
import * as moment from 'moment';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
    animations: fuseAnimations
})
export class TransactionComponent implements OnInit {

    ComUrl = 'e/wb/transaction/';

    public Com: any = {
        name: 'All Transaction Data',
        title: 'All Transaction',
        icon: 'assessment',
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
        public dialog: MatDialog
    ) { }

    ngOnInit() {
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
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep',
            },
            cellStyle: this.RowStyle,
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
            headerName: 'Date',
            field: 'create_date',
            width: 200,
            minWidth: 200,
            valueGetter: function (params) {
                if (params.data) {
                    // console.log(params);
                    var Date = moment(params.data.create_date).format('DD/MM/YYYY HH:mm:ss');
                    return Date;

                }
            }
        },
        {
            headerName: 'WB',
            field: 'wb',
            width: 80,
            minWidth: 80
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 150,
            minWidth: 150
            // suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'No. Contract',
            field: 'contract_no',
            width: 200,
            minWidth: 200,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'No. DO',
            field: 'do_no',
            width: 200,
            minWidth: 200
        },
        {
            headerName: 'Ticket No.',
            field: 'ticket_no',
            width: 150,
            minWidth: 150
        },
        {
            headerName: 'Vehicle',
            field: 'veh_nopol',
            width: 100,
            minWidth: 100,
            pinned: 'left'
        },
        // {
        //     headerName: 'Supplier',
        //     field: 'sup_cust_nama',
        //     width: 200,
        //     suppressSizeToFit: true,
        //     //cellStyle: this.RowStyle,
        // },
        {
            headerName: 'Transporter',
            field: 'transporter_nama',
            // suppressSizeToFit: true,
            width: 200,
            minWidth: 200
        },
        {
            headerName: 'Weigh IN',
            field: 'weigh_in',
            // suppressSizeToFit: true,
            width: 75,
            minWidth: 75,
            pinned: 'left',
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                if (!params.data.weigh_out) {

                    Style = {
                        color: 'red',
                        backgroundColor: '#fff799',
                        fontStyle: 'italic',
                        textAlign: 'right'
                    };
                }

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
            width: 75,
            minWidth: 75,
            pinned: 'left',
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                if (!params.data.weigh_out) {

                    Style = {
                        color: 'red',
                        backgroundColor: '#fff799',
                        fontStyle: 'italic',
                        textAlign: 'right'
                    };
                }

                return Style;
            },
            // suppressSizeToFit: true,
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
            width: 75,
            minWidth: 75,
            pinned: 'left',
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                if (!params.data.weigh_out) {

                    Style = {
                        color: 'red',
                        backgroundColor: '#fff799',
                        fontStyle: 'italic',
                        textAlign: 'right'
                    };
                }
                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;
                    return $this.core.rupiah(Number(data.netto));

                }
            }
        },
        {
            headerName: 'Status',
            field: 'status_data',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'PENDING',
                            'FINISH'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 150,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.weigh_in && !params.data.weigh_out) {
                        return 'PENDING, IN PROGRESS';
                    } else {
                        return 'FINISH';
                    }

                }
            }
        }

    ];
    // => / END : TableCol

    /**
     * RowStyle
     */
    RowStyle(params) {

        if (params.data) {

            if (!params.data.weigh_out) {
                return {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }

        }

    }
    // => / END : RowStyle

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

                                if (result) {

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
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenForm(params.data.id);
    }
    // => / END : Double Click

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        return menu;

    }
    // => / END : Context Menu
    // ============================ END : GRID

    /**
    * Form Dialog
    */
    dialogRef: MatDialogRef<TrxFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        var Params = {
            id: id
        };

        this.core.Do(this.ComUrl + 'get', Params).subscribe(
            result => {

                if (result) {
                    this.form = result.data;

                    this.ShowFormDialog();
                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );

    }
    ShowFormDialog() {

        this.dialogRef = this.dialog.open(
            TrxFormDialogComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = this.Default;
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = this.form;
        // => / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogRef.afterClosed().subscribe(result => {

            this.dialogRef = null;

        });
        // => / END : After Dialog Close

    }

}
