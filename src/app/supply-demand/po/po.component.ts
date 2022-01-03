import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import swal from 'sweetalert2';
import { POFormDialogComponent } from './dialog/form';
import { POCreateFormDialogComponent } from './dialog/create';
import * as moment from 'moment';
import { POCloseFormDialogComponent } from './dialog/close';
import { POCancelFormDialogComponent } from './dialog/cancel';

@Component({
    selector: 'app-po',
    templateUrl: './po.component.html',
    styleUrls: ['./po.component.scss'],
    animations: fuseAnimations
})
export class POComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/snd/po/';
    public Com: any = {
        name: 'Purchase Order',
        title: 'Purchase Order Lists',
        icon: 'shopping_cart',
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
        public dialog: MatDialog
    ) {

    }

    ngOnInit() {
        this.LoadDefault();
    }

    Reload() {
        this.LoadData(this.gridParams);
    }

    /**
     * Filter
     */
    ShowFilter = false;
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
            headerName: 'PO Date',
            field: 'tanggal',
            suppressSizeToFit: true,
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
            suppressSizeToFit: true,
            width: 175
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Supplier',
            field: 'supplier_nama',
            // suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Total',
            field: 'grand_total',
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep'
            },
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
                } else {
                    return '-';
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                        fontWeight: 'bold',
                    };

                    if (params.data.bottom == 1) {
                        Default.backgroundColor = '#5942f4';
                        Default.color = '#FFF;';
                    }

                    if (params.data.is_close == 1) {
                        Default.backgroundColor = '#FF6161';
                    }

                    if (params.data.submited != 1) {
                        var Style = {};
                        Style = get.parent.RowStyle(params);


                        $.extend(Style, Default);

                        return Style;
                    }

                    if (
                        params.data.submited == 1 &&
                        params.data.finish != 1
                    ) {

                        if (
                            params.data.gr_available > 0 &&
                            params.data.finish_percent != 0
                        ) {
                            return {
                                color: 'blue',
                                fontStyle: 'italic',
                                textAlign: 'right',
                                fontWeight: 'bold'
                            };
                        } else {
                            return {
                                color: 'red',
                                fontStyle: 'italic',
                                textAlign: 'right',
                                fontWeight: 'bold'
                            };
                        }

                    } else {
                        return Default;
                    }
                }

            },
        },
        {
            headerName: 'Status',
            pinned: 'right',
            field: 'status_data',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'DRAFT',
                            'WAITING GOODS RECEIPT',
                            'FINISH',
                            'CANCELED',
                            'CLOSED'
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

                    if (params.data.submited != 1 && params.data.is_void != 1) {
                        Return = 'DRAFT';
                    } else if (
                        params.data.submited == 1 &&
                        params.data.finish != 1
                    ) {

                        if (
                            params.data.gr_available > 0 &&
                            params.data.finish_percent != 0
                        ) {
                            Return = 'GOODS RECEIPT ON PROGRESS (' + params.data.finish_percent + '%)';
                        } else {
                            Return = 'WAITING GOODS RECEIPT';
                        }

                    } else if (
                        params.data.submited == 1 &&
                        params.data.finish == 1
                    ) {
                        Return = 'FINISH';
                    } else if (
                        params.data.is_void == 1
                    ) {
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
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.submited != 1) {
                return {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }

            /*if(
                params.data.finish == 1 && 
                params.data.ordered != 1
            ){
                return {
                    color: 'blue',
                    fontStyle: 'italic'
                }
            }*/

            if (
                params.data.submited == 1 &&
                params.data.finish != 1
            ) {

                if (
                    params.data.gr_available > 0 &&
                    params.data.finish_percent != 0
                ) {
                    return {
                        color: 'blue',
                        fontStyle: 'italic'
                    };
                } else {
                    return {
                        color: 'red',
                        fontStyle: 'italic'
                    };
                }

            }

            if (params.data.is_close == 1) {
                return {

                    fontStyle: 'italic',
                    backgroundColor: '#FF6161'
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

        if (data.is_void == 0 && data.is_close == 0) {
            if (data.submited != 1) {

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

            if (get.parent.perm.cancel_item && data.finish == 0 && data.dp_invoice_status == 0 && parseFloat(data.finish_percent) >= 0) {
                menu.push({
                    name: 'Cancel PO',
                    action: function () {
                        get.parent.CancelPO(data.id);
                    },
                    icon: '<i class="fa fa-ban red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'red-fg'
                    ]
                });
                // menu.push('separator');
            }

            // if (data.submited != 1) {
            //     menu.push('separator');
            // }

            if (get.parent.perm.close_po && data.is_close != 1 && data.finish == 0) {
                menu.push({
                    name: 'Force Close',
                    action: function () {
                        get.parent.OpenRemarks(data, 'FC');
                    },
                    icon: '<i class="fa fa-times red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'red-fg'
                    ]
                });
            }

            if (get.parent.perm.po_modif) {
                menu.push({
                    name: 'PO Modif',
                    action: function () {
                        get.parent.OpenForm('is_modif-' + data.id);
                    },
                    icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'primary-fg'
                    ]
                });
            }

            if (get.parent.perm.back_pq && data.finish_percent == 0 && data.is_void != 1 && data.is_close != 1 && data.dp_invoice_status == 0) {
                menu.push({
                    name: 'Back to PQ',
                    action: function () {
                        get.parent.OpenRemarks(data, 'BPQ');
                    },
                    icon: '<i class="fa fa-arrow-left primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'primary-fg'
                    ]
                });
            }
        }

        if (data.is_void == 1 || data.is_close == 1) {
            menu.push({
                name: 'View Remarks',
                action: function () {

                    if (data.is_close == 1) {
                        get.parent.OpenRemarks(data, 'FC');

                    } else {

                        get.parent.OpenRemarks(data, 'BPQ');
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
    // => / END : Context Menu

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
    // => / END : Double Click
    // ============================ END : GRID

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<POFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        if (id === 'add') {   // ADD

            this.form.id = 'add';

            this.ShowFormDialog();
        } else
            if (id === 'partial') {

                this.form.id = 'add';
                this.form.ppn = 10;
                this.form.dp = 0;

                this.ShowCreate();

            } else {  // EDIT

                // => Check if Detail
                var IDSplit = id.toString().split('-');

                var isDetail = false;
                if (IDSplit[0] == 'detail') {
                    isDetail = true;
                    id = IDSplit[1];
                }

                var isModif = false;
                if (IDSplit[0] == 'is_modif') {
                    isModif = true;
                    id = IDSplit[1];
                }

                var Params = {
                    id: id,
                    is_modif : isModif
                };

                this.core.Do(this.ComUrl + 'get', Params).subscribe(
                    result => {

                        if (result) {
                            this.form = result.data;
                            this.form.from_po = 1;
                            if (isDetail) {
                                this.form.is_detail = isDetail;
                            }
                            if(isModif){
                                this.form.is_modif = isModif;
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
            POFormDialogComponent,
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
        this.dialogRef.componentInstance.PO = this.form;
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

    /**
     * Dialog Create
     */
    dialogCreate: MatDialogRef<POCreateFormDialogComponent>;
    dialogCreateConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    ShowCreate() {

        this.dialogCreate = this.dialog.open(
            POCreateFormDialogComponent,
            this.dialogCreateConfig
        );

        this.dialogCreate.componentInstance.ComUrl = this.ComUrl;
        this.dialogCreate.componentInstance.perm = this.perm;
        this.dialogCreate.componentInstance.form = this.form;
        this.dialogCreate.componentInstance.Default = this.Default;

        this.dialogCreate.afterClosed().subscribe(result => {

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
    // => / END : Dialog Create

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
     * Back to PQ
     */
    // BackToPQ(data) {

    //     swal({
    //         title: 'Roll Back PQ Process?',
    //         html: '<div>Are you sure to continue?</div>',
    //         type: 'warning',
    //         reverseButtons: true,
    //         focusCancel: true,
    //         showCancelButton: true,
    //         confirmButtonText: 'Yes',
    //         cancelButtonText: 'Cancel'
    //     }).then(
    //         result => {

    //             if (result.value) {

    //                 var Params = {
    //                     id: data.id,
    //                     kode: data.kode,
    //                     pq: data.pq,
    //                     pr: data.pr
    //                 };

    //                 // console.log(Params);

    //                 this.core.Do(this.ComUrl + 'backtopq', Params).subscribe(
    //                     result => {

    //                         if (result.status == 1) {
    //                             this.gridApi.purgeServerSideCache();
    //                         } else {
    //                             var Alert = {
    //                                 msg: result.error_msg
    //                             };
    //                             this.core.OpenAlert(Alert);
    //                         }

    //                     },
    //                     error => {

    //                         console.error('BackToPQ', error);
    //                         this.core.OpenNotif(error);

    //                     }
    //                 );

    //             }

    //         }
    //     );

    // }
    // => / END : Back to PQ

    ClosedialogRef: MatDialogRef<POCloseFormDialogComponent>;
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
            POCloseFormDialogComponent,
            this.ClosedialogRefConfig
        );

        if (key == 'FC') {

            this.ClosedialogRef.componentInstance.Initial = 0;
            this.ClosedialogRef.componentInstance.Com = 'Force Close';
        } else {

            this.ClosedialogRef.componentInstance.Initial = 1;
            this.ClosedialogRef.componentInstance.Com = 'Back to PQ';
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
     * Open Form Cancel PO
     */
    CanceldialogRef: MatDialogRef<POCancelFormDialogComponent>;
    CanceldialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    CancelPO(id) {

        var Params = {
            id: id
        };

        this.core.Do('e/snd/gr/' + 'get', Params).subscribe(
            result => {

                if (result) {

                    this.form = result.data;

                    this.ShowCancel();

                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );
    }

    ShowCancel() {

        this.CanceldialogRef = this.dialog.open(
            POCancelFormDialogComponent,
            this.CanceldialogRefConfig
        );

        this.CanceldialogRef.componentInstance.ComUrl = this.ComUrl;
        this.CanceldialogRef.componentInstance.perm = this.perm;
        this.CanceldialogRef.componentInstance.form = this.form;
        this.CanceldialogRef.componentInstance.Default = this.Default;

        this.CanceldialogRef.afterClosed().subscribe(result => {

            this.CanceldialogRef = null;

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
    }
    // => END : Open Form Cancel PO
}
