import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from "lodash";

@Component({
    selector: 'app-report-grn',
    templateUrl: './report-grn.component.html',
    styleUrls: ['./report-grn.component.scss'],
    animations: fuseAnimations

})
export class ReportGrnComponent implements OnInit {

    form: any = {};
    ComUrl = "e/snd/report/gr/";
    public Com: any = {
        name: 'Report Goods Receive',
        title: 'Report Goods Receive List',
        icon: 'call_received',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core
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
                $('*[name="company_nama"]').focus();
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

                        /**
                        * Set Storeloc by Company
                        */
                        var Find: any = _.find(this.Default.company, {
                            id: this.filter.company
                        });
                        if (Object.keys(Find).length > 0) {
                            this.Storeloc = Find.store;
                            this.StorelocKeep = Find.store;
                        }
                        //=> / END : 

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

                this.Storeloc = item.store;
                this.StorelocKeep = item.store;

                $('*[name="dept_nama"]').focus();
            }, 100);
        }
    }
    //=> / END : AC Company

    /**
 * AC Storeloc
 */
    Storeloc: any = [];
    StorelocKeep: any = [];
    StorelocLast;
    async StorelocFilter() {

        setTimeout(() => {

            var val = this.filter.storeloc_nama;

            if (val != this.StorelocLast) {

                this.Data = [];

                this.filter.storeloc = null;
                this.filter.storeloc_kode = null;

                this.Storeloc = this.StorelocKeep;

            }

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.StorelocKeep) {

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
                this.Storeloc = this.StorelocKeep;

                this.LoadData(this.gridParams);
            }

        }, 0);

    }
    StorelocSelect(e, item) {
        if (e.isUserInput) {

            setTimeout(() => {

                this.filter.storeloc = item.id;
                //this.filter.storeloc_nama = item.nama;
                this.filter.storeloc_kode = item.kode;

                this.StorelocLast = item.nama;

                this.LoadData(this.gridParams);

            }, 100);

        }
    }
    StorelocReset() {
        /**
         * Reset Storeloc
         */
        this.Data = [];

        this.filter.storeloc = null;
        this.filter.storeloc_kode = null;
        this.filter.storeloc_nama = null;
        //=> / END : Reset Storeloc
    }
    //=> / END : AC Storeloc

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
            headerName: 'GR Code',
            field: 'kode',
            width: 170,
            suppressSizeToFit: true
        },
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,

            valueGetter: function (params) {
                if (params.data) {
                    var Date = moment(params.data.tanggal).format('DD/MM/YYYY');
                    return Date;
                }
            }
        },
        {
            headerName: 'Supplier Code',
            field: 'supplier_kode',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Supplier Name',
            field: 'supplier_nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'PO Code',
            field: 'po_kode',
            width: 170,
            suppressSizeToFit: true
        },
        {
            headerName: 'Description',
            field: 'remarks_header',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Inv. Code',
            field: 'inv_kode',
            width: 170,
            suppressSizeToFit: true
        },
        {
            headerName: 'Item Code',
            field: 'item_kode',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Item Name',
            field: 'nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'OUM',
            field: 'satuan',
            width: 70,
            suppressSizeToFit: true
        },
        {
            headerName: 'QTY Receive',
            field: 'qty_receipt',
            width: 100,
            suppressSizeToFit: true,

            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
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
            headerName: 'QTY Return',
            field: 'qty_return',
            width: 100,
            suppressSizeToFit: true,

            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
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
            headerName: 'Storeloc Code',
            field: 'storeloc_kode',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Storeloc Name',
            field: 'storeloc_nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Item Description',
            field: 'remarks_detail',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Create By',
            field: 'create_by',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Create Date',
            field: 'create_date',
            width: 150,
            suppressSizeToFit: true,

            valueGetter: function (params) {
                if (params.data) {
                    var Date = moment(params.data.create_date).format('DD/MM/YYYY HH:mm:ss');
                    return Date;
                }
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

}
