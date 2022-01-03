import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from 'fuse/animations';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Core } from 'providers/core';
import { SalesMiscDialogFormComponent } from './dialog/form';
import { SalesMiscDialogPrintComponent } from './dialog/print';

@Component({
    selector: 'app-sales-inv-misc',
    templateUrl: './sales-inv-misc.component.html',
    styleUrls: ['./sales-inv-misc.component.scss'],
    animations: fuseAnimations
})
export class SalesInvMiscComponent implements OnInit {

    ComUrl = 'e/accounting/invoice/sales_misc/';

    public Com: any = {
        name: 'Sales Invoice Miscellaneous',
        title: 'Sales Invoice Miscellaneous Lists',
        icon: 'shopping_cart',
    };

    Data;
    Busy;
    Default: any;
    form: any = {};
    filter: any = {};
    perm: any = {};

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
    // => END : Reload Data

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

                    if (result.params.sales_invoice) {
                        this.Default.sales_invoice = JSON.parse(JSON.stringify(result.params.sales_invoice.value));
                    }
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Load Default

    // ============================ GRID ===============================
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
                newRowsAction: 'keep'
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history'

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
    }

    /**
    * TableCol
    */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Inv Date',
            field: 'inv_tgl',
            width: 100,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.inv_tgl != '0000-00-00') {
                        return moment(params.data.inv_tgl).format('DD/MM/YYYY');
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'Customer',
            field: 'cust_nama'
        },
        {
            headerName: 'Total',
            field: 'amount',
            filter: 'agTextColumnFilter',
            width: 250,
            suppressSizeToFit: true,
            filterParams: {
                newRowsAction: 'keep'
            },
            valueFormatter(params) {
                if (params.data) {
                    var get = params.context;
                    var currency = params.data.currency;
                    var Return;

                    if (currency) {
                        if (currency == 'IDR') {
                            Return = 'Rp. ';
                        } else if (currency == 'EUR') {
                            Return = '€ ';
                        } else if (currency == 'CHF') {
                            Return = '₣ ';
                        } else if (currency == 'CNH' || currency == 'CNY') {
                            Return = '¥ ';
                        } else if (currency == 'GBP') {
                            Return = '£ ';
                        } else if (currency == 'YEN') {
                            Return = '¥ ';
                        } else if (currency == 'WON') {
                            Return = '₩ ';
                        } else if (currency == 'EUR') {
                            Return = '€ ';
                        } else if (currency == 'KWD') {
                            Return = 'د.ك ';
                        } else if (currency == 'LAK') {
                            Return = '₭ ';
                        } else if (currency == 'MYR') {
                            Return = 'RM ';
                        } else if (currency == 'NOK' || currency == 'SEK' || currency == 'DKK') {
                            Return = 'kr ';
                        } else if (currency == 'PGK') {
                            Return = 'K ';
                        } else if (currency == 'PHP') {
                            Return = '₱ ';
                        } else if (currency == 'SAR') {
                            Return = 'ر.س ';
                        } else if (currency == 'THB') {
                            Return = '฿ ';
                        } else if (currency == 'VND') {
                            Return = '₫ ';
                        } else {
                            Return = '$ ';
                        }
                    } else {
                        Return = '';
                    }
                }

                if (params.value > 0) {
                    return Return + get.parent.core.rupiah(params.value, 2, true);
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
                            'DRAFT',
                            'VERIFIED'
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
                    } else {
                        Return = 'VERIFIED';
                    }

                    return Return;

                }
            }
        }
    ];

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

        if (get.parent.perm.edit && data.verified != 1 && data.tipe == 3) {
            menu.push({
                name: 'Edit',
                action: function () {
                    get.parent.OpenForm('detail-' + data.id);
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

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.ShowPrintDialog('detail-' + params.data.id);
    }

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<SalesMiscDialogFormComponent>;
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
                        this.form.list = result.data.list;

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
            SalesMiscDialogFormComponent,
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

    /**
    * Print Invoice
    */
    dialogPrint: MatDialogRef<SalesMiscDialogPrintComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    ShowPrintDialog(id) {

        var IDSplit = id.toString().split('-');

        var isDetail = false;
        if (IDSplit[0] == 'detail') {
            isDetail = true;
            id = IDSplit[1];
        }

        var Params = {
            id: id
        };

        this.core.Do(this.ComUrl + 'print', Params).subscribe(
            result => {
                if (result) {

                    this.form = result.data;
                    this.form.list = result.data.list;

                    if (isDetail) {
                        this.form.is_detail = isDetail;
                    }

                    this.PrintDialog();

                }

            },
        );
    }

    PrintDialog() {

        this.dialogPrint = this.dialog.open(
            SalesMiscDialogPrintComponent,
            this.dialogRefConfig
        );

        // => Insert Component Instance
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Com = this.Com;
        this.dialogPrint.componentInstance.form = this.form;
        this.dialogPrint.componentInstance.perm = this.perm;
        this.dialogPrint.componentInstance.Default = this.Default;

        this.dialogPrint.afterClosed().subscribe(result => {

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

    }
    // => / END : Print Invoice

    /**
     * Delete
     */
    Delete(data) {

        Swal({
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
                        id: data.id,
                        sc: data.sc
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
