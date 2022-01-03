import { Component, OnInit } from '@angular/core';
import { DateAdapter, MatDatepicker, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { LocalStorageService } from 'angular-2-local-storage';
import { fuseAnimations } from 'fuse/animations';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Core } from 'providers/core';

export const MY_FORMATS = {
    parse: {
        dateInput: 'MM/YYYY',
    },
    display: {
        dateInput: 'MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-monitoring-pr',
    templateUrl: './monitoring-pr.component.html',
    styleUrls: ['./monitoring-pr.component.scss'],
    animations: fuseAnimations,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class MonitoringPrComponent implements OnInit {

    ComUrl = 'e/snd/report/monitoring_pr/';

    form: any = {};
    Default: any;
    filter: any = {};
    perm: any = {};
    Busy: any;

    Data: any = [];

    FilterShow: boolean;
    maxDateEnd: any;
    maxDateStart: any;

    public Com: any = {
        name: 'Monitoring Purchase Request',
        title: 'Monitoring Purchase Request',
        icon: 'folder',
    };

    constructor(
        private core: Core,
        private LS: LocalStorageService,
    ) { }

    ngOnInit(): void {
        var Filter = this.LS.get('MonitoringPurchaseRequestFilter');
        if (Filter) {
            this.filter = Filter;

            if (this.filter.F_Start) {
                this.minDateEnd = moment(this.filter.F_Start);
                this.maxDateEnd = new Date;
            } else
                if (this.filter.F_End) {
                    this.maxDateStart = moment(this.filter.F_End);
                    this.minDateStart = null;
                }

            if (
                !this.filter.F_Start || !this.filter.F_End ||
                !this.filter.company || !this.filter.dept
            ) {
                this.FilterShow = true;
            }

        } else {
            this.FilterShow = true;
        }

        this.LoadDefault();

        this.maxDateEnd = new Date;
        this.maxDateStart = new Date;
    }

    isEmpty(obj) {
        return this.core.isEmpty(obj);
    }
    toggleFilterShow() {
        if (this.FilterShow) {
            this.FilterShow = false;
        } else {
            this.FilterShow = true;
        }
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

        this.core.Do('e/accounting/report/gl-summary/default', Params).subscribe(
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

                        this.Dept = this.Company[0].dept;
                        this.DeptKeep = this.Company[0].dept;
                    }
                    // => / Check Company

                    if (this.filter.company) {
                        var Company = _.find(this.Company, {
                            id: this.filter.company
                        });
                        if (Company) {
                            this.Dept = Company.dept;
                            this.DeptKeep = Company.dept;
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

    /*Grid Options*/
    limit = 100;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            width: 100,
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
        suppressCopyRowsToClipboard: true,
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

    TableCol = [
        {
            headerName: 'Code',
            field: 'kode_barang',
            minWidth: 100,
            width: 100,
            suppressSizeToFit: true,
            pinned: 'left'
        },
        {
            headerName: 'Item Descriptions',
            field: 'nama_barang',
            tooltipField: 'nama_barang',
            minWidth: 200,
            width: 200,
            pinned: 'left'
        },
        {
            headerName: 'Qty. Purchase',
            tooltipHeader: 'Qty. Purchase',
            field: 'qty_purchase',
            filter: false,
            minWidth: 100,
            width: 100,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };
                if (params.data.has_child) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2);
                    } else {
                        return '-';
                    }
                }
            }
        },
        {
            headerName: 'PR Code',
            field: 'pr_kode',
            minWidth: 175,
            width: 175,
            tooltipField: 'kode'
        },
        {
            headerName: 'PO Date',
            field: 'po_tgl',
            filter: false,
            minWidth: 100,
            width: 100,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD').format('DD MMM YYYY');
                    }
                }
            }
        },
        {
            headerName: 'PO Code',
            field: 'po_kode',
            minWidth: 275,
            width: 275,
            tooltipField: 'po_kode'
        },
        {
            headerName: 'GRN Date',
            field: 'gr_tgl',
            filter: false,
            minWidth: 100,
            width: 100,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD').format('DD MMM YYYY');
                    }
                }
            }
        },
        {
            headerName: 'GRN Code',
            field: 'gr_kode',
            minWidth: 275,
            width: 275,
            tooltipField: 'gr_kode'
        },
    ];
    // => / END : TableCol


    ExcelStyles = [{
        id: 'rupiah',
        numberFormat: {
            format: '#,##0.00'
        }
    }];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /**
     * Load Data
     */
    DelayData: any;
    LoadData(params) {


        // if (this.filter) {
        //     this.LS.set('MonitoringPurchaseRequestFilter', JSON.parse(JSON.stringify(this.filter)));
        // }

        if (this.filter.F_Start && this.filter.F_End && this.filter.company) {

            /**
             * Load Data
             */
            var Params: any = {
                NoLoader: 1,
                notimeout: 1
            };

            if (this.filter) {
                this.LS.set('MonitoringPurchaseRequestFilter', JSON.parse(JSON.stringify(this.filter)));
                $.extend(Params, this.filter);
            }

            // this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {
                    var Data = [];
                    if (result) {
                        // console.log(result);
                        this.perm = result.permissions;

                        if (result.status == 0) {
                            this.gridApi.showNoRowsOverlay();
                        }

                        /**
                         * Reformat Data
                         */
                        if (result.detail) {
                            var Detail = result.detail;

                            /**
                             * Loop Detail
                             */
                            for (let detail of Detail) {

                                /**
                                 * Find Kode PR
                                 */
                                var PR = _.find(result.data, {
                                    id: detail.header
                                });

                                if (PR) {
                                    detail.pr_kode = PR.kode;
                                    detail.pr_tgl = PR.tanggal;
                                }

                                // => / END : Find Kode PR

                                /**
                                 * Find Kode PO
                                 */
                                var PO: any = _.filter(result.po, {
                                    pr: detail.header
                                });

                                if (PO && PO.length > 0) {
                                    var POKode = '',
                                        POComma = '';
                                    for (let po of PO) {
                                        POKode += POComma + po.kode + ' (' + po.supplier_nama + ')';
                                        POComma = '; ';
                                    }
                                    detail.po = PO[0].id;
                                    detail.po_kode = POKode;
                                    detail.po_tgl = PO[0].tanggal;
                                }
                                /**
                                 * Find Kode GR
                                 */

                                if (PO) {
                                    for (let item of PO) {

                                        var GR: any = _.filter(result.gr, {
                                            po: item.id
                                        });

                                        if (GR && GR.length > 0) {
                                            var GRKode = '',
                                                GRComma = '';
                                            for (let gr of GR) {
                                                GRKode += GRComma + gr.kode + ' (' + gr.supplier_nama + ')';
                                                GRComma = '; ';
                                            }
                                            detail.gr_kode = GRKode;
                                            detail.gr_tgl = GR[0].tanggal;
                                        }
                                    }
                                }
                                Data.push(detail);
                            }
                        }
                    }
                    this.gridApi.setRowData(Data);
                },
                error => {
                    console.error(error);
                    this.Data = [];
                }
            );
        }
    }

    RowStyle(params) {
        if (params.data) {
            var Style: any = {};

            if (params.data.has_child == 1) {
                Style.fontWeight = 'bold';
            }

            if (params.data.padding) {
                Style.paddingLeft = (params.data.padding * 15) + 'px';
            }
            return Style;
        }
    }

    /*Filter Changed*/
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

        menu.push('copy');
        menu.push('excelExport');

        return menu;

    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        // this.ShowDetail(params.data);
    }

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

                this.Dept = item.dept;
                this.DeptKeep = item.dept;

                // this.LoadData(this.gridParams);

                setTimeout(() => {
                    $('*[name="dept_nama"]').focus();
                }, 100);

            }, 100);
        }
    }
    // => / END : AC Company

    /**
     * AC Dept
     */
    Dept: any = [];
    DeptLen: number;
    DeptLast;
    DeptKeep: any = [];
    DelayDept;
    DeptFilter() {

        setTimeout(() => {

            var val = this.filter.dept_nama;

            if (val != this.DeptLast) {

                this.Data = [];

                this.filter.dept = null;
                this.filter.dept_abbr = null;

                this.Dept = this.DeptKeep;
            }

            if (val && this.DeptKeep) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.DeptKeep) {

                    var Combine = item.abbr + ' : ' + item.nama;
                    if (
                        item.abbr.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.Dept = Filtered;

            } else {
                this.LoadData(this.gridParams);
            }

        }, 0);

    }
    DeptSelect(e, item) {
        if (e.isUserInput) {

            setTimeout(() => {
                this.filter.dept = item.id;
                this.filter.dept_nama = item.nama;
                this.filter.dept_abbr = item.abbr;

                this.DeptLast = item.nama;

                this.LoadData(this.gridParams);
            }, 100);
        }
    }
    // => / END : AC Dept

    minDateStart;
    minDateEnd;
    chosenMonthHandler(
        normalizedMonth: moment.Moment,
        datepicker: MatDatepicker<moment.Moment>,
        target
    ) {

        this.filter[target] = moment(normalizedMonth);
        this.filter[target + '_send'] = moment(normalizedMonth).format('YYYY-MM');

        datepicker.close();

        if (target == 'F_Start') {
            this.minDateEnd = moment(normalizedMonth);
            this.maxDateEnd = new Date;
        } else {
            this.maxDateStart = moment(normalizedMonth);
            this.minDateStart = null;
        }

        if (this.gridApi) {
            this.gridApi.showLoadingOverlay();
        }
        this.Reload();
    }
}

