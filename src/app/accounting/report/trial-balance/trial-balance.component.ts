import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig, MatDatepicker, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';

import * as _ from 'lodash';

import { FuseConfigService } from 'fuse/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TBDetailDialogComponent } from './dialog/detail';
import * as moment from 'moment';
import { TBPrintDialogComponent } from './dialog/print';

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
    selector: 'app-trial-balance',
    templateUrl: './trial-balance.component.html',
    styleUrls: ['./trial-balance.component.scss'],
    animations: fuseAnimations,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class TrialBalanceComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/report/tb/";

    public Com: any = {
        title: 'Trial Balance Detail',
        icon: 'payment'
    };

    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    Data;

    FilterShow: boolean;

    DataReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private LS: LocalStorageService,
        public _fuseConfigService: FuseConfigService,
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
        var Filter = this.LS.get('TBDetailFilter');
        if (Filter) {
            this.filter = Filter;
        } else {
            this.FilterShow = true;
        }

        this.LoadDefault();
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
    //=> END : Reload Data

    /**
     * Filter Tanggal
     */
     FillHingga() {
        this.Data = [];

        var FinalHingga = '';

        this.filter.fdari = moment(this.filter.fdari, 'YYYY-MM-DD');

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

        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }

        this.LoadData(this.gridParams);
    }
    //=> END : Filter Tanggal


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

    //============================ GRID
    /**
     * Grid Options
     */
     TableCol = [{
        headerName: 'Account No',
        field: 'kode',
        tooltipField: 'kode',
        minWidth: 130,
        width: 130
    },
    {
        headerName: 'Account Name',
        field: 'nama',
        tooltipField: 'nama',
        minWidth: 150,
        width: 150
    },
    {
        headerName: 'Opening Balance',
        field: 'opening_balance',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;

        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah(params.value, 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    },
    {
        headerName: 'Debit',
        field: 'total_debit',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;

        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah(params.value, 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    },
    {
        headerName: 'Credit',
        field: 'total_credit',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;

        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah((params.value * -1), 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    },
    {
        headerName: 'Ending Balance',
        field: 'balance',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;
        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah(params.value, 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    }
    ];
    //=> / END : TableCol

    TableCol2 = [{
        headerName: 'Account No',
        field: 'kode',
        tooltipField: 'kode',
        minWidth: 130,
        width: 130
    },
    {
        headerName: 'Account Name',
        field: 'nama',
        tooltipField: 'nama',
        minWidth: 150,
        width: 150
    },
    {
        headerName: 'Account Type',
        field: 'head_type',
        tooltipField: 'head_type',
        minWidth: 200,
        width: 200
    },
    {
        headerName: 'Opening Balance',
        field: 'opening_balance',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;

        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah(params.value, 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    },
    {
        headerName: 'Debit',
        field: 'total_debit',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;

        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah(params.value, 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    },
    {
        headerName: 'Credit',
        field: 'total_credit',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;

        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah((params.value * -1), 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    },
    {
        headerName: 'Ending Balance',
        field: 'balance',
        filter: false,
        minWidth: 150,
        width: 150,
        cellStyle: function (params) {
            var Style: any = {
                textAlign: 'right'
            };

            if (params.data.is_h == 1 || params.data.is_total) {
                Style.fontWeight = 'bold';
            }

            return Style;
        },
        valueFormatter: function (params) {
            if (params.data) {
                var $this = params.context.parent;
                if (params.value) {
                    return $this.core.rupiah(params.value, 2, true);
                } else {
                    return "0,00";
                }
            }
        }
    }
    ];
    //=> / END : TableCol2

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


    ExcelStyles = [{
        id: 'rupiah',
        numberFormat: {
            format: "#,##0.00"
        }
    }];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        this.DataReady = false;

        if (this.filter) {
            this.LS.set('TBDetailFilter', JSON.parse(JSON.stringify(this.filter)));
        }

        /**
         * Load Data
         */
        var Params = {
            NoLoader: 1,
            notimeout: 1,
            fdari: moment(this.filter.fdari).format('YYYY-MM-DD'),
            fhingga: moment(this.filter.fhingga).format('YYYY-MM-DD'),
            company: this.filter.company
        }

        this.gridApi.showLoadingOverlay();

        this.core.Do(this.ComUrl + 'data', Params).subscribe(
            result => {

                this.DataReady = true;

                var Data = [];
                if (result) {
                    this.perm = result.permissions;

                    if (result.status == 0) {
                        this.gridApi.showNoRowsOverlay();
                    }

                    /**
                     * Reformat Data
                     */
                    Data = result.data;
                    var Jurnal = result.jurnal;
                    var Balance = result.balance;
                    if (Data) {
                        for (let item of Data) {
                            if(item.is_h == 1){
                                item.head_type = 'H';
                            }
                            else{
                                item.head_type = 'D';
                            }
                            
                            /**
                             * Insert CrDb
                             */
                            var FindBalance = _.find(Balance, {
                                coa: item.id
                            });

                            item.balance = 0;
                            item.opening_balance = 0;
                            if (FindBalance) {
                                item.balance = FindBalance.balance;
                                item.opening_balance = FindBalance.opening_balance;
                            }

                            var FindJurnal = _.find(Jurnal, {
                                coa: item.id
                            });

                            item.total_opening_balance = 0;
                            item.total_debit = 0;
                            item.total_credit = 0;
                            item.total_balance = 0;
                            if (FindJurnal) {
                                item.total_debit = FindJurnal.total_debit;
                                item.total_credit = FindJurnal.total_credit;

                                item.balance = Number(item.opening_balance) + Number(FindJurnal.total_debit) + Number(FindJurnal.total_credit);
                            }
                            //=> / END : Insert CrDb

                            /**
                             * Check Child Level
                             */

                            var Parent = _.find(Data, {
                                id: item.accountof
                            });                            

                            if (typeof Parent !== 'undefined'){
                                item.padding = Parent.padding + 1;
                            }

                            //=> / END : Calculate Header Value
                        }

                        for(var i = Data.length-1; i >= 0; i--){
                            var Parent = _.find(Data, {
                                id: Data[i].accountof
                            });                            

                            if (typeof Parent !== 'undefined'){
                                Parent.opening_balance = Number(Parent.opening_balance) + Number(Data[i].opening_balance);
                                Parent.total_debit = Number(Parent.total_debit) + Number(Data[i].total_debit);
                                Parent.total_credit = Number(Parent.total_credit) + Number(Data[i].total_credit);
                                Parent.balance = Number(Parent.opening_balance) + Number(Parent.total_debit) + Number(Parent.total_credit);
                            }
                        }

                        var opening_balance: number = 0;
                        var total_debit: number = 0;
                        var total_credit: number = 0;
                        var balance: number = 0;

                        for (let item of Data) {
                            if (item.is_h != 1) {
                                opening_balance = Number(opening_balance) + Number(item.opening_balance);
                                total_debit = Number(total_debit) + Number(item.total_debit);
                                total_credit = Number(total_credit) + Number(item.total_credit);
                            }
                        }

                        balance = Number(opening_balance) + Number(total_debit) + Number(total_credit);

                        this.gridApi.setPinnedBottomRowData([
                            {
                                nama: "TOTAL",
                                opening_balance: opening_balance,
                                total_debit: total_debit,
                                total_credit: total_credit,
                                balance: balance,
                                is_total: 1
                            }
                        ]);

                    }

                    //=> / END : Reformat Data                
                }
                this.gridApi.setRowData(Data);

                this.Data = Object.values(Data);

            },
            error => {
                console.error(error);
                this.Data = [];
            }
        );

        // }

    }
    //=> / END : Load Data

    ParentBalance(Data){
        for(let item of Data){
            var Parent = _.find(Data, {
                id: item.accountof
            });                            

            if (typeof Parent !== 'undefined'){
                Parent.opening_balance = Number(Parent.opening_balance) + Number(item.opening_balance);
                Parent.total_debit = Number(Parent.total_debit) + Number(item.total_debit);
                Parent.total_credit = Number(Parent.total_credit) + Number(item.total_credit);
                Parent.balance = Number(Parent.opening_balance) + Number(Parent.total_debit) + Number(Parent.total_credit);
            }
        }

        for(let item of Data){
            if(item.is_h == 1 && typeof item.balance === 'undefined'){
                this.ParentBalance(Data)
            }
        }

        return Data;
    }

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            var Style: any = {};

            if (params.data.is_h == 1 || params.data.is_total == 1) {
                Style.fontWeight = 'bold';
            }

            if (params.data.padding) {
                Style.paddingLeft = (params.data.padding * 15) + 'px';
            }

            return Style;

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

        var opening_balance: number = 0;
        var total_debit: number = 0;
        var total_credit: number = 0;
        var balance: number = 0;

        for (let item of rowData) {
            if (item.is_h != 1) {
                opening_balance = Number(opening_balance) + Number(item.opening_balance);
                total_debit = Number(total_debit) + Number(item.total_debit);
                total_credit = Number(total_credit) + Number(item.total_credit);
            }
        }

        balance = Number(opening_balance) + Number(total_debit) + Number(total_credit);

        this.gridApi.setPinnedBottomRowData([
            {
                nama: "TOTAL",
                opening_balance: opening_balance,
                total_debit: total_debit,
                total_credit: total_credit,
                balance: balance,
                is_total: 1
            }
        ]);

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
            name: 'Export to Excel',
            action() {
                try {
                    get.parent.onPageColumnChanged(2);
                } catch (e) {
                    // console.error(e);
                    var D = new Date();

                    var params = {
                        columnGroups: true,
                        fileName: 'TB_Detail_' + data.company_abbr + '_'  + D.getTime(),
                        sheetName: 'TB Detail'
                    };

                    get.parent.gridApi.exportDataAsExcel(params);

                    try {
                        get.parent.onPageColumnChanged(1);
                    } catch (e) {
                        get.parent.Reload();
                        return null;
                    }
                    return null;
                }
            }
        });

        return menu;

    }
    //=> / END : Context Menu

    onPageColumnChanged(val) {
        if(val == 1){
            this.gridApi.setColumnDefs(this.TableCol);
        }
        else{
            this.gridApi.setColumnDefs(this.TableCol2);            
        }
    }

    /**
     * Double Click
     */
    onDoubleClick(params) {
        if(params.data.is_h != 1) {
            this.ShowDetail(params.data);
        }
    }
    // //=> / END : Double Click
    // //============================ END : GRID

    // /**
    //  * Detail Dialog
    //  */
    dialogDetail: MatDialogRef<TBDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    ShowDetail(data) {

        var Params: any = {
            fdari: moment(this.filter.fdari).format('YYYY-MM-DD'),
            fhingga: moment(this.filter.fhingga).format('YYYY-MM-DD'),
            company: this.filter.company,
            coa: data.id
        };

        this.dialogDetail = this.dialog.open(
            TBDetailDialogComponent,
            this.dialogDetailConfig
        );

        /**
         * Injecting Data
         */
        this.dialogDetail.componentInstance.ComUrl = this.ComUrl;
        this.dialogDetail.componentInstance.Params = Params;
        this.dialogDetail.componentInstance.nama = data.account;
        //=> / END : Injecting Data

        /**
         * After Close
         */
        this.dialogDetail.afterClosed().subscribe(result => {

            this.dialogDetail = null;

        });
        //=> / END : After Close

    }
    // //=> / END : Detail Dialog

    /**
     * Print Dialog
     */
     dialogPrint: MatDialogRef<TBPrintDialogComponent>;
     dialogPrintConfig: MatDialogConfig = {
         disableClose: false,
         panelClass: 'event-form-dialog'
     };
     Print() {
 
         this.dialogPrint = this.dialog.open(
             TBPrintDialogComponent,
             this.dialogDetailConfig
         );         

         this.dialogPrint.componentInstance.Data = this.Data;
         this.dialogPrint.componentInstance.filter = this.filter;
 
         /**
          * After Close
          */
         this.dialogPrint.afterClosed().subscribe(result => {
 
             this.dialogPrint = null;
 
         });
         //=> / END : After Close
 
     }
     //=> END : Print Dialog

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

            }, 100);
        }
    }

    CompanyRemove() {
        this.filter.company = null;
        this.filter.company_abbr = null;
        this.filter.company_nama = null;
    }
    //=> / END : AC Company
}
