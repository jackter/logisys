import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { ReportItemDetailDialogComponent } from 'app/stock/report/report-item/dialog/detail';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    animations: fuseAnimations
})
export class ItemComponent implements OnInit {

    form: any = {};
    ComUrl = "e/manufacturing/report/item/";
    ComUrl2 = "e/stock/report/item/";
    public Com: any = {
        name: 'Item Stock',
        title: 'Item Stock',
        icon: 'folder',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) {

    }

    ngOnInit() {
        this.LoadDefault();
    }

    //======== FillHingga
    FillHingga() {
        this.Data = [];

        var FinalHingga = "";

        if (!this.filter.fhingga) {
            var END = moment(this.filter.fdari, 'YYYY-MM-DD').endOf('month');

            FinalHingga = END.format('YYYY-MM-DD').toString();
            if (moment(END, 'YYYY-MM-DD') > moment(this.maxDate, 'YYYY-MM-DD')) {
                FinalHingga = this.maxDate;
            }

            setTimeout(() => {
                $('*[name="storeloc_nama"]').focus();
            }, 250);
        } else {

            var Dari = moment(this.filter.fdari, 'YYYY-MM-DD');
            var Hingga = moment(this.filter.fhingga, 'YYYY-MM-DD');

            if (Dari > Hingga) {

                var END = moment(this.filter.fdari, 'YYYY-MM-DD').endOf('month');

                FinalHingga = END.format('YYYY-MM-DD').toString();
                if (moment(END, 'YYYY-MM-DD') > moment(this.maxDate, 'YYYY-MM-DD')) {
                    FinalHingga = this.maxDate;
                }

            }

            // this.LoadData(this.gridParams);

        }

        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }

        this.LoadData(this.gridParams);

    }
    //======== / FillHingga

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
                    this.Storeloc = this.Default.data;

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
     * AC Storeloc
     */
    Storeloc: any = [];
    StorelocLast;
    async StorelocFilter() {

        setTimeout(() => {

            var val = this.filter.storeloc_nama;

            if (val != this.StorelocLast) {

                this.Data = [];

                this.filter.storeloc = null;
                this.filter.storeloc_kode = null;
                this.filter.company = null;

            }

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.Default.data) {

                    var Combine = item.kode + ' : ' + item.nama;
                    if (
                        item.kode.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.Storeloc = Filtered;

            } else {
                this.Storeloc = this.Default.data;
            }

        }, 0);

    }
    StorelocSelect(e, item) {
        if (e.isUserInput) {

            setTimeout(() => {

                this.filter.storeloc = item.id;
                this.filter.storeloc_nama = item.nama;
                this.filter.storeloc_kode = item.kode;

                this.filter.company = item.company;

                this.StorelocLast = item.nama;

            }, 100);

        }
    }

    
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

    }
    //=> / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'NO',
            field: 'no',
            width: 50,
            suppressSizeToFit: true,
            suppressFilter: true
        },
        {
            headerName: 'CODE',
            field: 'kode',
            suppressSizeToFit: true,
            width: 125
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'ITEM',
            field: 'nama',
            //suppressSizeToFit: true,
        },
        {
            headerName: 'UNIT',
            field: 'satuan',
            suppressSizeToFit: true,
            width: 100
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'OPENING',
            field: 'saldo',
            suppressSizeToFit: true,
            width: 100,
            cellClass: 'rupiah',
            suppressFilter: true,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value != 0) {
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

            },
        },
        {
            headerName: 'IN',
            field: 'debit',
            suppressSizeToFit: true,
            width: 100,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value != 0) {
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

            },
        },
        {
            headerName: 'OUT',
            field: 'credit',
            suppressSizeToFit: true,
            width: 100,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value != 0) {
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

            },
        },
        {
            headerName: 'CLOSING',
            // field: 'saldo_akhir',
            suppressSizeToFit: true,
            width: 100,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.data) {

                    var saldo_akhir = (Number(params.data.saldo) + Number(params.data.debit)) - Number(params.data.credit);

                    return get.parent.core.rupiah(saldo_akhir, 2, true);
                } else {
                    return "-";
                }
            },
            cellStyle: function (params) {

                var get = params.context;

                var Default = {
                    textAlign: 'right',
                    //fontWeight: 'bold'
                };

                var Style = get.parent.RowStyle(params);

                $.extend(Style, Default);

                return Style;

            },
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

        // console.log(this.filter);

        if (
            this.filter.fdari &&
            this.filter.fhingga &&
            this.filter.company
        ) {

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

                    this.perm = result.permissions;

                    this.gridApi.setRowData(result.data);

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

        menu.push('copy');
        menu.push('excelExport');

        return menu;

    }
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.ShowDetail(params.data);
    }
    //=> / END : Double Click

    //============================ END : GRID ==============================

    /**
     * Detail Dialog
     */
    dialogDetail: MatDialogRef<ReportItemDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    ShowDetail(data) {

        var Params: any = {
            periode: {
                start: this.filter.fdari,
                end: this.filter.fhingga
            },
            company: this.filter.company,
            storeloc: this.filter.storeloc,
            item: data.id
        };

        this.dialogDetail = this.dialog.open(
            ReportItemDetailDialogComponent,
            this.dialogDetailConfig
        );

        /**
         * Injecting Data
         */
        this.dialogDetail.componentInstance.ComUrl = this.ComUrl2;
        this.dialogDetail.componentInstance.Params = Params;
        this.dialogDetail.componentInstance.nama = data.nama;
        //=> / END : Injecting Data

        /**
         * After Close
         */
        this.dialogDetail.afterClosed().subscribe(result => {

            this.dialogDetail = null;

        });
        //=> / END : After Close

    }
    //=> / END : Detail Dialog
}
