import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-shipping',
    templateUrl: './shipping.component.html',
    styleUrls: ['./shipping.component.scss'],
    animations: fuseAnimations
})
export class ShippingComponent implements OnInit {

    ComUrl = 'e/so/shipping/';

    public Com: any = {
        name: 'Shipping Instruction',
        title: 'Material Sales Order to be Deliver',
        icon: 'directions_boat',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy: any;

    Data: any;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private router: Router

    ) {

    }

    ngOnInit() {
        this.LoadDefault();
        // this.Broadcast();
    }

    // ngOnDestroy() {
    //     this.Broad.unsubscribe();
    // }

    /**
     * Reload Data
     */
    Reload() {
        this.LoadData(this.gridParams);
    }
    // => END : Reload Data

    /**
     * Filter
     */
    ShowFilter: boolean = false;
    ToggleFilter(shown) {

        if (shown) {
            this.DFilter = {};
            this.ShowFilter = false;
        } else {
            this.ShowFilter = true;

            setTimeout(() => {
                $('*[name="item_keyword"]').focus();
            }, 250);
        }

    }

    GoFilter(load = false) {
        clearTimeout(this.DelayData);
        this.DelayData = setTimeout(() => {

            this.filter.ftable = {};

            /**
             * Get Grid API Filter
             */
            var ParamsFilter = this.gridApi.getFilterModel();
            if (ParamsFilter) {
                for (let key in ParamsFilter) {
                    this.DFilter[key] = ParamsFilter[key].filter;
                }
            }
            // => END : Get Grid API Filter

            if (!this.core.isEmpty(this.DFilter)) {
                for (let key in this.DFilter) {
                    if (key) {
                        var Val = this.DFilter[key];
                        if (Val) {
                            if (Val._isMomentObject) {
                                Val = moment(Val).format('YYYY-MM-DD');
                            }

                            var Filter = {
                                key: 'contains',
                                filterType: 'text',
                                filter: Val
                            };
                            this.filter.ftable[key] = Filter;
                        }
                    }
                }
            }

            if (load) {
                this.filter.ftable = JSON.stringify(this.filter.ftable);
                this.LoadData(this.gridParams);
            }
        }, 800);
    }
    // => END : Filter

    /**
     * Load Default
     */
    LoadDefault() {

        var Params = {
            NoLoader: 1
        };

        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {

                if (result) {
                    // this.Default = result;

                    this.perm = result.permissions;
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Load Default

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
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Contract Date',
            field: 'tanggal',
            suppressSizeToFit: true
        },
        {
            headerName: 'Contract Code',
            field: 'kontrak_kode',
            suppressSizeToFit: true,
            width: 175
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'SO Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Product',
            field: 'item_kode',
            suppressSizeToFit: true,
            width: 175
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Finish',
            suppressFilter: true,
            valueGetter: function (params) {
                var get = params.context;
                if (params.data) {

                    var Qty = Number(params.data.qty_so);
                    var QtyDelive = Number(params.data.qty_shipping);

                    var Finish = QtyDelive / Qty * 100;


                    if(Finish) {
                        return get.parent.core.rupiah(Finish) + '%';
                    } else {
                        return '0%';
                    }
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish != 1) {

                        var Style = {};
                        Style = get.parent.RowStyle(params);

                        if (params.data.finish_percent > 0) {
                            Default.color = 'blue';
                            Default.fontStyle = 'italic';
                        } else {
                            Default.color = 'red';
                            Default.backgroundColor = '#fff799';
                            Default.fontStyle = 'italic';
                        }

                        $.extend(Style, Default);

                        return Style;
                    } else {
                        return Default;
                    }
                }

            }
        },
        {
            headerName: 'Status',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'Draft',
                            'Verified'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            // suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (params.data.finish_percent > 0) {
                        Return = 'DELIVERY ORDER ON PROGRESS';
                    } else {
                        Return = 'WAITING DELIVERY ORDER';
                    }

                    if (params.data.finish == 1) {
                        Return = 'FINISH';
                    }

                    return Return;

                }
            }
        }
    ];
    // => / END : TableCol

    /**
     * Grid Style
     */
    RowStyle(params) {
        if (params.data) {
            if (params.data.finish != 1) {
                if (params.data.finish_percent > 0) {
                    return {
                        color: 'blue',
                        fontStyle: 'italic'
                    };
                } else {
                    return {
                        color: 'red',
                        backgroundColor: '#fff799',
                        fontStyle: 'italic'
                    };
                }
            }
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
                            NoLoader: 1
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'data', Params).subscribe(
                            result => {

                                if (result) {

                                    // $this.count = result.count;
                                    // $this.perm = result.permissions;

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

        var menu = [];

        var data = params.node.data;
        var get = params.context;


        if (get.parent.perm.finish && data.finish != 1) {
            menu.push({
                name: 'Finish',
                action: function () {
                    get.parent.Finish(data);
                },
                icon: '<i class="fa fa-check green-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'green-fg'
                ]
            });
        }
        return menu;
    }
    // => / END : Context Menu

    // FINISH
    Finish(data) {
        swal({
            title: 'Please Confirm to Finish?',
            html: '<div>This Action can not be undone.<br>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            width: 400
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: data.id
                    };

                    this.core.Do(this.ComUrl + 'finish', Params).subscribe(
                        result => {

                            if (result.status == 1) {

                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Transaction Success',
                                    msg: 'Shipment for ' + data.kode + ' Finish!'
                                };
                                this.core.OpenAlert(Success);
                                this.gridApi.purgeServerSideCache();

                                // this.dialogRef.close(result);

                                // this.form = result.data;
                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                                this.Busy = false;
                            }
                        },
                        error => {
                            console.error('GetForm', error);
                            this.core.OpenNotif(error);
                        }
                    );
                }
            }
        );
    }

    onClick(params) {
        this.router.navigate(['/so/gi_product/history/' + params.data.id]);
    }

}
