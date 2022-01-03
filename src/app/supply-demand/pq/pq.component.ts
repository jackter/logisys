import { Component, OnInit, OnDestroy } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import { BroadcasterService } from 'ng-broadcaster';
import { Router } from '@angular/router';

import swal from 'sweetalert2';
import * as moment from 'moment';

import { PQFormDialogComponent } from './dialog/form';
import { PQCloseDialogFormComponent } from './dialog/close';

@Component({
    selector: 'app-pq',
    templateUrl: './pq.component.html',
    styleUrls: ['./pq.component.scss'],
    animations: fuseAnimations
})
export class PQComponent implements OnInit, OnDestroy {

    ComUrl = 'e/snd/pq/';

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;
    def_list: number;

    public Com: any = {
        name: 'Purchase Quotations',
        title: 'Purchase Quotation Lists',
        icon: 'description',
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

    Reload() {
        this.LoadData(this.gridParams);
    }

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
            // => / END : Get Grid API Filter

            if (!this.core.isEmpty(this.DFilter)) {

                for (let key in this.DFilter) {

                    if (key) {

                        var Val = this.DFilter[key];
                        if (Val) {
                            if (Val._isAMomentObject) {
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
    // => / END : Filter

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
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Quotation',
            field: 'tanggal',
            width: 125,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    var data = params.data;

                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'PR Code',
            field: 'pr_kode',
            // suppressSizeToFit: true,
            width: 175
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Created Date',
            field: 'create_date',
            width: 125,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    var data = params.data;

                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
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
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'DRAFT',
                            'VERIFIED, WAITING MGR. APPROVE',
                            'MANAGER APPROVED, WAITING DIRKOM APPROVE',
                            'HEAD APPROVED, WAITING CEO APPROVE',
                            'FINISH, READY TO CREATE PURCHASE ORDER',
                            'FINISH',
                            'CANCELED',
                            'CLOSED',
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

                    if (params.data.verified != 1 && params.data.is_void != 1) {
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
                    }

                    if (params.data.finish == 1 && params.data.ordered != 1) {
                        Return = 'FINISH, READY TO CREATE PURCHASE ORDER';
                    } else if (params.data.finish == 1) {
                        Return = 'FINISH';
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

            if (params.data.verified != 1 && params.data.is_void != 1) {
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
                params.data.ordered != 1 &&
                params.data.is_void != 1
            ) {
                return {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            if (params.data.is_void == 1) {
                return {
                    color: 'white',
                    backgroundColor: '#ED403B'
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


        if (data.is_void == 0 && data.is_close == 0) {
            if (data.verified != 1) {
                if (get.parent.perm.edit && data.is_void != 1) {
                    menu.push({
                        name: 'Edit',
                        action() {
                            get.parent.OpenForm(data.id);
                        },
                        icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                        cssClasses: [
                            'primary-fg'
                        ]
                    });
                }

                if (get.parent.perm.hapus && data.is_void != 1) {
                    menu.push('separator');
                    menu.push({
                        name: 'Delete',
                        action() {
                            get.parent.Delete(data);
                        },
                        icon: '<i class="fa fa-trash red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                        cssClasses: [
                            'red-fg'
                        ]
                    });
                    menu.push('separator');

                }

            }

            if (get.parent.perm.back_pr && data.is_void != 1 && data.gr_available != 1 && data.is_close != 1) {
                menu.push({
                    name: 'Back to PR',
                    action() {
                        get.parent.OpenRemarks(data, 'BPQ');
                    },
                    icon: '<i class="fa fa-arrow-left primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'primary-fg'
                    ]
                });
            }

            if (get.parent.perm.close_pq && data.is_close != 1 && data.ordered != 1) {
                menu.push('separator');
                menu.push({
                    name: 'Force Close',
                    action() {
                        get.parent.OpenRemarks(data, 'FC');
                    },
                    icon: '<i class="fa fa-times red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'red-fg'
                    ]
                });
            }
        }

        if (data.is_void == 1 || data.is_close == 1) {
            menu.push({
                name: 'View Remarks',
                action() {

                    if (data.is_close == 1) {
                        get.parent.OpenRemarks(data, 'FC');

                    } else {

                        get.parent.OpenRemarks(data, 'BPR');
                    }
                },
                icon: '<i class="fa fa-eye primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
                ]
            });
        }

        return menu;

    }

    /**
     * Double Click
     */
    onDoubleClick(params) {
        if (params.data.is_close != 1) {
            this.OpenForm('detail-' + params.data.id);
        } else {
            this.OpenRemarks(params.data, 'FC');
        }
    }

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<PQFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        if (id === 'add') {   // ADD

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
                id: id,
                is_detail: isDetail
            };

            this.core.Do(this.ComUrl + 'get', Params).subscribe(
                result => {

                    if (result) {
                        this.form = result.data;
                        this.form.from_pq = 1;
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
            PQFormDialogComponent,
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
    // => / END : Form Dialog

    /* Force Close */
    ClosedialogRef: MatDialogRef<PQCloseDialogFormComponent>;
    ClosedialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenRemarks(data, key) {

        data.is_detail = true;

        if (data.is_close == 1 || data.is_void == 1) {
            data.is_detail = false;
        }

        this.ClosedialogRef = this.dialog.open(
            PQCloseDialogFormComponent,
            this.ClosedialogRefConfig
        );

        if (key == 'FC') {

            this.ClosedialogRef.componentInstance.Initial = 0;
            this.ClosedialogRef.componentInstance.Com = 'Force Close';
        } else {

            this.ClosedialogRef.componentInstance.Initial = 1;
            this.ClosedialogRef.componentInstance.Com = 'Back to PR';
        }
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
