import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { fuseAnimations } from 'fuse/animations';
import * as moment from 'moment';
import { FuseConfigService } from 'fuse/services/config.service';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { ReportACDetailDialogComponent } from './dialog/detail';

@Component({
    selector: 'app-ac',
    templateUrl: './ac.component.html',
    styleUrls: ['./ac.component.scss'],
    animations: fuseAnimations
})
export class AcComponent implements OnInit {

    ComUrl = "e/manufacturing/report/ac/";

    public Com: any = {
        name: 'Actual Consumtion',
        title: 'Actual Consumtion',
        icon: 'description',
    };

    FilterShow: boolean;
    maxDateEnd;
    maxDateStart;

    form: any = {};
    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data;

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core,
        public _fuseConfigService: FuseConfigService,
        public dialog: MatDialog
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

            // setTimeout(() => {
            //     $('*[name="bom_kode"]').focus();
            // }, 250);
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

            this.LoadData(this.gridParams);

        }

        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }

        // this.LoadData(this.gridParams);

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
                    this.Default = result.data;

                    this.BOM = this.Default;

                    /**
                     * Check Product
                     */
                    this.BOMLen = Object.keys(this.BOM).length;

                    if (this.BOMLen == 1) {
                        this.filter.bom = this.BOM[0].id;
                        this.filter.bom_kode = this.BOM[0].kode;
                    }
                    //=> / Check Product
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
     * AC BOM
     */
    BOM: any = [];
    BOMLen: number;
    BOMLast;
    BOMFilter() {

        setTimeout(() => {

            var val = this.filter.bom_kode;

            if (val != this.BOMLast) {
                this.Data = [];

                this.filter.bom = null;
                this.filter.bom_kode = null;

            }

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.Default) {

                    var Combine = item.id + ' (' + item.kode + ')';
                    if (
                        item.id.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.BOM = Filtered;

            } else {
                this.BOM = this.Default;
            }

        }, 0);

    }
    BOMSelect(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter.bom = item.id;
                this.filter.bom_kode = item.kode;

                this.BOMLast = item.kode;

                this.LoadData(this.gridParams);

                // $('*[name="dept_nama"]').focus();
            }, 100);
        }
    }
    BOMReset() {

        this.filter.bom = null;
        this.filter.bom_kode = null;

        this.BOM = this.Default;

        this.LoadData(this.gridParams);
    }
    //=> End AC BOM

    //============================ GRID ===============================
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
            // cellStyle: this.RowStyle,
            // tooltipField: 'history'
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
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.data.is_header && params.data.no_val) {
                        var Tanggal = moment(params.value, 'YYYY-MM-DD').format('DD-MM-YYYY');
                        return Tanggal;
                    } else {
                        return params.value;
                    }
                }
            },
            cellStyle: function (params) {
                var Style: any = {
                };
                if (params.data.is_header) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            },
        },
        {
            headerName: 'Kode',
            field: 'kode',
            width: 200,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {
                };
                if (params.data.is_header) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            }
        },
        {
            headerName: 'Product',
            field: 'nama',
            width: 200,
            // suppressSizeToFit: true,
            cellStyle: function (params) {
                var Style: any = {};

                if (params.data.is_header) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            }
        },
        {
            headerName: 'JO QTY',
            field: 'qty',
            width: 200,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var $this = params.context.parent;
                if(params.data.is_header || params.data.no_val){
                    return ""
                }else{

                    if (params.data && params.value) {
                        return $this.core.rupiah(params.value, 2, true) + ' ' + params.data.satuan;
                    }else{
                        return '-'
                    }
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                    };

                    var Style = {};
                    Style = get.parent.RowStyle(params);


                    $.extend(Style, Default);

                    return Style;
                }

            },
        },
        {
            headerName: 'SR QTY',
            field: 'total',
            width: 200,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                var $this = params.context.parent;
                if(params.data.is_header || params.data.no_val){
                    return ""
                }else{

                    if (params.data && params.value) {
                        return $this.core.rupiah(params.value, 2, true) + ' ' + params.data.satuan;
                    }else{
                        return '-'
                    }
                }
            },
            cellStyle: function (params) {

                if (params.data) {

                    var get = params.context;

                    var Default: any = {
                        textAlign: 'right',
                    };

                    var Style = {};
                    Style = get.parent.RowStyle(params);


                    $.extend(Style, Default);

                    return Style;
                }

            },
        },

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

        if (
            this.filter.fdari &&
            this.filter.fhingga
        ) {

            /**
             * Load Data
             */
            var Params = {
                NoLoader: 1,
                notimeout: 1
            };

            // console.log(Params);

            if (this.filter) {
                this.filter.fhingga = moment(this.filter.fhingga).format('YYYY-MM-DD');
                $.extend(Params, this.filter);
            }

            this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    var Formatted = [];

                    if (result && result.data) {
                        this.perm = result.permissions;

                        var Data = result.data;

                        for (let item of Data) {
                            Formatted.push({
                                no_val: true
                            });

                            Formatted.push({
                                is_header: true,
                                jo: item.jo,
                                kode: item.jo_kode,
                                tanggal: item.tanggal
                            });

                            if (item.detail) {

                                for (let detail of item.detail) {

                                    Formatted.push(detail);

                                }
                            }
                        }

                    }
                    this.gridApi.setRowData(Formatted);

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
        if(params.data.jo){

            this.ShowDetail(params.data);
        }
    }
    //=> / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.is_header) {
                return {
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                };
            } else {
                return {};
            }

        }
    }
    //=> / END : Grid Style
    //============================ END : GRID ==============================

    /**
     * Detail Dialog
     */
    dialogDetail: MatDialogRef<ReportACDetailDialogComponent>;
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
            id: data.jo
        };

        this.dialogDetail = this.dialog.open(
            ReportACDetailDialogComponent,
            this.dialogDetailConfig
        );

        /**
         * Injecting Data
         */
        this.dialogDetail.componentInstance.ComUrl = this.ComUrl;
        this.dialogDetail.componentInstance.Params = Params;
        this.dialogDetail.componentInstance.nama = data.kode;
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
