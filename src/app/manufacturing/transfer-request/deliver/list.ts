import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliverRequestFormDialogComponent } from './dialog/form';
import swal from 'sweetalert2';

@Component({
    selector: 'app-transfer-deliver',
    templateUrl: './list.html',
    styleUrls: ['../transfer-request.component.scss'],
    animations: fuseAnimations
})
export class TransferDeliveryRequestComponent implements OnInit {

    DetailID;

    ComUrl = "e/manufacturing/mtr/deliver/";

    public Com: any = {
        name: 'Delivery',
        title: 'Transfer Process',
        icon: 'local_shipping',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    Ready;

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
        this.router.navigate(['/manufacturing/transfer_request']);
    }

    /**
   * Reload Data
   */
    Reload() {
        // this.LoadData(this.gridParams);
        this.LoadDefault();
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

                    if (this.Default.MTR.kode) {
                        this.Com.title = this.Default.MTR.kode;
                    }

                    var Progress = this.core.rupiah(Number(this.Default.MTR.total_receive) / Number(this.Default.MTR.total_qty) * 100, 2);
                    if (this.Default.MTR.total_receive || this.Default.MTR.total_qty) {
                        this.Default.MTR.progress = Progress;
                    } else {
                        this.Default.MTR.progress = '-';
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
            minWidth: 100,
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
            headerName: 'Create Date',
            field: 'create_date',
            width: 150,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
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
        {
            headerName: 'Item',
            field: 'description',
            // suppressSizeToFit: true,
            // width: 300,
            // width: 500
            //cellStyle: this.RowStyle,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if(params.data.is_header == 1){
                        if (params.data.verified != 1) {
                            Return = "Unverified";
                        } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            Return = "Verified, Waiting Approve";
                        } else
                        if (params.data.approved == 1 && params.data.rcv == 0) {
                            Return = "Approved, Waiting Receive";
                        } else
                        if (params.data.rcv == 1 && params.data.verified_rcv != 1) {
                            Return = 'Receive, Waiting Verified Receive';
                        } else
                        if (params.data.verified_rcv == 1 && params.data.approved_rcv == 0) {
                            Return = 'Verified Receive, Waiting Approve Receive';
                        } else {
                            Return = 'Finish';
                        }

                        Return = Return.toUpperCase();
                    }else{
                        Return = params.data.description;
                    }

                    return Return;

                }
            }
        },
        {
            headerName: 'Qty Transfer',
            field: 'qty',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function(params){
                if(params.data){

                    var data = params.data;
                    var $this = params.context.parent;

                    var CurrentStyle = {
                        textAlign: 'right'
                    };

                    var Style = $.extend($this.RowStyle(params), CurrentStyle);

                    return Style;

                }
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.qty && Number(data.qty) != 0){
                        return $this.core.rupiah(Number(data.qty), 2, true) + ' ' + data.i_satuan;
                    }else{
                        return '';
                    }

                }
            }
        },
        {
            headerName: 'Qty Receive',
            field: 'qty_receive',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function(params){
                if(params.data){

                    var data = params.data;
                    var $this = params.context.parent;

                    var CurrentStyle = {
                        textAlign: 'right'
                    };

                    var Style = $.extend($this.RowStyle(params), CurrentStyle);

                    return Style;

                }
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.qty_receive && Number(data.qty_receive) != 0){
                        return $this.core.rupiah(Number(data.qty_receive), 2, true) + ' ' + data.i_satuan;
                    }else{
                        return '';
                    }

                }
            }
        },
        // {
        //     headerName: 'Status',
        //     // pinned: 'right',
        //     filter: 'agSetColumnFilter',
        //     filterParams: {
        //         values: function (params) {
        //             setTimeout(() => {
        //                 params.success([
        //                     "Draft",
        //                     "Verified"
        //                 ]);
        //             }, 250);
        //         },
        //         newRowsAction: 'keep'
        //     },
        //     width: 100,
        //     suppressSizeToFit: false,
        //     valueGetter: function (params) {
        //         if (params.data) {

        //             var Return;

        //             if(params.data.is_header == 1){
        //                 if (params.data.verified != 1) {
        //                     return "Unverified";
        //                 } else
        //                 if (params.data.verified == 1 && params.data.approved == 0) {
        //                     return "Verified, Waiting Approve";
        //                 } else
        //                 if (params.data.approved == 1 && params.data.rcv == 0) {
        //                     return "Approved, Waiting Receive";
        //                 } else
        //                 if (params.data.rcv == 1 && params.data.verified_rcv != 1) {
        //                     return 'Receive, Waiting Verified Receive';
        //                 } else
        //                 if (params.data.verified_rcv == 1 && params.data.approved_rcv == 0) {
        //                     return 'Verified Receive, Waiting Approve Receive';
        //                 } else {
        //                     return 'Finish';
        //                 }
        //             }

        //             return Return;

        //         }
        //     }
        // }
    ];
    //=> / END : TableCol

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            var Style: any = {};

            if ((params.data.verified != 1) || (params.data.rcv == 1 && params.data.verified_rcv != 1)) {
                Style = {
                    color: 'red',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (
                (params.data.verified == 1 && params.data.approved == 0) ||
                (params.data.verified_rcv == 1 && params.data.approved_rcv == 0)
            ) {
                Style = {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            if (params.data.approved == 1 && params.data.rcv == 0) {
                Style = {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }

            if(params.data.is_header == 1){
                Style.fontWeight = 'bold';
            }

            if(params.data.separator == 1){
                Style = {};
            }

            return Style;
        }
    }
    //=> / END : Grid Style

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
                            id: $this.DetailID
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'data', Params).subscribe(
                            result => {

                                //$this.count = result.count;
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

        if (get.parent.perm.edit_deliver && data.verified != 1) {
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

        if (get.parent.perm.hapus_deliver && data.verified != 1) {
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
        if(Number(params.data.separator) != 1){
            this.OpenForm('detail-' + params.data.id);
        }
    }
    //=> / END : Double Click

    //============================ END : GRID


    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<DeliverRequestFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog-full'
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
                company: this.Default.MTR.company,
                bom: this.Default.MTR.bom
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
            DeliverRequestFormDialogComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = JSON.parse(JSON.stringify(this.Default));
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = JSON.parse(JSON.stringify(this.form));
        this.dialogRef.componentInstance.DetailID = this.DetailID;
        //=> / END : Inject Data to Dialog

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

            if(result.approve == 1){
                this.LoadDefault();
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
}