import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Core } from 'providers/core';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import * as _ from 'lodash';

@Component({
    selector: 'app-list-p3',
    templateUrl: './list-p3.component.html',
    styleUrls: ['./list-p3.component.scss'],
    animations: fuseAnimations,
})
export class ListP3Component implements OnInit {
    form: any = {};
    ComUrl = "e/accounting/report/list-p3/";
    public Com: any = {
        name: 'List P3',
        title: 'List P3',
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
        public dialog: MatDialog
    ) {

    }

    ngOnInit() {
        this.LoadDefault();
    }

    Reload() {
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

                $('*[name="dept_nama"]').focus();
            }, 100);
        }
    }
    //=> / END : AC Company

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
        {
            headerName: 'Tanggal',
            field: 'tanggal',
            suppressSizeToFit: true,
        },
        {
            headerName: 'PT',
            field: 'company_abbr',
            suppressSizeToFit: true
        },
        {
            headerName: 'Dept',
            field: 'dept_abbr',
            suppressSizeToFit: true
        },
        {
            headerName: 'Cost Center',
            field: 'cost_center_nama',
            suppressSizeToFit: true
        },
        {
            headerName: 'P3 Type',
            field: 'type',
            suppressSizeToFit: true,
            cellStyle: function(params){
                if (params.data.is_total) {
                    var Style : any = {};
                    Style.fontWeight = 'bold';
                }
                return Style;
            }
        },
        {
            headerName: 'Currency',
            field: 'currency',
            suppressSizeToFit: true,
            cellStyle: function(params){
                if (params.data.is_total) {
                    var Style : any = {};
                    Style.fontWeight = 'bold';
                }
                return Style;

            },
            
        },
        {
            headerName: 'Total',
            field: 'total',
            suppressSizeToFit: true,
            width: 175,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value);
                } else {
                    return "-";
                }
            },
            cellStyle: function(params){
                var Style: any = {
                    textAlign: 'right'
                };
                if (params.data.is_total) {
                    Style.fontWeight = 'bold';
                }
                return Style;
            }
        },
        {
            headerName: 'Keterangan Bayar',
            field: 'keterangan_bayar',
            suppressSizeToFit: true,
            width: 400
        },
        {
            headerName: 'Tujuan Pembayaran',
            field: 'penerima_nama',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Kode',
            field: 'kode',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'SPK/PO/Kontrak',
            field: 'po_no',
            suppressSizeToFit: true,
            width: 180
        },
        {
            headerName: 'Tanggal SPK/PO/Kontrak',
            field: 'po_tgl',
            suppressSizeToFit: true,
            width: 180
        },
        {
            headerName: 'Status',
            field: 'draft',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            "Verified",
                            "Unverified",
                            "Approved"
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    if (params.data.verified != 1) {
                        return "Unverified";
                    } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            return "Verified, Waiting Approve";
                        } else {
                            return "Approved";
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

        this.DataReady = false;
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

                    this.DataReady = true;

                    this.perm = result.permissions;
                    var Data = [];


                    if(result.data) {
                        Data = result.data;

                        var GroupCur : any  = Object.values(_.groupBy(Data, 'currency'));

                        for(let item of GroupCur){
                            item.total = 0;
                            item.is_total = 1;
                            item.currency = 'TOTAL ' + item[0].currency;
                            for (let data of item){
    
                                item.total += data.total; 


                            }
                            
                        }

                        for(let item of Data){
                            if(item.is_manual == 1)  {
                              item.type = 'P3 Manual';
                            }
                            else{
                              item.type = 'Payment Request';
                            }

                        }

                        this.gridApi.setPinnedBottomRowData(GroupCur);
                 
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
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            return {};

            /*if(params.data.finish != 1){

                if(
                    params.data.finish_percent > 0
                ){
                    return {
                        color: 'blue',
                        fontStyle: 'italic'
                    }
                }else{
                    return {
                        color: 'red',
                        backgroundColor: '#fff799',
                        fontStyle: 'italic'
                    }
                }
            }*/

        }
    }
    //=> / END : Grid Style

    /**
     * Filter Changed
     */
    FilterChanged(params) {

        var ParamsFilter = this.gridApi.getFilterModel();

        this.filter.ftable = JSON.stringify(ParamsFilter);

        let rowData = [];
        this.gridApi.forEachNodeAfterFilter(node => {
            rowData.push(node.data);
        });

        var GroupCur : any  = Object.values(_.groupBy(rowData, 'currency'));

        for(let item of GroupCur){
            item.total = 0;
            item.is_total = 1;
            item.currency = 'TOTAL ' + item[0].currency;
            for (let data of item){

                item.total += data.total; 


            }
            
        }

        

        this.gridApi.setPinnedBottomRowData(GroupCur);

    }
    //=> / END : Filter Changed


}
