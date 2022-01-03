import { Component, OnInit, OnDestroy } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import swal from 'sweetalert2';
import { PRFormDialogComponent } from './dialog/form';
import { BroadcasterService } from 'ng-broadcaster';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PRCloseFormDialogComponent } from './dialog/close';
import { DirectPRFormDialogComponent } from './dialog/direct';

@Component({
    selector: 'app-pr',
    templateUrl: './pr.component.html',
    styleUrls: ['./pr.component.scss'],
    animations: fuseAnimations
})
export class PRComponent implements OnInit, OnDestroy {

    ComUrl = 'e/snd/pr/';
    form: any = {};

    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;
    def_list: number;
    public Com: any = {
        name: 'Purchase Request',
        title: 'Purchase Request\'s Lists',
        icon: 'business_center',
    };

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private broadcast: BroadcasterService,
        private router: Router
    ) {

    }

    ngOnInit() {
        this.LoadDefault();
        this.Broadcast();
    }

    ngOnDestroy() {
        this.Broad.unsubscribe();
    }

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
     * Broadcast
     */
    Broad;
    Broadcast() {

        this.core.GetSharing().subscribe(
            result => {
                if (result && result.data) {

                    var Data = JSON.parse(result.data);

                    if (Data && this.router.url == result.url) {

                        if (Data.id) {
                            setTimeout(() => {
                                this.OpenForm('detail-' + Data.id);
                                this.core.Sharing({});
                            }, 1000);
                        }

                    }

                }
            }
        );

        /**
         * Open
         */
        this.Broad = this.broadcast.on('open').subscribe(
            (result: any) => {

                if (result.data) {
                    var Data = JSON.parse(result.data);

                    if (Data && this.router.url == result.url) {

                        if (Data.id) {
                            this.OpenForm('detail-' + Data.id);
                        }

                    }
                }

            }
        );
        // => / END : Open

    }
    // => / END : Broadcast

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

        /**
         * Reload
         */
        /*setInterval(() => {
            this.gridApi.purgeServerSideCache();
        }, 60000);*/
        // => / END : Reload
    }
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Dept.',
            field: 'dept_abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Date',
            field: 'tanggal',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'MR Code',
            field: 'mr_kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Note',
            field: 'note',
            suppressSizeToFit: false,
            width: 150
        },
        {
            headerName: 'Created By',
            field: 'create_by',
            suppressSizeToFit: true,
            width: 150,
            suppressFilter: true
        },
        {
            headerName: 'Approved By',
            field: 'approved_by',
            suppressSizeToFit: true,
            width: 150,
            suppressFilter: true
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
                            'DRAFT',
                            'VERIFIED',
                            'MANAGER APPROVED',
                            'DIRKOM APPROVED',
                            'CEO APPROVED',
                            'FINISH',
                            'FINISH, READY TO CREATE QUOTATION',
                            'CLOSED',
                            'CANCELED'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (params.data.verified != 1) {
                        Return = 'DRAFT';
                    } else if (params.data.verified == 1 && params.data.approved != 1) {
                        Return = 'VERIFIED, WAITING MGR. APPROVE';
                    } else if (params.data.approved == 1 && params.data.approved2 != 1) {
                        if (params.data.apvd >= 2) {
                            Return = 'MANAGER APPROVED, WAITING DIRKOM APPROVE';
                        } else {
                            Return = 'APPROVED';
                        }
                    } else if (params.data.approved2 == 1 && params.data.approved3 != 1) {
                        if (params.data.apvd == 3) {
                            Return = 'HEAD APPROVED, WAITING CEO APPROVE';
                        } else {
                            Return = 'APPROVED';
                        }
                    } else {
                        Return = 'APPROVED';
                    }

                    if (params.data.finish == 1 && params.data.quoted != 1) {
                        Return = 'FINISH, READY TO CREATE QUOTATION';
                    } else if (params.data.finish == 1) {
                        Return = 'FINISH (' + moment(params.data.finish_date).format('DD/MM/YYYY') +')';
                    }

                    if (params.data.is_void == 1) {
                        Return = 'CANCELED';
                    }

                    if (params.data.is_close == 1) {
                        Return = 'CLOSED';
                    }

                    return Return;

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
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.verified != 1) {
                return {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }

            if (
                params.data.verified == 1 &&
                params.data.finish != 1 &&
                (
                    params.data.approved != 1 ||
                    params.data.approved2 != 1 ||
                    params.data.approved3 != 1
                )
            ) {
                return {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }

            if (
                params.data.finish == 1 &&
                params.data.quoted != 1
            ) {
                return {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

        }
    }
    // => / END : Grid Style

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

        if (data.verified != 1 && data.is_close != 1) {

            if (get.parent.perm.edit) {
                menu.push({
                    name: 'Edit',
                    action: function () {
                        get.parent.OpenForm(data.id);
                    },
                    icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'primary-fg'
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
        }

        if (data.verified != 1) {
            menu.push('separator');
        }

        if (get.parent.perm.back_pmr && data.is_close == 0 && data.is_void != 1 && data.quoted != 1) {
            menu.push({
                name: 'Back to PMR',
                action: function () {
                    get.parent.BackToPMR(data);
                },
                icon: '<i class="fa fa-arrow-left primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
                ]
            });
        }

        if (get.parent.perm.close_pr && data.is_close == 0 && data.quoted != 1) {
            menu.push('separator');
            menu.push({
                name: 'Force Close',
                action: function () {
                    get.parent.ClosePR(data);
                },
                icon: '<i class="fa fa-times red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
                ]
            });
        }

        if (get.parent.perm.force_edit && data.sup_replay != 1) {
            if (data.finish != 1 || data.quoted != 1) {
                menu.push('separator');
            }
            menu.push({
                name: 'Force Edit',
                action: function () {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
                ]
            });
        }

        return menu;
    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        if (params.data.is_close != 1) {
            this.OpenForm('detail-' + params.data.id);
        }
        else {
            this.ClosePR(params.data);
        }
    }
    // => / END : Double Click
    // ============================ END : GRID

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<PRFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        if (id == 'add') {   // ADD

            this.form.id = 'add';

            this.ShowFormDirectDialog();

        } else {  // EDIT

            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id,
                is_detail: isDetail,
                add_item: this.perm.add_item
            };

            this.core.Do(this.ComUrl + 'get', Params).subscribe(
                result => {

                    if (result) {
                        this.form = result.data;
                        this.form.from_pr = 1;
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
            PRFormDialogComponent,
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

        });
        // => / END : After Dialog Close
    }

    dialogRefDirect: MatDialogRef<DirectPRFormDialogComponent>;
    dialogRefConfigDirect: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowFormDirectDialog() {
        this.core.Sharing(null, 'reload');

        this.dialogRefDirect = this.dialog.open(
            DirectPRFormDialogComponent,
            this.dialogRefConfigDirect
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogRefDirect.componentInstance.ComUrl = this.ComUrl;
        this.dialogRefDirect.componentInstance.Default = this.Default;
        this.dialogRefDirect.componentInstance.Com = this.Com;
        this.dialogRefDirect.componentInstance.perm = this.perm;
        this.dialogRefDirect.componentInstance.form = this.form;
        // => / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogRefDirect.afterClosed().subscribe(result => {

            this.dialogRefDirect = null;

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

        });
        // => / END : After Dialog Close
    }
    // => / END : Form Dialog

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

    /**
     * Close PR
     */

    ClosedialogRef: MatDialogRef<PRCloseFormDialogComponent>;
    ClosedialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ClosePR(data) {

        data.is_detail = true;

        if (data.is_close == 1) {
            data.is_detail = false;
        }

        this.ClosedialogRef = this.dialog.open(
            PRCloseFormDialogComponent,
            this.ClosedialogRefConfig
        );

        this.ClosedialogRef.componentInstance.ComUrl = this.ComUrl;
        this.ClosedialogRef.componentInstance.perm = this.perm;
        this.ClosedialogRef.componentInstance.form = data;
        this.ClosedialogRef.componentInstance.Default = this.Default;

        this.ClosedialogRef.afterClosed().subscribe(result => {

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
    }
    // => / END : Close PR

    /**
     * Back to MR
     */
    BackToPMR(data) {

        swal({
            title: 'Roll Back PMR Process?',
            html: '<div>Are you sure to continue?</div>',
            type: 'warning',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: data.id,
                        kode: data.kode,
                        mr: data.mr

                    };
                    this.core.Do(this.ComUrl + 'backtopmr', Params).subscribe(
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

                            console.error('BackToPMR', error);
                            this.core.OpenNotif(error);

                        }
                    );

                }

            }
        );

    }
    // => / END : Back to MR

}
