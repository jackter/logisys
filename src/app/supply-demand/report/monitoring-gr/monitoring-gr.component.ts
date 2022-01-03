import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import * as _ from "lodash";

@Component({
    selector: 'app-monitoring-gr',
    templateUrl: './monitoring-gr.component.html',
    styleUrls: ['./monitoring-gr.component.scss'],
    animations: fuseAnimations
})
export class MonitoringGrComponent implements OnInit {

    ComUrl = "e/snd/report/monitoring_gr/";

    public Com: any = {
        name: 'Goods Receive',
        title: 'Monitoring Goods Receive',
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
            headerName: 'Company',
            field: 'company_abbr',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Dept',
            field: 'dept_abbr',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'MR Code',
            field: 'mr_kode',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'MR Date',
            field: 'mr_date',
            width: 100,
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
            headerName: 'Item Code',
            field: 'item_kode',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Item Name',
            field: 'item_nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Qty MR',
            field: 'qty',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'Qty Approved',
            field: 'qty_approved',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'PR Code',
            field: 'pr_kode',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'PR Date',
            field: 'pr_date',
            width: 100,
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
            headerName: 'Qty PR',
            field: 'qty_pr',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'PO Code',
            field: 'po_kode',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'PO Date',
            field: 'po_date',
            width: 100,
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
            headerName: 'Supplier',
            field: 'supplier_nama',
            width: 250,
            suppressSizeToFit: true
        },
        {
            headerName: 'Currency',
            field: 'currency',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'DP (%)',
            field: 'dp',
            width: 100,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'Qty PO',
            field: 'qty_po',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'Qty Cancel',
            field: 'qty_cancel',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'GR Code',
            field: 'gr_kode',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'GR Date',
            field: 'gr_date',
            width: 100,
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
            headerName: 'Qty Receive',
            field: 'qty_receive',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'Qty Return',
            field: 'qty_return',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
                }
            }
        },
        {
            headerName: 'Qty Outstanding',
            field: 'qty_outstanding',
            width: 150,
            suppressSizeToFit: true,
            cellStyle: function (params) {
                if (params.data) {
                    var Style: any = {
                        textAlign: 'right'
                    };

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value) {
                        return $this.core.rupiah(params.value, 2, true);
                    }
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

                    this.perm = result.permissions;
                    var Data = [];
                    if (result.data) {
                        Data = result.data;

                        var DataUnique = _.uniqBy(Data, function (e) {
                            return [e.po_kode, e.item_kode].join();
                        });                       

                        for (let x of DataUnique) {
                            x.qty_outstanding = 0;
                            for (let y of Data) {
                                if (x.po_kode == y.po_kode && x.item_kode == y.item_kode) {
                                    x.qty_outstanding = Number(x.qty_outstanding) + Number(y.qty_receive) - Number(y.qty_return);
                                }
                            }
                            x.qty_outstanding = Number(x.qty_po) - Number(x.qty_cancel) - Number(x.qty_outstanding);
                        }

                        for (let x of Data) {
                            for (let y of DataUnique) {
                                if (x.po_kode == y.po_kode && x.item_kode == y.item_kode) {
                                    x.qty_outstanding = y.qty_outstanding;
                                }
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
