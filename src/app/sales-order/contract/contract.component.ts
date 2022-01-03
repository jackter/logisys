import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import swal from 'sweetalert2';
import { ContractFormDialogComponent } from './dialog/form';
import * as moment from 'moment';

@Component({
    selector: 'app-contract',
    templateUrl: './contract.component.html',
    styleUrls: ['./contract.component.scss'],
    animations: fuseAnimations
})
export class ContractComponent implements OnInit {

    ComUrl = 'e/so/contract/';

    public Com: any = {
        name: 'Contract',
        title: 'Contract Lists',
        icon: 'library_books',
    };

    form: any = {};
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

                    if (result.params.item_sales_kontrak) {
                        this.Default.item = JSON.parse(JSON.stringify(result.params.item_sales_kontrak.value));
                    }

                    if (result.params.item_sc_quality) {
                        this.Default.quality = JSON.parse(JSON.stringify(result.params.item_sc_quality.value));
                    }

                    if (result.params.sc_notes) {
                        this.Default.notes = JSON.parse(JSON.stringify(result.params.sc_notes.value));
                    }

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
                newRowsAction: 'keep',
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
    // => / END : Grid Options

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;

        // params.api.sizeColumnsToFit();

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
            headerName: 'Company',
            field: 'company_abbr',
            width: 100,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 250,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Customer',
            field: 'cust_nama',
            width: 250,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'PO',
            field: 'po',
            width: 250,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Item',
            field: 'item_nama',
            width: 150,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Qty',
            field: 'qty',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                if (params.value) {
                    var get = params.context;

                    return get.parent.core.rupiah(params.value);
                }
            },
            cellStyle(params) {
                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right'
                    };

                    if (params.data.approved != 1) {
                        var Style = {};
                        Style = get.parent.RowStyle(params);


                        $.extend(Style, Default);

                        return Style;
                    } else {
                        return Default;
                    }
                }
            }
        },
        {
            headerName: 'Grand Total',
            field: 'grand_total',
            width: 200,
            suppressSizeToFit: false,
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

                    if (params.value > 0) {
                        return Return + get.parent.core.rupiah(params.value, 2, true);
                    } else {
                        return '-';
                    }
                }
            },
            cellStyle(params) {
                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                        fontWeight: 'bold'
                    };

                    if (params.data.approved != 1) {
                        var Style = {};
                        Style = get.parent.RowStyle(params);


                        $.extend(Style, Default);

                        return Style;
                    } else {
                        return Default;
                    }
                }
            }
        },
        {
            headerName: 'Status',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'Draft',
                            'Verified'
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
                    } else if (params.data.approved == 1) {
                        Return = 'APPROVED';
                    }
                    else {
                        Return = 'VERIFIED';
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

        if (get.parent.perm.draft && data.approved == 1) {
            menu.push('separator');
            menu.push({
                name: 'Draft',
                action() {
                    get.parent.Draft(data);
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

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.verified != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (params.data.verified == 1 && params.data.approved != 1) {
                return {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }
        }
    }
    // => / END : Grid Style
    // ============================ END : GRID

    /**
    * Form Dialog
    */
    dialogRef: MatDialogRef<ContractFormDialogComponent>;
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
                id: id,
                is_detail: isDetail
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
            ContractFormDialogComponent,
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

        /**
     * Draft
     */
    Draft(data) {

        swal({
                title: 'Apakah Anda Yakin!',
                html: '<div>Draft Data? ' + data.kode + '</div>',
                type: 'warning',
                reverseButtons: true,
                focusCancel: true,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Draft'
            }
        ).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: data.id,
                        kode: data.kode
                    };

                    this.core.Do(this.ComUrl + 'draft', Params).subscribe(
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
                            console.error('draft', error);
                            this.core.OpenNotif(error);
                            this.Busy = false;
                        }
                    );
                }
            }
        );
    }
    // => / END : Draft

}
