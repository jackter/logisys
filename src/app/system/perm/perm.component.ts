import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';

import { default as swal } from 'sweetalert2';
import { PermDialogComponent } from './dialog/form';
import { PermListDialogComponent } from './dialog/permissions';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';

@Component({
    selector: 'app-perm',
    templateUrl: './perm.component.html',
    styleUrls: ['./perm.component.scss'],
    animations: fuseAnimations
})
export class PermComponent implements OnInit {

    ComUrl = 'e/_system/perm/';

    form: any = {};
    public Com: any = {
        name: 'Permissions',
        title: 'Data Group Permissions',
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
    ) {

    }

    ngOnInit() {

    }

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
            headerName: 'Keterangan',
            field: 'keterangan',
            // suppressSizeToFit: true,
            width: 300,
            // cellStyle: this.RowStyle,
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

        if (get.parent.perm.permission) {
            menu.push('separator');
            menu.push({
                name: 'Permissions Setting',
                action: function () {
                    get.parent.ShowDialogPermission(data.id);
                },
                icon: '<i class="fa fa-bolt indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
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

        if (params.data && params.data.approved != 1) {
            return {
                color: 'red',
                backgroundColor: '#fff799',
                fontStyle: 'italic'
            };
        }
    }
    // => / END : Grid Style
    // ============================ END : GRID

    // ================ BEGIN OpenForm ================
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

    dialogRef: MatDialogRef<PermDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowFormDialog() {

        this.dialogRef = this.dialog.open(
            PermDialogComponent,
            this.dialogRefConfig
        );

        // => Insert Component Instance
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.form = this.form;

        this.dialogRef.afterClosed().subscribe(result => {

            this.dialogRef = null;

            if (result) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }
            }

        });

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

    /**
     * ShowDialogPermission
     * 
     * adalah fungsi yang digunakan untuk menampilkan 
     * Dialog Permissions 
     */
    dialogPerm: MatDialogRef<PermListDialogComponent>;
    dialogPermConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowDialogPermission(id) {

        this.core.Do(this.ComUrl + 'perm.list', { id: id }).subscribe(
            result => {

                if (result.status = 1) {

                    this.dialogPerm = this.dialog.open(PermListDialogComponent, this.dialogPermConfig);

                    this.dialogPerm.componentInstance.Data = result.data;
                    this.dialogPerm.componentInstance.ComUrl = this.ComUrl;
                    this.dialogPerm.componentInstance.id = id;

                    this.dialogPerm.afterClosed().subscribe(result => {
                        this.dialogPerm = null;

                        if (result) {

                        }
                    });

                } else {
                    this.core.OpenNotif(result.error_msg);
                }

            },
            error => {
                console.error(error);
            }
        );

    }
    // => / END : ShowDialogPermissions

}
