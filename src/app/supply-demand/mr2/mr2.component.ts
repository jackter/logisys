import { Component, OnInit, OnDestroy } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import swal from 'sweetalert2';
import { MR2FormDialogComponent } from './dialog/form';
import { Router } from '@angular/router';
import { BroadcasterService } from 'ng-broadcaster';
import * as moment from 'moment';

@Component({
    selector: 'app-mr',
    templateUrl: './mr2.component.html',
    styleUrls: ['./mr2.component.scss'],
    animations: fuseAnimations
})
export class MR2Component implements OnInit, OnDestroy {

    form: any = {};
    ComUrl = 'e/snd/mr2/';
    public Com: any = {
        name: 'Reservation',
        title: 'Reservations',
        icon: 'assignment',
    };

    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;
    def_list: number;

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
            var ParamsFilter = this.gridApi.getFilterModel();

            if (ParamsFilter) {

                for (let key in ParamsFilter) {
                    this.DFilter[key] = ParamsFilter[key].filter;
                }
            }

            if (!this.core.isEmpty(this.DFilter)) {

                for (let key in this.DFilter) {

                    if (key) {

                        var val = this.DFilter[key];
                        if (val) {

                            if (val._isAmomentObject) {
                                val = moment(val).format('YYYY-MM-DD');
                            }

                            var Filter = {
                                key: 'contains',
                                filterType: 'text',
                                filter: val
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
    // => End Filter

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
            headerName: 'Request Date',
            field: 'request_date',
            suppressSizeToFit: true,
        },
        {
            headerName: 'Company',
            field: 'company_abbr',
            suppressSizeToFit: true,
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 200
        },
        {
            headerName: 'Ref. Type',
            field: 'ref_type',
            suppressSizeToFit: true,
            width: 100,
            valueFormatter(params) {
                if(params.value) {
                    if (params.value == 1) {
                        return 'Non Inventory';
                    } else 
                    if (params.value == 2) {
                        return 'WO';
                    } else 
                    if (params.value == 3) {
                        return 'JO';
                    } else 
                    if (params.value == 4) {
                        return 'Asset';
                    }
                }

                if (params.value == 0) {
                    return 'General';
                }
            }
        },
        {
            headerName: 'Ref. Code',
            field: 'ref_kode',
            suppressSizeToFit: true,
            width: 200,
            valueFormatter(params) {
                if(params.value) {
                    return params.value;
                } else {
                    return '-';
                }
            }
        },
        {
            headerName: 'Date Target',
            field: 'date_target',
            suppressSizeToFit: true,
        },
        {
            headerName: 'Note',
            field: 'note',
            width: 350,
            tooltipField: 'note',
            suppressSizeToFit: true,
        },
        {
            headerName: 'Created By',
            field: 'create_by',
            suppressSizeToFit: true,
            width: 150,
            suppressFilter: true
        },
        {
            headerName: 'Status',
            field: 'draft',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'Verified',
                            'Unverified',
                            'Approved'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    if (params.data.finish == 0) {
                        if (params.data.verified != 1) {
                            return 'Unverified';
                        } else
                            // if (params.data.verified == 1 && params.data.approved == 0) {
                            //     return 'Verified, Waiting Approve';
                            // } 
                            // else if (params.data.verified == 1 && params.data.approved == 1 && params.data.validated == 0){
                            //     return 'Approved, Waiting Validate';
                            // }
                            // else{
                            //     return 'Validated, Waiting Finish Process';
                            // }

                            if (params.data.verified == 1 && params.data.approved == 0) {
                                return 'Verified, Waiting Approve';
                            } 
                            else{
                                return 'Approved, Waiting Finish Process';
                            }
                    } else {
                        return 'FINISH';
                    }

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

            if (params.data.verified != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (params.data.verified == 1 && params.data.approved == 0) {
                return {
                    color: 'red',
                    fontStyle: 'italic'
                };
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
                icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
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

        return menu;

    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click
    // ============================ END : GRID

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<MR2FormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        if (this.perm.view) {

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

    }
    ShowFormDialog() {

        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            MR2FormDialogComponent,
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

}
