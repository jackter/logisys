import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { Core } from 'providers/core';
import { MatDialog } from '@angular/material';
import * as _ from 'lodash';
import { fuseAnimations } from 'fuse/animations';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-report-mr',
    templateUrl: './report-mr.component.html',
    styleUrls: ['./report-mr.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ReportMRComponent implements OnInit {

    form: any = {};
    ComUrl = "e/snd/report/mr/";
    public Com: any = {
        name: 'Report Material Request',
        title: 'Report Material Request List',
        icon: 'folder',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('DD/MM/YYYY');

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

        if (!this.filter.fhingga) {
            var END = moment(this.filter.fdari, 'DD/MM/YYYY').endOf('month');

            this.filter.fhingga = END;
            if (moment(END, 'DD/MM/YYYY') > moment(this.maxDate, 'DD/MM/YYYY')) {
                this.filter.fhingga = this.maxDate;
            }

            alert(this.filter.fhingga);

            setTimeout(() => {
                $('*[name="company_nama"]').focus();
            }, 250);
        } else {

            var Dari = moment(this.filter.fdari, 'DD/MM/YYYY');
            var Hingga = moment(this.filter.fhingga, 'DD/MM/YYYY');

            if (Dari > Hingga) {

                var END = moment(this.filter.fdari, 'DD/MM/YYYY').endOf('month');

                this.filter.fhingga = END;
                if (moment(END, 'DD/MM/YYYY') > moment(this.maxDate, 'DD/MM/YYYY')) {
                    this.filter.fhingga = this.maxDate;
                }

            }

            this.LoadData(this.gridParams);

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

                this.filter.dept = null;
                this.filter.dept_abbr = null;
                this.filter.dept_nama = null;
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

                $('*[name="dept_nama"]').focus();
            }, 100);
        }
    }
    //=> / END : AC Company

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
    //=> / END : AC Dept

    //============================ GRID
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
                newRowsAction: "keep"
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history',
            cellClassRules: {
                'expired': function (params) {
                    return params.data.time_left <= 0;
                },
                'nostock': function (params) {
                    return Number(params.data.stock) < Number(params.data.qty_outstanding) && params.data.time_left != 0;
                }
            }
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

        //params.api.sizeColumnsToFit();

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
        {
            headerName: 'NO.',
            field: 'no',
            width: 75,
            suppressSizeToFit: true,
            suppressFilter: true,
        },
        {
            headerName: 'MR CODE',
            field: 'mr_kode',
            suppressSizeToFit: true,
            width: 200,
            filter: 'agSetColumnFilter'
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'CODE',
            field: 'kode',
            suppressSizeToFit: true,
            width: 125
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'DEPT/PLANT',
            field: 'dept_abbr',
            suppressSizeToFit: true,
            width: 125,
            filter: 'agSetColumnFilter'
        },
        {
            headerName: 'ITEM',
            field: 'nama',
            tooltipField: 'nama'
            //suppressSizeToFit: true,
        },
        {
            headerName: 'UNIT',
            field: 'satuan',
            suppressSizeToFit: true,
            width: 100,
            filter: 'agSetColumnFilter'
            //cellStyle: this.RowStyle,
        },
        {
            headerName: 'QTY. REQUEST',
            field: 'qty_approved',
            suppressSizeToFit: true,
            width: 125,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
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
            headerName: 'ISSUED',
            field: 'qty_gi',
            suppressSizeToFit: true,
            width: 125,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
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
            headerName: 'OUTSTANDING',
            field: 'qty_outstanding',
            suppressSizeToFit: true,
            width: 125,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
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
            headerName: 'STOCK',
            field: 'stock',
            suppressSizeToFit: true,
            width: 125,
            suppressFilter: true,
            cellClass: 'rupiah',
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
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
            headerName: 'TIME LEFT',
            field: 'time_left',
            width: 100,
            suppressSizeToFit: true,
            filter: 'agSetColumnFilter'
        },
        {
            headerName: 'REQUEST DATE',
            field: 'date_request',
            suppressSizeToFit: true,
            width: 125,
            filter: 'agSetColumnFilter'
        },
        {
            headerName: 'TARGET DATE',
            field: 'date_target',
            suppressSizeToFit: true,
            width: 125,
            filter: 'agSetColumnFilter'
        },
    ];
    //=> / END : TableCol

    ExcelStyles = [
        {
            id: 'rupiah',
            numberFormat: {
                format: "#,##0.00"
            },
            dataType: "number"
        },
        {
            id: 'expired',
            font: {
                color: "red",
                italic: true,
            },
            interior: {
                color: "#fff799",
                pattern: 'Solid'
            }
        },
        {
            id: 'nostock',
            font: {
                color: "red",
                italic: true,
            },
        }
    ];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';


    /**
     * Grid Style
     */
    RowStyle(params) {

        var Return = {};

        if (params.data) {

            if (params.data.time_left <= 0) {
                Return = {
                    color: 'red',
                    backgroundColor: '#fff799',
                    fontStyle: 'italic'
                };
            }

            if (
                Number(params.data.stock) < Number(params.data.qty_outstanding) &&
                params.data.time_left != 0
            ) {
                Return = {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }

        }

        return Return;
    }
    //=> / END : Grid Style

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        if (
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

                    /*if(result.data){
                        //this.Data = result.data;
                        this.gridApi.setRowData(result.data);
                    }else{
                        this.Data = [];
                    }*/
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

        menu.push({
            name: 'Export to Excel (.xls) - Formatted',
            icon: '<i class="fa fa-external-link-square" style="font-size: 18px; padding-top: 2px;"></i>',
            action: function () {

                var D = new Date();

                var FileName = get.parent.filter.company_abbr + ' (' + get.parent.filter.dept_abbr + ') - ' + moment(new Date()).format('DD-MM-YYYY');
                if (!get.parent.filter.dept_abbr) {
                    FileName = get.parent.filter.company_abbr + ' - ' + moment(new Date()).format('DD-MM-YYYY');
                }

                var params = {
                    columnGroups: true,
                    fileName: 'MR Report ' + FileName,
                    sheetName: 'MR Report'
                };

                get.parent.gridApi.exportDataAsExcel(params);
            }
        });

        menu.push("separator");

        menu.push({
            name: 'Export to Excel (.xlsx)',
            icon: '<i class="fa fa-external-link-square" style="font-size: 18px; padding-top: 2px;"></i>',
            action: function () {

                var content = get.parent.gridApi.getDataAsExcel(params);

                var workbook = XLSX.read(content, {
                    type: "binary"
                });
                var xlsxContent = XLSX.write(workbook, {
                    bookType: "xlsx",
                    type: "base64",
                });

                var FileName = get.parent.filter.company_abbr + ' (' + get.parent.filter.dept_abbr + ') - ' + moment(new Date()).format('DD-MM-YYYY');
                if (!get.parent.filter.dept_abbr) {
                    FileName = get.parent.filter.company_abbr + ' - ' + moment(new Date()).format('DD-MM-YYYY');
                }
                FileName = "MR Report " + FileName;

                get.parent.core.DownloadExcel(params, xlsxContent, FileName);
            }
        });

        return menu;

    }
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        //this.OpenForm('detail-' + params.data.id);
    }
    //=> / END : Double Click
    //============================ END : GRID

}
