import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { TrIssuedFormComponent } from '../dialog/form.issued';
import { Core } from 'providers/core';
import { fuseAnimations } from 'fuse/animations';
import swal from 'sweetalert2';

@Component({
    selector: 'inc-delivery',
    templateUrl: './inc.delivery.html',
    animations: fuseAnimations
})
export class TrDeliveryComponent implements OnInit {

    @Input() params: any = {};

    @Output() reload = new EventEmitter();
    
    ComUrl: any;
    Default: any = {};
    perm: any = {};
    form: any = {};

    filter: any = {};
    DFilter: any = {};
    Busy;

    Data: any[] = [];
    
    constructor(
        private core: Core,
        private dialog: MatDialog
    ){
        
    }

    ngOnInit(){
        this.ComUrl = this.params.ComUrl;
        this.Default = this.params.Default;
        this.perm = this.params.Default.permissions;
    }

    Reload(){
        this.Data = [];
        this.LoadData(this.gridParams);
    }

    /**
     * Open Form Issued
     */
    dialogRef: MatDialogRef<TrIssuedFormComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    }
    OpenForm(id){

        this.form = {};

        if(id === 'add'){

            this.form.id = 'add';

            this.ShowFormDialog();

        }else{
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
                jo: this.params.DetailID
            };

            this.core.Do(this.ComUrl + 'deliver/get', Params).subscribe(
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
    ShowFormDialog(){
        this.core.Sharing(null, 'reload');
        this.core.Sharing(null, 'reload_global');

        this.dialogRef = this.dialog.open(
            TrIssuedFormComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = JSON.parse(JSON.stringify(this.Default));
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = this.form;
        this.dialogRef.componentInstance.Request = this.form;
        //=. / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogRef.afterClosed().subscribe(result => {
            this.dialogRef = null;

            var Reload = 0;
            var ReloadGlobal = 0;

            this.core.GetSharing('reload').subscribe(
                result => {
                    if (result) {
                        Reload = 1;
                    }
                }
            );

            this.core.GetSharing('reload_global').subscribe(
                result => {
                    if (result) {
                        ReloadGlobal = 1;
                    }
                }
            );

            if (result && Reload == 1) {
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

            if(ReloadGlobal == 1){
                this.reload.emit();
            }
        });
        //=> / END : After Dialog Close
    }
    //=> / END : Open Form Issued

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
            wrapText: true,
            autoHeight: true
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
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            colSpan: function(params){
                if(params.data && !params.data.is_mrp){
                    return params.data.is_header == 1 ? 2 : 1;
                }else
                if(params.data && params.data.is_mrp == 1){
                    return params.data.is_mrp == 1 ? 7 : 1;
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
            filter: false,
            width: 200,
            minWidth: 200,
            suppressSizeToFit: true,
        },
        {
            headerName: 'Qty',
            field: 'qty_issued',
            filter: false,
            width: 75,
            minWidth: 75,
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

                    if(data.qty_issued && Number(data.qty_issued) != 0){
                        return $this.core.rupiah(Number(data.qty_issued), 2, true);
                    }else{
                        return '-';
                    }

                }
            }
        },
        // {
        //     headerName: 'Total Issued',
        //     field: 'total_issued',
        //     filter: false,
        //     cellStyle: function(params){
        //         if(params.data){

        //             var $this = params.context.parent;

        //             var CurrentStyle = {
        //                 textAlign: 'right'
        //             };

        //             var Style = $.extend($this.RowStyle(params), CurrentStyle);

        //             return Style;

        //         }
        //     },
        //     valueGetter: function (params) {
        //         if (params.data) {

        //             var data = params.data;
        //             var $this = params.context.parent;

        //             if(data.total_issued && Number(data.total_issued) != 0){
        //                 return $this.core.rupiah(Number(data.total_issued), 2, true);
        //             }else{
        //                 return '-';
        //             }

        //         }
        //     }
        // },
        // {
        //     headerName: 'Outstanding',
        //     field: 'outstanding',
        //     filter: false,
        //     width: 75,
        //     minWidth: 75,
        //     cellStyle: function(params){
        //         if(params.data){

        //             var $this = params.context.parent;

        //             var CurrentStyle = {
        //                 textAlign: 'right'
        //             };

        //             var Style = $.extend($this.RowStyle(params), CurrentStyle);

        //             return Style;

        //         }
        //     },
        //     valueGetter: function (params) {
        //         if (params.data) {

        //             var data = params.data;
        //             var $this = params.context.parent;

        //             if(data.outstanding && Number(data.outstanding) != 0){
        //                 return $this.core.rupiah(Number(data.outstanding), 2, true);
        //             }else{
        //                 return '-';
        //             }

        //         }
        //     }
        // },
        {
            headerName: 'UOM',
            field: 'satuan',
            width: 75,
            minWidth: 75,
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
                            Return = "DRAFT";
                        } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            Return = "Verified, Waiting Approve";
                        } else 
                        if(params.data.approved == 1 && params.data.approved2 == 0){
                            Return = "Approved, Waiting Approval from User";
                        }else
                        if(params.data.approved == 1 && params.data.approved2 == 1){
                            Return = 'Finish';
                        }
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
                            jo: $this.params.DetailID
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.Space = 0;

                        $this.core.Do($this.ComUrl + 'deliver/data', Params).subscribe(
                            result => {

                                // $this.count = result.count;
                                // $this.perm = result.permissions;

                                setTimeout(() => {

                                    var lastRow = -1;
                                    var rowsThisPage = [];

                                    if (result.data) {

                                        var TempID;
                                        var NewData: any[] = [];
                                        var MrpID;

                                        for(let item of result.data){

                                            /**
                                             * Kode MRP
                                             */
                                            if(item.mrp != MrpID){
                                                MrpID = item.mrp;

                                                NewData.push({
                                                    verified: 1,
                                                    approved: 1,
                                                    is_separator: 1,
                                                    is_header: 1
                                                });
                                                NewData.push({
                                                    id: item.id,
                                                    tanggal: item.mrp_kode,
                                                    // item_kode: item.mrp_kode,
                                                    is_mrp: 1,
                                                    is_header: 1,
                                                    is_big: 1,
                                                    verified: item.verified,
                                                    approved: item.approved,
                                                });

                                                $this.Space += 2;

                                            }
                                            //=> / END : MRP

                                            if(item.id != TempID){
                                                TempID = item.id;

                                                // NewData.push({
                                                //     verified: 1,
                                                //     approved: 1,
                                                //     is_separator: 1,
                                                //     is_header: 1
                                                // });
                                                NewData.push({
                                                    id: item.id,
                                                    tanggal: item.tanggal,
                                                    item_kode: item.kode,
                                                    is_header: 1,
                                                    // is_big: 1,
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
    // => / END : Context Menu

        /**
     * Double Click
     */
    onDoubleClick(params) {
        if(Number(params.data.is_separator) != 1){
            this.OpenForm('detail-' + params.data.id); 
        }
    }
    onClick(params) {
        // if (params.data.approved == 1) {
        //     this.router.navigate(['/manufacturing/transfer_request2/deliver/' + params.data.id]);
        // }
    }
    // => / END : Double Click

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

            if (params.data.verified == 1 && params.data.approved == 1 && params.data.approved2 == 0) {
                Style = {
                    backgroundColor: '#cbffc4',
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

            Style.whiteSpace = 'normal';
            Style.lineHeight = '16px';

            return Style;
        }
    }
    //=> / END : Grid Style
    // ============================ END : GRID

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
                    this.core.Do(this.ComUrl + 'deliver/delete', Params).subscribe(
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