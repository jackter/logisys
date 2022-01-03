import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { UserDialogComponent } from './dialog/form';

import { default as swal } from 'sweetalert2';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    animations: fuseAnimations
})
export class UserComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/_system/user/';
    public Com: any = {
        name: 'User',
        title: 'Data Users',
        icon: 'list_alt'
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data;
    def_list: number;

    constructor(
        private core: Core,
        private LS: LocalStorageService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.LoadDefault();
    }

    /**
     * Load Default
     */
    LoadDefault() {
        var Params = {};
        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {

                if (result) {
                    this.Default = result;
                }

            },
            error => {
                console.error(error);
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
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Nama',
            field: 'nama',
            tooltipField: 'nama',
            width: 200,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Username',
            field: 'username',
            // suppressSizeToFit: true,
            width: 300,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Status',
            field: 'status_data',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values (params) {
                    setTimeout(() => {
                        params.success([
                            'ACTIVE',
                            'DISABLED'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            suppressSizeToFit: true,
            valueGetter(params) {
                if (params.data) {
                    if (params.data.status != 1) {
                        return 'DISABLED';
                    } else {
                        return 'ACTIVE';
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

        if (get.parent.perm.edit) {
            menu.push('separator');
            menu.push({
                name: 'Disable',
                action: function () {
                    get.parent.Disable(data);
                },
                icon: '<i class="fa fa-times red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'red-fg'
                ]
            });
        }

        return menu;

    }
    // => / END : Context Menu

    /**
     * List Change
     */
    ListChange(e) {
        this.def_list = e;
    }
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
            if (params.data.status != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }
        }

    }
    // => / END : Grid Style
    // ============================ END : GRID

    dialogRef: MatDialogRef<UserDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        if (id == 'add') {   // ADD

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

        /**
         * Get Group List
         * 
         * Fungsi untuk mendapatkan list group
         * untuk kebutuhan form
         */
        this.core.Do(this.ComUrl + 'group.list', {}).subscribe(
            result => {

                this.dialogRef = this.dialog.open(
                    UserDialogComponent,
                    this.dialogRefConfig
                );

                // => Insert Component Instance
                this.dialogRef.componentInstance.ComUrl = this.ComUrl;
                this.dialogRef.componentInstance.form = this.form;
                this.dialogRef.componentInstance.Group = result.data;
                this.dialogRef.componentInstance.Default = this.Default;

                this.dialogRef.afterClosed().subscribe(result => {

                    this.dialogRef = null;

                    if (result) {
                        if (!this.Data) {
                            this.LoadData(this.gridParams);
                        } else {
                            this.gridApi.purgeServerSideCache();
                        }

                        this.LoadDefault();
                    }

                });

            },
            error => {
                console.error(error);
            }
        );
        // => / END : Get Group List

    }
    // ================ END OpenForm ================

    // ================ HAPUS ================
    Delete(data) {

        swal(
            {
                title: 'Apakah Anda yakin!',
                html: '<div>Menghapus data?</div><div><small><strong>' + data.nama + '</strong></small></div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(

            result => {

                if (result.value) {

                    var Params = {
                        id: data.id
                    };
                    this.core.Do(this.ComUrl + 'delete', Params).subscribe(
                        success => {

                            if (success.status == 1) {
                                this.LoadDefault();
                                this.gridApi.purgeServerSideCache();
                            } else {
                                var Alert = {
                                    msg: success.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }

                        },
                        error => {
                            this.core.OpenNotif(error);
                        }
                    );

                }

            }
        );

    }
    // =============== / HAPUS ===============

    // ================ DISABLE ================
    Disable(data) {

        swal(
            {
                title: 'Apakah Anda yakin!',
                html: '<div>Menonaktifkan user?</div><div><small><strong>' + data.nama + '</strong></small></div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(

            result => {

                if (result.value) {

                    var Params = {
                        id: data.id
                    };
                    this.core.Do(this.ComUrl + 'disable', Params).subscribe(
                        success => {

                            if (success.status == 1) {
                                this.LoadDefault();
                                this.gridApi.purgeServerSideCache();
                            } else {
                                var Alert = {
                                    msg: success.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }

                        },
                        error => {
                            this.core.OpenNotif(error);
                        }
                    );

                }

            }
        );

    }
    // =============== / DISABLE ===============

}
