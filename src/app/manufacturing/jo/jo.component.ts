import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { JOFormDialogComponent } from './dialog/form';
import swal from 'sweetalert2';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-jo',
    templateUrl: './jo.component.html',
    styleUrls: ['./jo.component.scss'],
    animations: fuseAnimations
})
export class JOComponent implements OnInit {

    ComUrl = 'e/manufacturing/jo/';

    public Com: any = {
        name: 'Job Order',
        title: 'Job Order / Production Plan',
        icon: 'how_to_vote',
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
        private dialog: MatDialog,
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
        this.LoadDefault();

    }

    /**
   * Reload Data
   */
    Reload() {
        this.LoadData(this.gridParams);
    }
    // => END : Reload Data


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
                    this.Default = result;
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
            width: 150,
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
            // suppressSizeToFit: true,
            width: 150,
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
            headerName: 'FG Kode',
            field: 'item_kode',
            width: 150
        },
        {
            headerName: 'FG Name',
            field: 'nama',
            width: 200
        },
        {
            headerName: 'Note',
            field: 'description',
            // suppressSizeToFit: true,
            width: 300,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'FG Qty',
            field: 'qty',
            tooltipField: 'qty',
            width: 150,
            minWidth: 150,
            valueFormatter: function (params) {
                if (params.data) {
                    var data = params.data;
                    var $this = params.context.parent;
                    return $this.core.rupiah(params.value) + ' ' + data.satuan;
                }
            },
            cellStyle: function (params) {
                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish == 1) {
                        Default.backgroundColor = '#CCC';
                        Default.fontStyle = 'italic';
                    }

                    if (params.data.verified != 1) {
                        var Style: any = {};
                        Style = get.parent.RowStyle(params);

                        $.extend(Style, Default);

                        return Style;

                    } else {
                        return Default;
                    }
                }
            }
        },
        {
            headerName: 'Productions',
            filter: false,
            valueFormatter: function (params) {
                var data = params.data;
                var $this = params.context.parent;
                if (data) {
                    if (data.total_sr) {
                        var Val = $this.core.rupiah((Number(data.total_sr)));
                        return Val + ' ' + data.satuan;
                    } else {
                        return '-';
                    }
                }

            },
            cellStyle: function (params) {
                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish == 1) {
                        Default.backgroundColor = '#CCC';
                        Default.fontStyle = 'italic';
                    }

                    if (params.data.verified != 1) {
                        var Style: any = {};
                        Style = get.parent.RowStyle(params);

                        $.extend(Style, Default);

                        return Style;

                    } else {
                        return Default;
                    }
                }
            }
        },
        {
            headerName: 'Progress',
            filter: false,
            valueFormatter: function (params) {
                var data = params.data;
                var $this = params.context.parent;
                if (data) {
                    if (data.total_sr) {
                        var Val = $this.core.rupiah((Number(data.total_sr) / Number(data.qty)) * 100, 2);
                        return Val + '%';
                    } else {
                        return '-';
                    }
                }
            },
            cellStyle: function (params) {
                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right'
                    };

                    if (params.data.finish == 1) {
                        Default.backgroundColor = '#CCC';
                        Default.fontStyle = 'italic';
                    }

                    if (params.data.verified != 1) {
                        var Style: any = {};
                        Style = get.parent.RowStyle(params);

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
            field: 'status_data',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'UNVERIFIED',
                            'VERIFIED',
                            'APPROVED',
                            'FINISH'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            // suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.verified != 1) {
                        return 'UNVERIFIED';
                    } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            return 'VERIFIED, WAITUNG APPROVE';
                        } else
                            // if (params.data.total_sr && params.data.finish != 1) {
                            //     return 'PROCESS';
                            // } else
                            if (params.data.finish == 1) {
                                return 'FINISH';
                            } else {
                                return 'APPROVED';
                            }


                }
            }
        }
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
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit && data.verified != 1) {
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

        if (get.parent.perm.hapus && data.verified != 1) {
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

        if (get.parent.perm.finish && data.finish != 1 && data.verified == 1 && data.approved == 1 && data.total_sr) {
            menu.push({
                name: 'Finish',
                action: function () {
                    get.parent.Finish(data);
                },
                icon: '<i class="fa fa-check-square-o indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
                ]
            });
        }

        return menu;

    }
    // => / END : Context Menu

    /**
     * List Change
     */
    // ListChange(e){
    //     this.def_list = e;
    // }
    // => / END : List Change

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.verified != 1) {

                return {
                    color: 'red',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (params.data.verified == 1 && params.data.approved == 0) {
                return {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            if (params.data.finish == 1) {

                return {
                    backgroundColor: '#CCC',
                    fontStyle: 'italic'
                };
            }
        }
    }
    // => / END : Grid Style
    // ============================ END : GRID

    /**
     * Open Form
     */
    dialogRef: MatDialogRef<JOFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        if (id === 'add') {
            this.form.id = 'add';

            this.ShowFormDialog();
        } else {  // EDIT

            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id
            };

            this.core.Do(this.ComUrl + 'get', Params).subscribe(
                result => {

                    if (result) {
                        this.form = result.data;
                        if (isDetail) {
                            this.form.is_detail = isDetail;
                        }

                        this.ShowFormDialog();
                    }

                },
                error => {
                    console.error('GetForm', error);
                    this.core.OpenNotif(error);
                }
            );

        }

    }
    ShowFormDialog() {
        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            JOFormDialogComponent,
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

            var Reload = 0;

            this.core.GetSharing('reload').subscribe(
                result => {
                    if (result) {
                        Reload = 1;
                    }
                }
            );

            if (result || Reload == 1) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }
            }

            if (result) {
                if (result.reopen == 1) {
                    this.OpenForm('detail-' + this.form.id);
                }
            }

        });
        // => / END : After Dialog Close
    }
    // => / END : Open Form

    /**
     * Finish JO
     */
    Finish(data) {

        swal({
            title: 'Finish this Data ' + data.kode + '?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Percent = (Number(data.total_sr) / Number(data.qty)) * 100;

                    // if (Percent < 90) {

                    //     var Alert = {
                    //         msg: 'Percentase Must Be Greater then 90% to Finish this Process'
                    //     };
                    //     this.core.OpenAlert(Alert);

                    // } else {

                    var Params = {
                        id: data.id,
                        kode: data.kode
                    };
                    this.core.Do(this.ComUrl + 'finish', Params).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.gridApi.purgeServerSideCache();
                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }

                        },
                        error => {

                            console.error('Finish', error);
                            this.core.OpenNotif(error);

                        }

                    );

                    // }

                }

            }

        );

    }
    // => End Finish JO

    /**
    * Delete
    */
    Delete(data) {

        swal({
            title: 'Delete this Data?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: data.id
                    };
                    this.core.Do(this.ComUrl + 'delete', Params).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.gridApi.purgeServerSideCache();
                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }

                        },
                        error => {

                            console.error('Delete', error);
                            this.core.OpenNotif(error);

                        }
                    );

                }

            }
        );

    }
    // => / END : Delete

}
