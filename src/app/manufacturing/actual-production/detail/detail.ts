import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { APDetailFormDialogComponent } from './dialog/form';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { TransferRequestFormDialogComponent } from '../../transfer-request/dialog/form';
import { FinishGoodsFormDialogComponent2 } from 'app/manufacturing/finish-goods/dialog/form';

@Component({
    selector: 'app-actual-production-detail',
    templateUrl: './detail.html',
    styleUrls: ['../actual-production.component.scss'],
    animations: fuseAnimations
})
export class ActualProductionDetailComponent implements OnInit {

    DetailID;

    ComUrl = "e/manufacturing/ap/";

    public Com: any = {
        name: 'Actual Production Data Detail',
        title: 'Actual Production Detail',
        icon: 'event_note',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    Ready;

    Downtime: any[] = [];

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router

    ) {
        activatedRoute.params.subscribe(params => {
            if (params.id) {
                this.DetailID = params.id;
            }
        });
    }

    ngOnInit() {

        this.LoadDefault();

    }

    Back() {
        this.router.navigate(['/manufacturing/actual_production']);
    }

    /**
   * Reload Data
   */
    Reload() {
        this.LoadData(this.gridParams);
    }
    //=> END : Reload Data

    /**
     * Load Default
     */
    LoadDefault() {

        var Params = {
            id: this.DetailID
        };

        this.Ready = false;

        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {

                if (result) {

                    this.Default = result;

                    if (this.Default.JO.jo_kode) {
                        this.Com.title = this.Default.JO.jo_kode;
                    }

                }

                this.Ready = true;
            },
            error => {
                console.log('GetForm', error);
                this.core.OpenAlert(error);
            }
        );

    }
    //=> / END : Load Default

    //============================ GRID
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
                newRowsAction: "keep"
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
            headerName: 'Date',
            field: 'tanggal',
            width: 200,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Input Date',
            field: 'create_date',
            width: 200,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 200,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        // {
        //     headerName: 'Shift',
        //     field: 'shift',
        //     //suppressSizeToFit: true,
        //     width: 300,
        //     //cellStyle: this.RowStyle,
        // },
        {
            headerName: 'Status',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            "Draft",
                            "Verified"
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            //suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (params.data.verified != 1) {
                        Return = "Unverified";
                    } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            Return = "Verified, Waiting Approve";
                        } else {
                            Return = "Approved";
                        }

                    return Return;

                }
            }
        }
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
                            jo: $this.DetailID
                        };


                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'data.detail', Params).subscribe(
                            result => {

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

        return menu;

    }
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    //=> / END : Double Click

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
        }
    }
    //=> / END : Grid Style
    //============================ END : GRID


    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<APDetailFormDialogComponent>;
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

            //=> Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == "detail") {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id,
                is_detail: isDetail,
                company: this.Default.JO.company,
                dept: this.Default.JO.dept,
                storeloc: this.Default.JO.storeloc
            };

            this.core.Do(this.ComUrl + 'get', Params).subscribe(
                result => {

                    if (result) {
                        this.form = result.data;
                        this.form.total_days = result.total_days;
                        this.form.biaya_gi = result.biaya_gi;
                        this.form.biaya_lain = result.biaya_lain;
                        this.form.biaya_lain_detail = result.biaya_lain_detail;
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
            APDetailFormDialogComponent,
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
        this.dialogRef.componentInstance.DetailID = this.DetailID;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogRef.afterClosed().subscribe(result => {

            this.dialogRef = null;

            var Reload = 0;
            var ReloadDef = 0;

            this.core.GetSharing('reload').subscribe(
                result => {
                    if (result) {
                        Reload = 1;
                        if (result.reload_def) {
                            ReloadDef = 1;
                        }
                    }
                }
            );

            if (result || Reload == 1) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {

                    if (ReloadDef == 1) {
                        this.Ready = false;
                        this.LoadDefault();
                    }

                    this.gridApi.purgeServerSideCache();
                }
            }

            if (result) {
                if (result.reopen == 1) {
                    this.OpenForm('detail-' + this.form.id);
                }
            }

        });
        //=> / END : After Dialog Close

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
    //=> / END : Delete

    /**
     * Dialog Transfer Request
     */
    dialogTransfer: MatDialogRef<TransferRequestFormDialogComponent>;
    dialogTransferConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    ShowDialogTransfer() {

        this.core.Sharing(null, 'reload');

        this.dialogTransfer = this.dialog.open(
            TransferRequestFormDialogComponent,
            this.dialogTransferConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogTransfer.componentInstance.Default = this.Default;
        this.dialogTransfer.componentInstance.from_ap = 1;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogTransfer.afterClosed().subscribe(result => {

            this.dialogTransfer = null;

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
        //=> / END : After Dialog Close

    }
    //=> / END : Dialog Transfer Request

    /**
     * Dialog finish goods
     */
    dialogFinishGoods: MatDialogRef<FinishGoodsFormDialogComponent2>;
    dialogFinishGoodsConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    ShowDialogFinishGoods() {

        this.core.Sharing(null, 'reload');

        this.dialogFinishGoods = this.dialog.open(
            FinishGoodsFormDialogComponent2,
            this.dialogFinishGoodsConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogFinishGoods.componentInstance.Default = this.Default;
        this.dialogFinishGoods.componentInstance.from_ap = 1;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogFinishGoods.afterClosed().subscribe(result => {

            this.dialogFinishGoods = null;

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
        //=> / END : After Dialog Close

    }
    //=> End dialog finish goods

}