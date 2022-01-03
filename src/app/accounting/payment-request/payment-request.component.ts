import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { PaymentRequestFormDialogComponent } from './dialog/form';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { param } from 'jquery';

@Component({
    selector: 'app-payment-request',
    templateUrl: './payment-request.component.html',
    styleUrls: ['./payment-request.component.scss'],
    animations: fuseAnimations
})
export class PaymentRequestComponent implements OnInit {
    form: any = {};
    ComUrl = 'e/accounting/pay_request/';
    public Com: any = {
        name: 'Payment Request',
        title: 'Payment Request List',
        icon: 'chevron_right',
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
            minWidth: 100,
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

    }
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Tanggal',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
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
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Total',
            field: 'total',
            suppressSizeToFit: true,
            width: 175,
            valueFormatter: function (params) {
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

                    if (params.value > 0) {
                        return Return + get.parent.core.rupiah(params.value, 2, true);
                    } else {
                        return '-';
                    }
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                        fontWeight: 'bold'
                    };

                    if (params.data.approved != 1 && !params.data.bpu_kode) {
                        var Style : any = {};
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
            headerName: 'Keterangan Bayar',
            field: 'keterangan_bayar',
            suppressSizeToFit: true,
            width: 400
        },
        {
            headerName: 'Tujuan Pembayaran',
            field: 'penerima_nama',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Kode',
            field: 'kode',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'SPK/PO/Kontrak',
            field: 'po_no',
            suppressSizeToFit: true,
            width: 180
        },
        {
            headerName: 'Tanggal SPK/PO/Kontrak',
            field: 'po_tgl',
            suppressSizeToFit: true,
            width: 100,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.po_tgl != '0000-00-00') {
                        return moment(params.data.po_tgl).format('DD/MM/YYYY');
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'BPU Kode',
            field: 'bpu_kode',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Tgl. BPU',
            field: 'bpu_tgl',
            filter: false,
            width: 110,
            suppressSizeToFit: true,
        },
        {
            headerName: 'Status',
            field: 'status_data',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'Unverified',
                            'Verified, Waiting Approve',
                            // "Payment on Process",s
                            'Approved',
                            'Canceled'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    if (params.data.status == 0) {
                        return 'Canceled';
                    } else if (params.data.verified != 1 && !params.data.bpu_kode) {
                        return 'Unverified';
                    } else if (params.data.verified == 1 && params.data.approved == 0 && !params.data.bpu_kode) {
                        return 'Verified, Waiting Approve';
                    } else if (params.data.bpu_kode && params.data.bpu_approved != 1) {
                        return 'Payment on Process';
                    } else if (params.data.bpu_kode && params.data.bpu_approved == 1) {
                        return 'Paid';
                    } else {
                        return 'Approved';
                    }

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
            if (params.data.status == 0) {
                return {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }else

            if (params.data.verified != 1 && params.satatus != 0) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }else
            if (params.data.verified == 1 && params.data.approved == 0) {
                return {
                    color: 'blue',
                    fontStyle: 'italic'
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

        if (get.parent.perm.edit && data.verified != 1 && data.status != 0) {
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

        if (get.parent.perm.hapus && data.verified != 1 && data.status != 0) {
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

        if (get.parent.perm.cancel && data.status != 0) {
            if (data.verified != 1) {
                menu.push('separator');
            }
            menu.push({
                name: 'Cancel',
                action() {
                    get.parent.Cancel(data);
                },
                icon: '<i class="fa fa-window-close-o red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
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
        this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click
    // ============================ END : GRID

    /**
   * Form Dialog
   */
    dialogRef: MatDialogRef<PaymentRequestFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    OpenForm(id) {

        this.form = {};

        if (id === 'add') {   // ADD

            this.form.id = 'add';

            this.ShowFormDialog();

        }
        else {  // EDIT

            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }

            //   this.OpenPrintSP3(id);

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
            PaymentRequestFormDialogComponent,
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

            if (result) {
                if (result.reopen == 1) {
                    this.OpenForm('detail-' + this.form.id);
                }
            }

        });
        // => / END : After Dialog Close

    }

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
                        pay_req_type : data.pay_req_type
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
     * Cancel
     */
    Cancel(data) {

        Swal(
            {
                title: 'Apakah Anda Yakin!',
                html: '<div>Cancel Data? ' + data.kode + '</div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }
        ).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: data.id
                    };

                    this.core.Do(this.ComUrl + 'cancel', Params).subscribe(
                        result => {
                            if (result.status == 1) {
                                this.gridApi.purgeServerSideCache();

                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                                this.Busy = false;
                            }
                        },
                        error => {
                            console.error('cancel', error);
                            this.core.OpenNotif(error);
                            this.Busy = false;
                        }
                    );

                }

            }

        );

    }
    // => / END : Cancel
}
