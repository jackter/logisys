import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';

import swal from 'sweetalert2';

import { ItemFormDialogComponent } from './dialog/form';
import { ItemFormAkunDialogComponent } from './dialog/form_akun';
import { SuspendFormDialogComponent } from './dialog/suspend';
import { ItemFormAkunSalesDialogComponent } from './dialog/form_akun_sales';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ItemComponent implements OnInit {

    ComUrl = 'e/stock/item/';

    form: any = {};
    formCOA: any = {};

    public Com: any = {
        name: 'Item',
        title: 'Master Data Item',
        icon: 'list_alt'
    };

    Default: any;
    Company: any;
    filter: any = {};
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
        this.ListChange(1);
        this.LoadDefault();
    }

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


        // this.core.Do(this.ComUrl + 'list.company', Params).subscribe(
        //     result => {

        //         if(result){
        //             this.Company = result.company;
        //         }

        //     },
        //     error => {
        //         console.error('LoadDefault', error);
        //         this.core.OpenNotif(error);
        //     }
        // );

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

        // params.api.sizeColumnsToFit();

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
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 125
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Old Code',
            field: 'kode_old',
            suppressSizeToFit: true,
            width: 125
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Item Description',
            field: 'nama',
            tooltipField: 'nama',
            width: 300,
        },
        {
            headerName: 'Specifications',
            field: 'specifications',
            tooltipField: 'specifications',
            width: 200,
            hide: true
        },
        {
            headerName: 'Size',
            field: 'size',
            width: 125,
            hide: true
        },
        {
            headerName: 'Part No.',
            field: 'part_no',
            width: 125,
            hide: true
        },
        {
            headerName: 'Brand',
            field: 'brand',
            width: 150,
            hide: true
        },
        {
            headerName: 'Model / Type',
            field: 'model',
            width: 150,
            hide: true
        },
        {
            headerName: 'Serial No.',
            field: 'serial_no',
            width: 150,
            hide: true
        },
        {
            headerName: 'EQP / Tag No.',
            field: 'tag_no',
            width: 150,
            hide: true
        },
        {
            headerName: 'UOM',
            field: 'satuan',
            suppressSizeToFit: true,
            width: 75
        },
        {
            headerName: 'Stock',
            field: 'stock',
            suppressSizeToFit: true,
            suppressFilter: true,
            width: 125,
            cellStyle: function (params) {

                if (params.data) {

                    if (params.data.stock <= 0) {
                        return {
                            color: 'red',
                            fontWeight: 'bold',
                            textAlign: 'right'
                        };
                    } else {
                        return {
                            textAlign: 'right'
                        };
                    }
                }
            },
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
                } else {
                    return '-';
                }
            },
        },
        // {
        //     headerName: 'Status',
        //     field: 'verified',
        //     pinned: 'right',
        //     filter: 'agSetColumnFilter',
        //     filterParams : {
        //         values: function(params){
        //             setTimeout(() => {
        //                 params.success([
        //                     "Verified",
        //                     "Unverified"
        //                 ]);
        //             }, 250);
        //         },
        //         newRowsAction: 'keep'
        //     },
        //     width: 200,
        //     suppressSizeToFit: true,
        //     cellStyle: function(params){
        //         if(params.data){

        //             if(params.data.verified == 0){
        //                 return {
        //                     color: 'red'
        //                 }
        //             }
        //         }
        //     },
        //     valueGetter: function(params){
        //         if(params.data){

        //             if(params.data.verified == 0){
        //                 return "Unverified";
        //             }else{
        //                 return "Verified";
        //             }

        //         }
        //     }
        // }
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

        if (get.parent.perm.edit && data.status != 0) {
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

        if (get.parent.perm.suspend && data.status != 0) {
            menu.push('separator');
            menu.push({
                name: 'Suspend',
                action: function () {
                    get.parent.OpenSuspend(data);
                },
                icon: '<i class="fa fa-window-close-o red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'red-fg'
                ]
            });
        }

        if (get.parent.perm.add_coa && data.status != 0) {
            menu.push('separator');
            menu.push({
                name: 'Account',
                action: function () {
                    get.parent.Account(data);
                },
                icon: '<i class="fa fa-usd primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
                ]
            });
        }

        if (get.parent.perm.add_coa_sales && data.status != 0) {
            menu.push('separator');
            menu.push({
                name: 'Account Sales',
                action: function () {
                    get.parent.AccountSales(data);
                },
                icon: '<i class="fa fa-money teal-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'teal-fg'
                ]
            });
        }

        if (get.parent.perm.hapus && data.status != 0) {
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
        if (params.data.status != 0) {
            this.OpenForm('detail-' + params.data.id);
        } else {
            this.OpenSuspend(params.data);
        }
    }
    // => / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data && params.data.status == 0) {
            return {
                color: 'red',
                backgroundColor: '#fff799',
                fontStyle: 'italic'
            };
        }
    }
    // => / END : Grid Style
    // ============================ END : GRID

    /**
     * Form Dialog Item
     */
    dialogRef: MatDialogRef<ItemFormDialogComponent>;
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
        this.dialogRef = this.dialog.open(
            ItemFormDialogComponent,
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

            if (result) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }
            }

        });
        // => / END : After Dialog Close

    }
    // => / END : Form Dialog Item

    dialogCOA: MatDialogRef<ItemFormAkunDialogComponent>;
    dialogCOAConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    /**
     * Account
     */
    Account(data) {

        if (data.item_type > 0) {

            this.dialogCOA = this.dialog.open(
                ItemFormAkunDialogComponent,
                this.dialogCOAConfig
            );

            // => ComponentInstance Data
            var Com: any = JSON.parse(JSON.stringify(this.Com));
            Com.title = 'Form Item COA';

            this.dialogCOA.componentInstance.ComUrl = this.ComUrl;
            this.dialogCOA.componentInstance.Default = this.Default;
            this.dialogCOA.componentInstance.Com = Com;
            this.dialogCOA.componentInstance.perm = this.perm;
            this.dialogCOA.componentInstance.Data = data;

            this.dialogCOA.afterClosed().subscribe(result => {

                this.dialogCOA = null;

            });

        } else {
            /**
             * Error Item Type
             * 
             * alert agar user melakukan edit data
             */
            this.core.OpenAlert({
                title: 'Item Type is not defined',
                msg: '<div>To create or defining item Account, please complete the <strong>item type</strong> on the item form.</div><br><div>Please open edit form about this item to modify the item type on the form.</div>',
                width: 400
            });
            // => / END : Alert Item Type
        }
    }
    // => / END : Account

    dialogCOASales: MatDialogRef<ItemFormAkunSalesDialogComponent>;
    dialogCOASalesConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    /**
     * AccountSales
     */
    AccountSales(data) {

        if (data.item_type > 0) {

            this.dialogCOASales = this.dialog.open(
                ItemFormAkunSalesDialogComponent,
                this.dialogCOASalesConfig
            );

            // => ComponentInstance Data
            var Com: any = JSON.parse(JSON.stringify(this.Com));
            Com.title = 'Form Item COA Sales';

            this.dialogCOASales.componentInstance.ComUrl = this.ComUrl;
            this.dialogCOASales.componentInstance.Default = this.Default;
            this.dialogCOASales.componentInstance.Com = Com;
            this.dialogCOASales.componentInstance.perm = this.perm;
            this.dialogCOASales.componentInstance.Data = data;

            this.dialogCOASales.afterClosed().subscribe(result => {

                this.dialogCOASales = null;

            });

        } else {
            /**
             * Error Item Type
             * 
             * alert agar user melakukan edit data
             */
            this.core.OpenAlert({
                title: 'Item Type is not defined',
                msg: '<div>To create or defining item Account, please complete the <strong>item type</strong> on the item form.</div><br><div>Please open edit form about this item to modify the item type on the form.</div>',
                width: 400
            });
            // => / END : Alert Item Type
        }
    }
    // => / END : Account

    /**
     * Suspend items
     */
    SuspenddialogRef: MatDialogRef<SuspendFormDialogComponent>;
    SuspenddialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenSuspend(data) {

        if(data.status == 0){
            data.is_detail = true;
        }        

        this.SuspenddialogRef = this.dialog.open(
            SuspendFormDialogComponent,
            this.SuspenddialogRefConfig
        );

        this.SuspenddialogRef.componentInstance.ComUrl = this.ComUrl;
        this.SuspenddialogRef.componentInstance.perm = this.perm;
        this.SuspenddialogRef.componentInstance.form = data;
        this.SuspenddialogRef.componentInstance.Default = this.Default;

        this.SuspenddialogRef.afterClosed().subscribe(result => {

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
    // => Suspend items

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
