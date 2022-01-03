import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { BankPaymentDialogFormComponent } from './dialog/form';

@Component({
    selector: 'app-bank-payment',
    templateUrl: './bank-payment.component.html',
    styleUrls: ['./bank-payment.component.scss'],
    animations: fuseAnimations
})
export class BankPaymentComponent implements OnInit {

    ComUrl = 'e/accounting/bank/payment/';
    filter: any = {};
    perm: any = {};
    Default: any = {};
    form: any = {};
    Detail: any = [];

    Data;
    Busy;

    public Com: any = {
        name: 'Bank Payment',
        title: 'Bank Payment List',
        icon: 'assignment'
    };

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        /*Load Company*/
        this.core.Do(this.ComUrl + 'default', {}).subscribe(
            result => {
                if (result) {
                    this.Default.company = result.company;
                    this.Default.company_bank = result.company_bank;
                    this.Default.supplier = result.supplier;
                    this.Default.subjek = result.subjek;
                }
            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );
    }

    /**
    * Reload Data
    */
    Reload() {
        this.LoadData(this.gridParams);
    }
    // => END : Reload Data

    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }

    // =============================== GRID DATA ===============================
    limit = 100;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowAction: 'keep'
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

    TableCol = [
        {
            headerName: 'Tanggal',
            field: 'tanggal',
            pinned: 'left',
            suppressSizeToFit: true,
            width: 100,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.tanggal != '0000-00-00') {
                        return moment(params.data.tanggal).format('DD/MM/YYYY');
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'PT',
            field: 'company_abbr',
            suppressSizeToFit: true,
            width: 80
        },
        {
            headerName: 'Kode',
            field: 'kode',
            suppressSizeToFit: true,
            width: 200
        },
        {
            headerName: 'Bank',
            field: 'bank_kode',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'No Rekening',
            field: 'no_rekening',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Penerima',
            field: 'penerima_nama_bank',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Refference Type',
            field: 'reff_type',
            filter: false,
            suppressSizeToFit: true,
            width: 150,
            filterParams: {
                values(params) {
                    setTimeout(() => {
                        params.success([
                            'Cost Book', 'Payment Request'
                        ]);
                    }, 250);
                },
                newRowAction: 'keep'
            },
            valueGetter(params) {
                if (params.data) {
                    var Return;
                    if (params.data.reff_type == 3) {
                        Return = 'Cost Book';
                    } else if (params.data.reff_type == 5) {
                        Return = 'Payment Request';
                    }
                    return Return;
                }
            }
        },
        {
            headerName: 'Subjek',
            field: 'subjek_nama',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Total',
            field: 'total',
            width: 200,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowAction: 'keep'
            },
            suppressSizeToFit: true,
            cellStyle(params) {
                if (params.data) {
                    var get = params.context;
                    var Default = {
                        textAlign: 'right',
                        fontWeight: 'bold'
                    };

                    if (params.data.approved != 1) {
                        var Style = get.parent.RowStyle(params);
                        $.extend(Style, Default);
                        return Style;
                    } else {
                        return Default;
                    }
                }
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
            }
        },
        {
            headerName: 'Status',
            pinned: 'right',
            width: 150,
            suppressSizeToFit: false,
            filterParams: {
                values(params) {
                    setTimeout(() => {
                        params.success([
                            'DRAFT', 'APPROVED'
                        ]);
                    }, 250);
                },
                newRowAction: 'keep'
            },
            valueGetter(params) {
                if (params.data) {
                    var Return;
                    if (params.data.approved != 1) {
                        Return = 'DRAFT';
                    } else {
                        Return = 'APPROVED';
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

    /*Context Menu*/
    getContextMenuItems(params) {
        var menu = [];
        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit && data.approved != 1) {
            menu.push({
                name: 'Edit',
                action(): void {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
                ]
            });
        }

        if (get.parent.perm.hapus && data.approved != 1) {
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

        if (get.parent.perm.export_xls) {
            menu.push('separator');
            menu.push({
                name: 'Export to Excel',
                action() {
                    get.parent.limit = 1000;
                    get.parent.onPageSizeChanged(1000);
                    get.parent.Reload();

                    setTimeout(() => {
                        var D = new Date();

                        var params = {
                            columnGroups: true,
                            fileName: 'Bank_Payment_' + D.getTime(),
                            sheetName: 'Bank Payment'
                        };

                        get.parent.gridApi.exportDataAsExcel(params);

                        get.parent.limit = 100;
                        get.parent.onPageSizeChanged(100);
                        get.parent.Reload();
                    }, 2000);
                }
            });
        }
        return menu;
    }

    onPageSizeChanged(newPageSize) {
        this.gridApi.paginationSetPageSize(newPageSize);
        const api: any = this.gridApi;
        api.gridOptionsWrapper.setProperty('cacheBlockSize', Number(newPageSize));
    }

    /*Grid Style*/
    RowStyle(params) {
        var Style;
        if (params.data) {
            if (params.data && params.data.approved != 1) {
                Style = {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }
        }
        return Style;
    }

    /*Double CLick*/
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }

    /*Dialog Form*/
    dialogRef: MatDialogRef<BankPaymentDialogFormComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {
        this.form = {};

        if (id == 'add') {
            this.form.id = 'add';
            this.ShowFormDialog();
        } else {
            let IDSplit = id.toString().split('-');
            let isDetail = false;

            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }
            let Params = {
                id: id
            };
            this.core.Do(this.ComUrl + 'get', Params).subscribe(
                result => {
                    if (result) {
                        this.form = result.data;
                        this.Detail = result.data.detail;
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
            BankPaymentDialogFormComponent,
            this.dialogRefConfig
        );
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.form = this.form;
        this.dialogRef.componentInstance.Default = this.Default;
        this.dialogRef.componentInstance.Detail = this.Detail;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.gridApi = this.gridApi;
        this.dialogRef.componentInstance.Total = this.form.total;

        this.dialogRef.afterClosed().subscribe(result => {
            this.dialogRef = null;
            this.Detail = [];

            if (result) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }
                if (result.reopen == 1) {
                    this.OpenForm(result.id);
                }
            }
        });
    }

    /**
     * Delete
     */
    Delete(data) {

        swal({
            title: 'Delete List?',
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
                        reff_type: data.reff_type
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
