import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { InvoiceMiscellaneousFormDialogComponent } from './dialog/form';
import { InvoiceMiscellaneousPrintDialogComponent } from './dialog/print';

@Component({
    selector: 'app-invoice-miscellaneous',
    templateUrl: './invoice-miscellaneous.component.html',
    styleUrls: ['./invoice-miscellaneous.component.scss'],
    animations: fuseAnimations
})
export class InvoiceMiscellaneousComponent implements OnInit {

    ComUrl = 'e/accounting/invoice/miscellaneous/';
    public Com: any = {
        name: 'Invoice Miscellaneous',
        title: 'Invoice Miscellaneous Lists',
        icon: 'shopping_cart',
    };

    Data;
    Busy;

    Default: any;

    form: any = {};
    filter: any = {};
    perm: any = {};
    def_list: number;

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
                    this.perm = result.permissions;
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
    // => / END : Grid Ready

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
            width: 200
        },
        {
            headerName: 'Ref Code',
            field: 'ref_kode',
            suppressSizeToFit: true,
            width: 200
        },
        {
            headerName: 'Ref Date',
            field: 'ref_tgl',
            width: 100,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.ref_tgl != '0000-00-00') {
                        return moment(params.data.ref_tgl).format('DD/MM/YYYY');
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'Tax Code',
            field: 'pajak_no',
            suppressSizeToFit: true,
            width: 200
        },
        {
            headerName: 'Tax Date',
            field: 'pajak_tgl',
            width: 100,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.pajak_tgl != '0000-00-00') {
                        return moment(params.data.pajak_tgl).format('DD/MM/YYYY');
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'Pihak Ketiga',
            field: 'pihak_ketiga_nama',
            suppressSizeToFit: true
        },
        {
            headerName: 'Total',
            field: 'amount',
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep'
            },
            suppressSizeToFit: true,
            valueFormatter(params) {
                if (params.data) {
                    var get = params.context;
                    var currency = params.data.currency;
                    var Return;

                    if (currency) {
                        if (currency == 'IDR') {
                            Return = 'Rp. ';
                        } else if (currency == 'EUR') {
                            Return = '??? ';
                        } else if (currency == 'CHF') {
                            Return = '??? ';
                        } else if (currency == 'CNH' || currency == 'CNY') {
                            Return = '?? ';
                        } else if (currency == 'GBP') {
                            Return = '?? ';
                        } else if (currency == 'YEN') {
                            Return = '?? ';
                        } else if (currency == 'WON') {
                            Return = '??? ';
                        } else if (currency == 'EUR') {
                            Return = '??? ';
                        } else if (currency == 'KWD') {
                            Return = '??.?? ';
                        } else if (currency == 'LAK') {
                            Return = '??? ';
                        } else if (currency == 'MYR') {
                            Return = 'RM ';
                        } else if (currency == 'NOK' || currency == 'SEK' || currency == 'DKK') {
                            Return = 'kr ';
                        } else if (currency == 'PGK') {
                            Return = 'K ';
                        } else if (currency == 'PHP') {
                            Return = '??? ';
                        } else if (currency == 'SAR') {
                            Return = '??.?? ';
                        } else if (currency == 'THB') {
                            Return = '??? ';
                        } else if (currency == 'VND') {
                            Return = '??? ';
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
    // => END : TableCol

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

        if (get.parent.perm.edit && data.verified != 1) {
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
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.ShowPrintDialog('detail-' + params.data.id);
    }
    // => / END : Double Click
    // ============================ END : GRID ================================

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<InvoiceMiscellaneousFormDialogComponent>;
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

        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            InvoiceMiscellaneousFormDialogComponent,
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
    * Print Invoice
    */
    dialogPrint: MatDialogRef<InvoiceMiscellaneousPrintDialogComponent>;
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
                    this.form.list = result.list;

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
            InvoiceMiscellaneousPrintDialogComponent,
            this.dialogRefConfig
        );

        // => Insert Component Instance
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Com = this.Com;
        this.dialogPrint.componentInstance.form = this.form;
        this.dialogPrint.componentInstance.perm = this.perm;

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
                        id: data.id,
                        tipe: data.tipe
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
