import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from "lodash";
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { FuseConfigService } from 'fuse/services/config.service';
import { PrintInvAgingDialogComponent } from './dialog/print';

@Component({
    selector: 'app-inv-aging',
    templateUrl: './inv-aging.component.html',
    styleUrls: ['./inv-aging.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class InvAgingComponent implements OnInit {
    form: any = {};
    ComUrl = "e/accounting/report/inv-aging/";
    public Com: any = {
        name: 'Invoice Aging AP',
        title: 'Invoice Aging AP',
        icon: 'payment',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    DataReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private LS: LocalStorageService,
        public _fuseConfigService: FuseConfigService,
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    folded: true
                }
            }
        };
    }

    ngOnInit() {
        this.LoadDefault();
    }

    Reload() {
        this.LoadData(this.gridParams);
    }

    FocusCompany(){

        $('#company_nama').focus();
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

                    this.Company = this.Default.company;

                    /**
                     * Check Company
                     * 
                     * Jika Company hanya 1, maka system akan melakukan Autoselect
                     * dan Mematikan fungsi Auto Complete
                     */
                    this.CompanyLen = Object.keys(this.Company).length;
                    if (this.CompanyLen == 1) {
                        this.filter.company = this.Company[0].id;
                        this.filter.company_abbr = this.Company[0].abbr;
                        this.filter.company_nama = this.Company[0].nama;
                    }
                    //=> / Check Company
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }
    //=> / END : Load Default

    /**
     * AC Company
     */
    Company: any = [];
    CompanyLen: number;
    CompanyLast;
    CompanyFilter() {

        setTimeout(() => {

            var val = this.filter.company_nama;

            if (val != this.CompanyLast) {
                this.Data = [];

                this.filter.company = null;
                this.filter.company_abbr = null;
            }

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.Default.company) {

                    var Combine = item.nama + ' (' + item.abbr + ')';
                    if (
                        item.abbr.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.Company = Filtered;

            } else {
                this.Company = this.Default.company;
            }

        }, 0);

    }
    CompanySelect(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter.company = item.id;
                this.filter.company_nama = item.nama;
                this.filter.company_abbr = item.abbr;

                this.CompanyLast = item.nama;

                $('*[name="supplier_nama"]').focus();
            }, 100);
        }
    }
    //=> / END : AC Company

    /**
     * AC Supplier
     */
    Supplier: any;
    SupplierFilter(val: string) {

        setTimeout(() => {

            var Params = {
                NoLoader: 1,
                company: this.filter.company,
                supplier_nama: this.filter.supplier_nama
            };

            this.core.Do(this.ComUrl + 'list.supplier', Params).subscribe(
                result => {

                    if (result) {
                        this.Supplier = result;
                    }

                },
                error => {
                    this.core.OpenNotif(error);
                }
            );
        });
    }
    SupplierSelect(e, item) {

        if (e.isUserInput) {

            this.filter.supplier = item.supplier;
            this.filter.supplier_kode = item.supplier_kode;
            this.filter.supplier_nama = item.supplier_nama;

            this.LoadData(this.gridParams);

        }
    }
    SupplierRemove() {
        this.filter.supplier = null;
        this.filter.supplier_kode = null;
        this.filter.supplier_nama = null;

        this.LoadData(this.gridParams);
    }
    //=> END : AC Supplier

    //============================ GRID
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
                newRowsAction: "keep"
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

        rowModelType: 'clientSide',
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

    defaultExportParams = {
        suppressTextAsCDATA: true
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
        // {
        //     headerName: 'NO',
        //     field: 'no',
        //     width: 60,
        //     suppressSizeToFit: true,
        //     suppressFilter: true
        // },
        {
            headerName: 'SUPPLIER CODE',
            field: 'supplier_kode',
            suppressSizeToFit: true,
            width: 100,
            colSpan(params) {
                if(params.data) {
                    return params.data.colspan;
                }
            },
            cellStyle(params) {
                if(params.data) {
                    if(params.data.is_header == 1) {
                        return {
                            fontWeight: 'bold'
                        }
                    }
                }
            }
        },
        {
            headerName: 'SUPPLIER CODE',
            field: 'supplier_nama',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'CODE',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'DATE',
            field: 'ref_tgl',
            suppressSizeToFit: true,
            width: 125
        },
        {
            headerName: 'AMOUNT',
            field: 'amount',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE DATE',
            field: 'due_date',
            suppressSizeToFit: true,
            width: 125
        },
        {
            headerName: 'CURRENT',
            field: 'due_cur',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 1 - 30',
            field: 'due_30',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 30 - 60',
            field: 'due_60',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 60 - 90',
            field: 'due_90',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        },
        {
            headerName: 'DUE 91 - OVER',
            field: 'due_over_90',
            suppressSizeToFit: true,
            width: 125,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right'
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            }
        }
    ];
    //=> / END : TableCol

    ExcelStyles = [
        {
            id: 'rupiah',
            numberFormat: {
                format: "#,##0.00"
            }
        }
    ];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        this.DataReady = false;

        if (
            this.filter.tgl_aging &&
            this.filter.company
        ) {
            this.filter.tgl_aging_send = moment(this.filter.tgl_aging).format('YYYY-MM-DD');
            // console.log(this.filter);

            /**
             * Load Data
             */
            var Params = {
                NoLoader: 1,
                notimeout: 1
            };

            if (this.filter) {
                $.extend(Params, this.filter);
            }

            this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    if(result) {
                        
                        var GSupplier = Object.values(_.groupBy(result.data, 'supplier_nama'));

                        var Data = [];
                        for(let item of GSupplier) {

                            if(item) {
                                Data.push({
                                    is_header: 1,
                                    supplier_kode: item[0].supplier_nama.toUpperCase(),
                                    colspan: 11
                                });
    
                                for(let detail of item) {
                                    if(detail) {
                                        detail.colspan = 1;
                                        detail.is_detail = 1;
                                    }
                                    Data.push(detail);
                                }
                                
                                Data.push({
                                    no_val: true,
                                    colspan: 11
                                });
                            }
                        }  
                    
                        this.perm = result.permissions;
                        this.gridApi.setRowData(Data);
                        this.Data = GSupplier;
                    }

                },
                error => {
                    console.error(error);
                    this.Data = [];
                }
            );

        }

    }
    //=> / END : Load Data

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            return {};

        }
    }
    //=> / END : Grid Style

    /**
     * Context Menu
     */
    // getContextMenuItems(params) {

    //     var menu = [];

    //     var data = params.node.data;
    //     var get = params.context;

    //     return menu;

    // }
    //=> / END : Context Menu

    dialogPrint: MatDialogRef<PrintInvAgingDialogComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    Print() {

        this.dialogPrint = this.dialog.open(
            PrintInvAgingDialogComponent,
            this.dialogPrintConfig
        );

        /**
         * Inject Data to Print Dialog
         */
        this.dialogPrint.componentInstance.ComUrl = this.ComUrl;
        this.dialogPrint.componentInstance.Data = this.Data;
        // => / END : Inject Data to Print Dialog

        /**
         * After Dialog Close
         */
        this.dialogPrint.afterClosed().subscribe(result => {
            this.dialogPrint = null;
            if (result) {

            }
        });
        // => / END : After Dialog Close
    }
}
