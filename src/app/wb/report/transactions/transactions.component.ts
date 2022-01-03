import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss'],
    animations: fuseAnimations
})
export class TransactionsComponent implements OnInit {

    ComUrl = "e/wb/report/transaction/";

    public Com: any = {
        name: 'Transactions',
        title: 'Transactions',
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
                // $('*[name="product_nama"]').focus();
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
                    this.Default = result.data;

                    this.Product = this.Default;

                    /**
                     * Check Product
                     */
                    this.ProductLen = Object.keys(this.Product).length;

                    if (this.ProductLen == 1) {
                        this.filter.product = this.Product[0].id;
                        this.filter.product_nama = this.Product[0].nama;
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

    WB() {
        this.LoadData(this.gridParams);
    }

    /**
     * AC Company
     */
    Product: any = [];
    ProductLen: number;
    ProductLast;
    ProductFilter() {

        setTimeout(() => {

            var val = this.filter.product_nama;

            if (val != this.ProductLast) {
                this.Data = [];

                this.filter.product = null;
                this.filter.product_nama = null;

            }

            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.Default) {

                    var Combine = item.id + ' (' + item.nama + ')';
                    if (
                        item.id.toLowerCase().indexOf(val) != -1 ||
                        item.nama.toLowerCase().indexOf(val) != -1 ||
                        Combine.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }

                }
                this.Product = Filtered;

            } else {
                this.Product = this.Default;
            }

        }, 0);

    }
    ProductSelect(e, item) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter.product = item.id;
                this.filter.product_nama = item.nama;

                this.ProductLast = item.nama;

                this.LoadData(this.gridParams);

                // $('*[name="dept_nama"]').focus();
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
            headerName: 'Ticket No.',
            field: 'kode',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Date/Time In',
            field: 'w_in_date',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
                    }
                }
            }
        },
        {
            headerName: 'Date/Time Out',
            field: 'w_out_date',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (params.value) {
                        return moment(params.value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
                    }
                }
            }
        },
        {
            headerName: 'Product',
            field: 'product',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Vehicle No.',
            field: 'veh_nopol',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Contract No.',
            field: 'contract_no',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'DO No.',
            field: 'do_no',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Transporter',
            field: 'transporter_nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: '1st Weigh SBI',
            field: 'weigh_in',
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
            headerName: '2nd Weigh SBI',
            field: 'weigh_out',
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
            headerName: 'Netto SBI',
            field: 'netto',
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
            headerName: 'Bruto PKS',
            field: 'bruto_src',
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
            headerName: 'Tara PKS',
            field: 'tara_src',
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
            headerName: 'Netto PKS',
            field: 'netto_src',
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
            headerName: 'PKS Origin',
            field: 'pks',
            width: 150,
            suppressSizeToFit: true
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
                product: this.filter.product,
                wb: this.filter.wb,
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
