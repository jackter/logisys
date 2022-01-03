import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'app-stock-adjustment',
    templateUrl: './stock-adjustment.component.html',
    styleUrls: ['./stock-adjustment.component.scss'],
    animations: fuseAnimations
})
export class StockAdjustmentComponent implements OnInit {

    ComUrl = 'e/stock/report/stock-adj/';
    form: any = {};
    filter: any = {};
    perm: any = {};
    Default: any;
    Data: any = [];

    Busy;

    public Com: any = {
        name: 'Stock Adjustment',
        title: 'Stock Adjustment',
        icon: 'folder'
    };

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core
    ) { }

    ngOnInit() {
        this.LoadDefault();
    }

    FillHingga() {
        this.Data = [];

        var FinalHingga = '';

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
        }
        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }
        this.LoadData(this.gridParams);
    }

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
                        // /* Set Storeloc by Company*/
                        var Find: any = _.find(this.Default.company, {
                            id: this.filter.company
                        });
                        if (Object.keys(Find).length > 0) {
                            this.Storeloc = Find.store;
                            this.StorelocKeep = Find.store;
                        }
                    }
                }
            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );
    }

    /*AC Company*/
    Company: any = [];
    CompanyLen: number;
    FilterCompany() {

        setTimeout(() => {
            var val = this.filter.company_nama;

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

    SelectCompany(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter.company = item.id;
                this.filter.company_nama = item.nama;
                this.filter.company_abbr = item.abbr;

                this.Storeloc = item.store;
                this.StorelocKeep = item.store;

                $('*[name="storeloc_nama"]').focus();
            }, 100);
        }
    }

    ResetCompany() {
        this.filter.company         = null;
        this.filter.company_abbr    = null;
        this.filter.company_nama    = null;

        this.Storeloc = [];
        this.StorelocKeep = [];
    }

    Storeloc: any = [];
    StorelocKeep: any = [];
    FilterStoreloc() {

        setTimeout(() => {
            var val = this.filter.storeloc_nama;

            if (val) {
                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];

                for (let item of this.StorelocKeep) {
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
                this.Storeloc = Filtered;
            } else {
                this.Storeloc = this.StorelocKeep;
            }
        }, 0);
    }

    SelectStoreloc(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter.storeloc = item.id;
                this.filter.storeloc_kode = item.kode;
                this.filter.storeloc_nama = item.nama;

                var Find = _.filter(this.Data, {
                    storeloc: item.id
                });

                if (Find) {
                    this.gridApi.setRowData(Find);
                } else {
                    this.gridApi.showLoadingOverlay();
                }

            }, 100);
        }
    }

    ResetStoreloc() {
        this.filter.storeloc = null;
        this.filter.storeloc_kode = null;
        this.filter.storeloc_nama = null;

        this.gridApi.setRowData(this.Data);
    }

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

    /* Grid Ready */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }

    /* TableCol */
    TableCol = [
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            valueFormatter(params) {
                if (params.value) {
                    if (params.value != '0000-00-00') {
                        return moment(params.value, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 225,
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
            field: 'item_nama',
            width: 150,
            suppressSizeToFit: false
        },
        {
            headerName: 'UOM',
            field: 'item_satuan',
            width: 75,
            suppressSizeToFit: true
        },
        {
            headerName: 'Storage',
            field: 'storeloc_nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Qty',
            field: 'qty',
            width: 150,
            suppressSizeToFit: true,
            cellStyle(params) {

                return {
                    textAlign: 'right'
                };
            },
            valueFormatter(params) {
                if(params.value){
                    var get = params.context;
                    if (params.value != 0) {
                        return get.parent.core.rupiah(params.value, 2, true);
                    } else {
                        return "-";
                    }
                }
            }
        }
    ];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /*Load Data*/
    DelayData;

    LoadData(params) {
        if (
            this.filter.fdari && 
            this.filter.fhingga && 
            this.filter.company
        ) {
            /*Load Data*/
            var Params = {
                NoLoader: 1,
                notimeout: 1
            };

            if (this.filter) {
                $.extend(Params, this.filter);
            }

            if (this.gridApi) {
                this.gridApi.showLoadingOverlay();
            }

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {
                    // this.perm = result.permissions;
                    if (result) {
                        this.Data = result.data;
                        this.gridApi.setRowData(result.data);
                    }

                },
                error => {
                    console.error(error);
                    this.Data = [];
                }
            );
        }
    }

    /* Grid Style */
    RowStyle(params) {
        // if (params.data) {
        //     return {
        //         fontWeight: 'bold'
        //     }
        // }
    }

    /* Filter Changed */
    FilterChanged(params) {
        var ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }

    /*Context Menu*/
    getContextMenuItems(params) {
        var menu = [];
        var data = params.node.data;
        var get = params.context;

        menu.push('copy');
        menu.push('excelExport');

        return menu;
    }

}
