import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { AP2DetailFormDialogComponent } from './dialog/form';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { TransferRequestFormDialogComponent } from '../../transfer-request/dialog/form';
import { FinishGoodsFormDialogComponent2 } from 'app/manufacturing/finish-goods/dialog/form';
import * as _ from 'lodash';
import { SummaryDialogComponent } from './dialog/summary';

@Component({
    selector: 'app-actual-production-detail',
    templateUrl: './detail.html',
    styleUrls: ['../actual-production2.component.scss'],
    animations: fuseAnimations
})
export class ActualProduction2DetailComponent implements OnInit {

    DetailID;

    ComUrl = "e/manufacturing/ap2/";

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

    Data: any[] = [];

    Ready;

    Downtime: any[] = [];
    Unapproved: number;

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
        this.router.navigate(['/manufacturing/actual_production2']);
    }

    /**
   * Reload Data
   */
    Reload() {
        // this.LoadData(this.gridParams);
        this.Data = [];
        this.Space = 0;
        this.Ready = false;
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

        this.core.Do(this.ComUrl + 'detail/default', Params).subscribe(
            result => {

                if (result) {

                    this.Default = result;

                    this.perm = result.permissions;

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
    limit = 10000;
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
        // {
        //     headerName: 'Date',
        //     field: 'tanggal',
        //     width: 200,
        //     suppressSizeToFit: true,
        //     //cellStyle: this.RowStyle,
        // },
        // {
        //     headerName: 'Input Date',
        //     field: 'create_date',
        //     width: 200,
        //     suppressSizeToFit: true,
        //     //cellStyle: this.RowStyle,
        // },
        // {
        //     headerName: 'Code',
        //     field: 'kode',
        //     width: 200,
        //     suppressSizeToFit: true,
        //     //cellStyle: this.RowStyle,
        // },
        // {
        //     headerName: 'Status',
        //     pinned: 'right',
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
        //     width: 200,
        //     //suppressSizeToFit: true,
        //     valueGetter: function (params) {
        //         if (params.data) {

        //             var Return;

        //             if (params.data.verified != 1) {
        //                 Return = "Unverified";
        //             } else
        //                 if (params.data.verified == 1 && params.data.approved == 0) {
        //                     Return = "Verified, Waiting Approve";
        //                 } else {
        //                     Return = "Approved";
        //                 }

        //             return Return;

        //         }
        //     }
        // }

        {
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            colSpan: function(params){
                if(params.data){
                    return params.data.is_header == 1 ? 2 : 1;
                }
            }
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Input Date',
            field: 'create_date',
            width: 100,
            filter: false,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Item Code',
            field: 'item_kode',
            width: 100,
            suppressSizeToFit: true,
            filter: false,
            colSpan: function(params){
                if(params.data){
                    return params.data.is_header == 1 ? 5 : 1;
                }
            }
        },
        {
            headerName: 'Item',
            field: 'item_nama',
            filter: false
        },
        {
            headerName: 'Qty',
            field: 'qty',
            filter: false,
            cellStyle: function(params){
                if(params.data){

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
                        return $this.core.rupiah(Number(data.qty), 2, true);
                    }else{
                        return '';
                    }

                }
            }
        },
        {
            headerName: 'UOM',
            field: 'satuan',
            width: 75,
            suppressSizeToFit: true,
            filter: false
        },
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
            width: 100,
            //suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if(!params.data.is_empty && !params.data.is_header){
                        if (params.data.verified != 1) {
                            Return = "Unverified";
                        } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            Return = "Verified, Waiting Approve";
                        } else {
                            Return = "Approved";
                        }
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
    Space: number = 0;
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
                            jo: $this.DetailID,
                            space: $this.Space
                        };


                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'detail/data', Params).subscribe(
                            result => {

                                // $this.perm = result.permissions;

                                $this.Unapproved = result.unapproved;

                                setTimeout(() => {

                                    var lastRow = -1;
                                    var rowsThisPage = [];

                                    if (result.data) {

                                        var TempID,
                                            TempTipe;
                                        var NewData: any[] = [];

                                        for(let item of result.data){

                                            // var Filter = _.find($this.Data, {
                                            //     is_header: 1,
                                            //     id: item.id
                                            // });

                                            // if(Filter){
                                            //     console.log(item.id, Filter);
                                            //     TempID = Filter.id;
                                            // }

                                            if(item.id != TempID){
                                                TempID = item.id;

                                                NewData.push({
                                                    verified: 1,
                                                    approved: 1,
                                                    is_separator: 1,
                                                    is_header: 1
                                                });
                                                NewData.push({
                                                    id: item.id,
                                                    tanggal: item.tanggal,
                                                    item_kode: item.kode,
                                                    is_header: 1,
                                                    is_big: 1,
                                                    verified: item.verified,
                                                    approved: item.approved,
                                                });

                                                $this.Space += 2;

                                            }

                                            if(item.tipe != TempTipe){
                                                TempTipe = item.tipe;

                                                var TextTipe = '';
                                                switch(TempTipe){
                                                    case 1:
                                                        TextTipe = 'MATERIALS';
                                                        break;
                                                    case 2:
                                                        TextTipe = 'PRODUCTIONS';
                                                        break;
                                                    case 3:
                                                        TextTipe = 'UTILITIES';
                                                        break;
                                                    case 4:
                                                        TextTipe = 'OTHERS';
                                                        break;
                                                }

                                                NewData.push({
                                                    id: item.id,
                                                    item_kode: TextTipe,
                                                    is_header: 1,
                                                    verified: item.verified,
                                                    approved: item.approved,
                                                });

                                                $this.Space += 1;

                                            }

                                            NewData.push(item);
                                        }

                                        result.count += $this.Space;

                                        $this.Data = Object.assign($this.Data, NewData);
                                        rowsThisPage = NewData;

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

        this.Space = 0;
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

            var Style: any = {};

            if (params.data.verified != 1) {

                Style = {
                    color: 'red',
                    backgroundColor: '#faffc4',
                    fontStyle: 'italic'
                };
            }

            if (params.data.verified == 1 && params.data.approved == 0) {
                Style = {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            if(params.data.is_header == 1){
                Style.fontWeight = 'bold';
            }

            if(params.data.is_big == 1){
                Style.fontSize = '15px';
            }

            if(params.data.is_separator == 1){
                // Style.backgroundColor = '#3f51b5';
                Style.backgroundColor = '#ccc';
            }

            return Style;
        }
    }
    //=> / END : Grid Style
    //============================ END : GRID


    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<AP2DetailFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    OpenForm(id) {

        this.form = {};

        if (id === 'add') {   // ADD

             /**
             * Check Unapproved
             */
            if (this.Unapproved > 0) {

                this.core.OpenAlert({
                    title: 'Action Rejected!',
                    msg: `
                        <div>
                            Please Finish all outstanding Actual Production Data before create a new one.
                        </div>
                        <br>
                        <div>
                            Check unapproved sounding on the list.
                        </div>
                    `,
                    width: 400
                });

                return false;

            }
            // => / END : Check Unapproved

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

            this.core.Do(this.ComUrl + 'detail/get', Params).subscribe(
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
            AP2DetailFormDialogComponent,
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
                
                this.Space = 0;
                if (!this.Data) {
                    console.log('load data');
                    this.LoadData(this.gridParams);
                } else {

                    if (ReloadDef == 1) {
                        // this.Data = [];
                        // this.Space = 0;
                        // this.Ready = false;
                        // this.LoadDefault();
                        this.Reload();
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
                    this.core.Do(this.ComUrl + 'detail/delete', Params).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.Space = 0;
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
    // dialogFinishGoods: MatDialogRef<FinishGoodsFormDialogComponent2>;
    // dialogFinishGoodsConfig: MatDialogConfig = {
    //     disableClose: true,
    //     panelClass: 'event-form-dialog'
    // };
    // ShowDialogFinishGoods() {

    //     this.core.Sharing(null, 'reload');

    //     this.dialogFinishGoods = this.dialog.open(
    //         FinishGoodsFormDialogComponent2,
    //         this.dialogFinishGoodsConfig
    //     );

    //     /**
    //      * Inject Data to Dialog
    //      */
    //     this.dialogFinishGoods.componentInstance.Default = this.Default;
    //     this.dialogFinishGoods.componentInstance.from_ap = 1;
    //     //=> / END : Inject Data to Dialog

    //     /**
    //      * After Dialog Close
    //      */
    //     this.dialogFinishGoods.afterClosed().subscribe(result => {

    //         this.dialogFinishGoods = null;

    //         var Reload = 0;

    //         this.core.GetSharing('reload').subscribe(
    //             result => {
    //                 if (result) {
    //                     Reload = 1;
    //                 }
    //             }
    //         );

    //         if (result || Reload == 1) {
    //             if (!this.Data) {
    //                 this.LoadData(this.gridParams);
    //             } else {
    //                 this.gridApi.purgeServerSideCache();
    //             }
    //         }

    //         if (result) {
    //             if (result.reopen == 1) {
    //                 this.OpenForm('detail-' + this.form.id);
    //             }
    //         }

    //     });
    //     //=> / END : After Dialog Close

    // }
    //=> End dialog finish goods

    dialogSummary: MatDialogRef<SummaryDialogComponent>;
    dialogSummaryConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    ShowDialogSummary() {

        // this.core.Sharing(null, 'reload');

        this.dialogSummary = this.dialog.open(
            SummaryDialogComponent,
            this.dialogSummaryConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogSummary.componentInstance.Default = this.Default;
        this.dialogSummary.componentInstance.ComUrl = this.ComUrl;

        // this.dialogSummary.componentInstance = 1;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogSummary.afterClosed().subscribe(result => {

            this.dialogSummary = null;

        });
        //=> / END : After Dialog Close

    }

}