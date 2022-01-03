import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from "lodash";

@Component({
    selector: 'app-report-wo-history',
    templateUrl: './report-wo-history.component.html',
    styleUrls: ['./report-wo-history.component.scss'],
    animations: fuseAnimations
})
export class ReportWoHistoryComponent implements OnInit {

    ComUrl = "e/operation/report/wo-history/";

    public Com: any = {
        name: 'WO Hisotry',
        title: 'WO History',
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
        private core: Core
    ) { }

    ngOnInit() {
        this.LoadDefault();

        this.filter.fdari = '2020-11-01'
        this.filter.fhingga = '2020-11-30'

        this.filter.company = 3;
        this.filter.company_nama = 'PT Citra Borneo Utama'

        this.LoadData(this.gridParams);

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

            this.LoadData(this.gridParams);

        }

        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }

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

                    this.perm = this.Default.permissions;

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

                this.LoadData(this.gridParams);

            }, 100);
        }
    }
    //=> / END : AC Company

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
            headerName: 'WO Req Date',
            field: 'order_date',
            width: 120,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    }
                }
            }
        },
        {
            headerName: 'WO Proses Date',
            field: 'processed_date',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    }
                }
            }
        },
        {
            headerName: 'Dept',
            field: 'dept_abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'WO No.',
            field: 'kode',
            width: 250,
            suppressSizeToFit: true
        },
        {
            headerName: 'Section',
            field: 'section',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Equipment',
            field: 'equipment_kode',
            suppressSizeToFit: true,
            width: 150,
        },
        {
            headerName: 'Maintenance Type',
            field: 'maintenance_type',
            suppressSizeToFit: true,
            width: 150,
            valueFormatter(params) {
                if (params.value) {
                    if (params.value == 1) {
                        return 'Corrective Maintenance';
                    } else if (params.value == 2) {
                        return 'Preventive Maintenance';
                    } else if (params.value == 3) {
                        return 'Predictive Maintenance';
                    } else if (params.value == 4) {
                        return 'Improvement Maintenance';
                    } else if (params.value == 5) {
                        return 'Fabrication';
                    } else if (params.value == 6) {
                        return 'Project';
                    } else if (params.value == 7) {
                        return 'Breakdown';
                    } else if (params.value == 8){
                        return 'Others';
                    }
                }
            }
        },
        {
            headerName: 'WO Complete Date',
            field: 'completed_date',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    }
                }
            }
        },
        {
            headerName: 'Act WO Process',
            field: 'days',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.data.processed_date && params.data.completed_date) {

                        var Start = moment(params.data.processed_date, 'YYYY-MM-DD');
                        var End = moment(params.data.completed_date, 'YYYY-MM-DD');
                        var total = End.diff(Start, 'day')+1; 

                        return total + ' Days';
                        
                    }else{
                        return '-';
                    }
                }
            }
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

            if (this.filter) {
                this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
                this.filter.fhingga = moment(this.filter.fhingga).format('YYYY-MM-DD');
                $.extend(Params, this.filter);
            }

            this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    var Data = [];
                    if (result.data) {
                        Data = result.data;
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
        // this.OpenForm('detail-' + params.data.id);
    }
    //=> / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.finish != 1) {

                return {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }
        }
    }
    //=> / END : Grid Style
    //============================ END : GRID ==============================
}
