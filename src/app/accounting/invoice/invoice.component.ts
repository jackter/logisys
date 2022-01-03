import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import swal from 'sweetalert2';
import * as moment from 'moment';

import { InvoiceFormDialogComponent } from './dialog/form';
import { PrintFormDialogComponent } from './dialog/print';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
    animations: fuseAnimations
})
export class InvoiceComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/invoice/standart/";
    public Com: any = {
        name: 'Invoice',
        title: 'Invoice Lists',
        icon: 'class',
    };

    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.LoadDefault();
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
        maxBlocksInCache: 10
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

        /**
         * Reload
         */
        /*setInterval(() => {
            this.gridApi.purgeServerSideCache();
        }, 60000);*/
        //=> / END : Reload
    }
    //=> / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            width: 100,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Dept',
            field: 'dept_abbr',
            width: 100,
            suppressSizeToFit: true,
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'PO Code',
            field: 'po_kode',
            suppressSizeToFit: true,
            width: 175
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'Ref Code',
            field: 'ref_kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Ref Date',
            field: 'ref_tgl',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                return moment(params.value).format('DD/MM/YYYY');
            }
        },
        {
            headerName: 'Tax Code',
            field: 'pajak_no',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Tax Date',
            field: 'pajak_tgl',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if(params.value != '0000-00-00'){
                    return moment(params.value).format('DD/MM/YYYY');
                }else{
                    return "-";
                }
            }
        },
        {
            headerName: 'Supplier',
            field: 'supplier_nama',
            suppressSizeToFit: true
        },
        {
            headerName: 'Total',
            field: 'amount',
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: "keep"
            },
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
                } else {
                    return "-";
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
                        Default.color = "#FFF;";
                    }

                    if (params.data.verified != 1) {
                        var Style = {};
                        Style = get.parent.RowStyle(params);


                        $.extend(Style, Default);

                        return Style;
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
                            "DRAFT",
                            "VERIFIED"
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
                        Return = "DRAFT";
                    } else {
                        Return = "VERIFIED";
                    }

                    return Return;

                }
            }
        }
    ];
    //=> / END : TableCol

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
                            NoLoader: 1
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
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenPrint('detail-' + params.data.id);
    }
    //=> / END : Double Click
    //============================ END : GRID

    /**
    * Form Dialog
    */
    dialogRef: MatDialogRef<InvoiceFormDialogComponent>;
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
        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            InvoiceFormDialogComponent,
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

        });
        //=> / END : After Dialog Close

    }

    PrintRef: MatDialogRef<PrintFormDialogComponent>;
    PrintRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenPrint(id) {

        var IDSplit = id.toString().split('-');

        var isDetail = false;
        if (IDSplit[0] == "detail") {
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

                    this.ShowPrintDialog();
                }

            },
            error => {
                console.error('GetForm', error);
                this.core.OpenNotif(error);
            }
        );

    }
    ShowPrintDialog() {
        this.core.Sharing(null, 'reload');

        this.PrintRef = this.dialog.open(
            PrintFormDialogComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.PrintRef.componentInstance.ComUrl = this.ComUrl;
        this.PrintRef.componentInstance.Default = this.Default;
        this.PrintRef.componentInstance.Com = this.Com;
        this.PrintRef.componentInstance.perm = this.perm;
        this.PrintRef.componentInstance.form = this.form;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.PrintRef.afterClosed().subscribe(result => {

            this.PrintRef = null;

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
    //=> / END : Form Dialog

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
