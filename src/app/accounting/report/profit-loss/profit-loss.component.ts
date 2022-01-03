import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDialog, MatDatepicker } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Core } from 'providers/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { FuseConfigService } from 'fuse/services/config.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import * as _ from 'lodash';

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
	selector: 'app-profit-loss',
	templateUrl: './profit-loss.component.html',
	styleUrls: ['./profit-loss.component.scss'],
	animations: fuseAnimations,
	providers: [{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE]
		},
		{
			provide: MAT_DATE_FORMATS,
			useValue: MY_FORMATS
		},
	],
})
export class ProfitLossComponent implements OnInit {

	form: any = {};
    ComUrl = "e/accounting/report/profit_loss/";

    public Com: any = {
        title: 'Profit & Loss',
        icon: 'payment'
    };

    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    FilterShow: boolean;
    maxDateEnd;
    maxDateStart;

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
                    folded: false
                }
            }
        };
    }

	ngOnInit() {

        var Filter = this.LS.get('PLFilter');
        if (Filter) {
            this.filter = Filter;

            if (this.filter.bs_date) {
                this.minDateEnd = moment(this.filter.bs_date);
                this.maxDateEnd = new Date;
            } else
                if (this.filter.F_End) {
                    this.maxDateStart = moment(this.filter.F_End);
                    this.minDateStart = null;
                }

        } else {
            this.FilterShow = true;
            this.filter.flisting_type = 1;
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
    //=> END : Reload Data


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

                    this.perm = result.permissions;
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

            }, 100);
        }
    }
    //=> / END : AC Company

    minDateStart;
    minDateEnd;
    chosenMonthHandler(
        normalizedMonth: Moment,
        datepicker: MatDatepicker<Moment>,
        target
    ) {

        this.filter[target] = moment(normalizedMonth);
        this.filter[target + '_send'] = moment(normalizedMonth).format('YYYY-MM');

        datepicker.close();

        if (target == 'bs_date') {
            this.minDateEnd = moment(normalizedMonth);
            this.maxDateEnd = new Date;
        } else {
            this.maxDateStart = moment(normalizedMonth);
            this.minDateStart = null;
        }

        // this.gridApi.showLoadingOverlay();
        this.Reload();
    }

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

        // params.api.sizeColumnsToFit();

        this.LoadData(params);

    }
    //=> / END : Grid Ready

    TableCol = [
        // {
        //     headerName: 'Account No',
        //     field: 'kode',
        //     tooltipField: 'kode',
        //     minWidth: 130,
        //     width: 130
        // },
        {
            headerName: 'Account Name',
            field: 'nama',
            tooltipField: 'nama',
            // minWidth: 150,
            width: 500
        },
        // {
        //     headerName: 'Opening Balance',
        //     field: 'opening_balance',
        //     filter: false,
        //     minWidth: 150,
        //     width: 150,
        //     cellStyle: function (params) {
        //         var Style: any = {
        //             textAlign: 'right'
        //         };

        //         if (params.value < 0) {
        //             Style.color = "red";
        //         }

        //         if (params.data.has_child) {
        //             Style.fontWeight = 'bold';
        //         }

        //         return Style;

        //     },
        //     valueFormatter: function (params) {
        //         if (params.data) {
        //             var $this = params.context.parent;
        //             if (params.value < 0) {
        //                 return $this.core.rupiah((params.value), 2, true);
        //             }
        //             else if (params.value >= 0) {
        //                 return $this.core.rupiah((params.value), 2, true);
        //             } else {
        //                 return "0,00";
        //             }
        //         }
        //     }
        // },
        // {
        //     headerName: 'Debit',
        //     field: 'total_debit',
        //     filter: false,
        //     minWidth: 150,
        //     width: 150,
        //     cellStyle: function (params) {
        //         var Style: any = {
        //             textAlign: 'right'
        //         };
        //         if (params.data.has_child) {
        //             Style.fontWeight = 'bold';
        //         }

        //         return Style;

        //     },
        //     valueFormatter: function (params) {
        //         if (params.data) {
        //             var $this = params.context.parent;
        //             if (params.value) {
        //                 return $this.core.rupiah(params.value, 2, true);
        //             } else {
        //                 return "0,00";
        //             }
        //         }
        //     }
        // },
        // {
        //     headerName: 'Credit',
        //     field: 'total_credit',
        //     filter: false,
        //     minWidth: 150,
        //     width: 150,
        //     cellStyle: function (params) {
        //         var Style: any = {
        //             textAlign: 'right'
        //         };
        //         if (params.data.has_child) {
        //             Style.fontWeight = 'bold';
        //         }

        //         return Style;

        //     },
        //     valueFormatter: function (params) {
        //         if (params.data) {
        //             var $this = params.context.parent;
        //             if (params.value) {
        //                 return $this.core.rupiah((params.value * -1), 2, true);
        //             } else {
        //                 return "0,00";
        //             }
        //         }
        //     }
        // },
        // {
        //     headerName: 'Net Change',
        //     field: 'total_change',
        //     filter: false,
        //     minWidth: 150,
        //     width: 150,
        //     cellStyle: function (params) {
        //         var Style: any = {
        //             textAlign: 'right'
        //         };

        //         if (params.value < 0) {
        //             Style.color = "red";
        //         }

        //         if (params.data.has_child) {
        //             Style.fontWeight = 'bold';
        //         }

        //         return Style;
        //     },
        //     valueFormatter: function (params) {
        //         if (params.data) {
        //             var $this = params.context.parent;
        //             if (params.value < 0) {
        //                 return $this.core.rupiah((params.value), 2, true);
        //             }
        //             else if (params.value >= 0) {
        //                 return $this.core.rupiah((params.value), 2, true);
        //             } else {
        //                 return "0,00";
        //             }
        //         }
        //     }
        // },
        {
            headerName: 'Balance',
            field: 'balance',
            filter: false,
            minWidth: 250,
            width: 250,
            cellStyle: function (params) {

                if(params.data){

                    var $this = params.context.parent;

                    var Style: any = {
                        textAlign: 'right'
                    };

                    if (params.value < 0) {
                        Style.color = "red";
                    }

                    if (params.data.has_child) {
                        Style.fontWeight = 'bold';
                    }

                    // Style = $.extend(Style, $this.RowStyle(params));

                    if(params.data.is_total == 1){
                        Style['border-top'] = '1px solid #000';
                    }

                    if(params.data.no_total == 1){
                        Style['border-top'] = '1px solid #000';
                        Style.fontSize = '16px';
                    }

                    return Style;
                }
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value < 0) {
                        return $this.core.rupiah((params.value), 2, true);
                    }
                    else if (params.value >= 0) {
                        return $this.core.rupiah((params.value), 2, true);
                    } else {
                        return "";
                    }
                }
            }
        }
    ];
    //=> / END : TableCol


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
            this.LS.set('PLFilter', JSON.parse(JSON.stringify(this.filter)));
        }

        // this.filter.F_Start_send = moment(this.filter.F_Start).format('YYYY-MM-DD');
        // this.filter.F_End_send = moment(this.filter.F_End).format('YYYY-MM-DD');

        // console.log(this.filter);

        // if (
        //     this.filter.bulan &&
        //     this.filter.tahun &&
        //     this.filter.company
        // ) {

		/**
		 * Load Data
		 */
        var Params: any = {
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
                
                var Data = [];
                if (result) {

                    if (result.status == 0) {
                        this.gridApi.showNoRowsOverlay();
                    }

                    Data = result.data;
                    var NewData = [];
                    var Jurnal = result.jurnal;
                    var Balance = result.balance;
                    if (Data) {

                        /**
                         * Reformat Data
                         */
                        for (let item of Data) {

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
                            item.total_change = 0;
                            if (FindJurnal) {
                                item.total_debit = FindJurnal.total_debit;
                                item.total_credit = FindJurnal.total_credit;
                            }
                            //=> / END : Insert CrDb

							/**
							 * Check Child Level
							 */
                            for (let lv = 2; lv <= 5; lv++) {
                                if (
                                    item['lv' + (lv)] &&
                                    item['lv' + (lv)] > 0
                                ) {
                                    // Set Parent to Parent
                                    var Parent: any = _.find(Data, {
                                        id: item['lv' + (lv)]
                                    });

                                    Parent.has_child = 1;

                                    // Indentation Nama
                                    item.padding = lv;
                                }
                            }
                            //=> / END : Check Child Level

							/**
							 * Calculate Header Value
							 */
                            if (
                                item.total_debit ||
                                item.total_credit
                            ) {

                                item.balance = Number(item.opening_balance) + Number(item.total_debit) + Number(item.total_credit);

                                for (let lv = item.padding; lv >= 2; lv--) {
                                    var Parent: any = _.find(Data, {
                                        id: item['lv' + lv]
                                    });
                                    Parent.opening_balance = Number(Parent.opening_balance) + Number(item.opening_balance);
                                    Parent.total_debit = Number(Parent.total_debit) + Number(item.total_debit);
                                    Parent.total_credit = Number(Parent.total_credit) + Number(item.total_credit);
                                    Parent.total_change = Number(Parent.total_debit) + Number(Parent.total_credit);
                                    Parent.balance = Number(Parent.opening_balance) + Number(Parent.total_debit) + Number(Parent.total_credit);

                                }
                            }

                            //=> / END : Calculate Header Value

                        }
                        //=> / END : Reformat Data

                        /**
                         * Remove 0 Balance
                         */
                        if(this.filter.flisting_type == 1){
                            for (let item of Data) {
                                if(item.balance != 0){
                                    NewData.push(item);
                                }
                            }
                        }else{
                            NewData = Data;
                        }
                        //=> / END : Remove 0 Balance

                        /**
                         * Restruktur with tree
                         */
                        var ProfitLoss = [];
                        for(let tree of this.Default.tree){
                            
                            if(tree.child){

                                ProfitLoss.push({
                                    nama: tree.name,
                                    no_total: tree.no_total,
                                    padding: 1,
                                    has_child: 1,
                                    store_to: tree.store_to
                                });

                                /**
                                 * Sub 1
                                 */
                                var t0Total: number = 0;
                                for(let t1 of tree.child){

                                    var c2COA = _.filter(NewData, {
                                        type: t1.name
                                    });

                                    ProfitLoss.push({
                                        nama: t1.name,
                                        padding: 2,
                                        has_child: 1,
                                        store_to: t1.store_to
                                    });
                                    var t1Total: number = 0;
                                    for(let item of c2COA){
                                        if(!item.padding){
                                            item.padding = 1;
                                        }
                                        item.padding = Number(item.padding) + 2;
                                        ProfitLoss.push(item);

                                        if(
                                            Number(item.lv1) != 0 && 
                                            Number(item.lv2) == 0
                                        ){
                                            t1Total += item.balance;
                                        }
                                    }

                                    t0Total += t1Total;

                                    var FindPL: any = _.find(ProfitLoss, {
                                        nama: t1.name
                                    });
                                    FindPL[t1.store_to] = t1Total;

                                    ProfitLoss.push({
                                        // nama: "Total T1 " + t1.name,
                                        nama: 'Total ' + t1.name,
                                        padding: 2,
                                        has_child: 1,
                                        is_total: 1,
                                        balance: t1Total
                                    });

                                }
                                //=> / END : Sub 1

                                var FindPL: any = _.find(ProfitLoss, {
                                    nama: tree.name
                                });
                                FindPL[tree.store_to] = t0Total;

                                ProfitLoss.push({
                                    // nama: "Total " + tree.name,
                                    nama: 'Total ' + tree.name,
                                    padding: 1,
                                    has_child: 1,
                                    is_total: 1,
                                    balance: t0Total
                                });
                                
                            }else{
                                var c1COA = _.filter(NewData, {
                                    type: tree.name
                                });

                                var Header: any = {
                                    nama: tree.name,
                                    no_total: tree.no_total,
                                    padding: 1,
                                    has_child: 1,
                                    store_to: tree.store_to
                                };
                                if(tree.no_total == 1){
                                    Header.balance = 0;

                                    /**
                                     * Calculate Gross Profit
                                     */
                                    if(tree.store_to == "gross_profit"){
                                        var Revenue: any = _.find(ProfitLoss, {
                                            // nama: 'Revenue'
                                            store_to: 'revenue'
                                        });
                                        var Cogs: any = _.find(ProfitLoss, {
                                            // nama: 'Cost of Goods Sold'
                                            store_to: 'cogs'
                                        });

                                        if(Revenue && Cogs){
                                            Header.balance = Number(Revenue.revenue) - Number(Cogs.cogs);
                                            Header.gross_profit = Header.balance;
                                        }
                                    }
                                    //=> / END : Calculate Gross Profit

                                    /**
                                     * Calculate Income
                                     */
                                    if(tree.store_to == "income"){
                                        var Profit: any = _.find(ProfitLoss, {
                                            // nama: 'GROSS PROFIT'
                                            store_to: 'gross_profit'
                                        });
                                        var Expense: any = _.find(ProfitLoss, {
                                            // nama: 'Expense'
                                            store_to: 'expense'
                                        });

                                        if(Profit && Expense){
                                            Header.balance = Number(Profit.gross_profit) - Number(Expense.expense);
                                            Header.income = Header.balance;
                                        }
                                    }
                                    //=> / END : Calculate Income

                                    /**
                                     * Calculate PL Before
                                     */
                                    if(tree.store_to == "pl_before"){
                                        var Income: any = _.find(ProfitLoss, {
                                            store_to: 'income'
                                        });

                                        // console.log(Income);

                                        if(Income){
                                            Header.balance = Number(Income.income);
                                            Header.pl_before = Header.balance;
                                        }
                                    }
                                    //=> / END : Calculate PL Before

                                    /**
                                     * Calculate PL After
                                     */
                                    if(tree.store_to == "pl_after"){
                                        var Income: any = _.find(ProfitLoss, {
                                            store_to: 'income'
                                        });

                                        // console.log(Income);

                                        if(Income){
                                            Header.balance = Number(Income.income);
                                            Header.pl_after = Header.balance;
                                        }
                                    }
                                    //=> / END : Calculate PL After
                                }

                                ProfitLoss.push(Header);

                                var t0Total: number = 0;
                                for(let item of c1COA){
                                    if(!item.padding){
                                        item.padding = 1;
                                    }
                                    item.padding = Number(item.padding) + 1;
                                    ProfitLoss.push(item);

                                    if(
                                        Number(item.lv1) != 0 && 
                                        Number(item.lv2) == 0
                                    ){
                                        t0Total += item.balance;
                                    }
                                }

                                /**
                                 * Testing Purposes
                                 */
                                // if(tree.store_to == "gross_profit"){
                                //     var FindPL: any = _.find(ProfitLoss, {
                                //         store_to: 'gross_profit'
                                //     });
                                //     FindPL['gross_profit'] = 21;
                                //     FindPL['balance'] = 21;
                                // }else{
                                //     var FindPL: any = _.find(ProfitLoss, {
                                //         nama: tree.name
                                //     });
                                //     FindPL[tree.store_to] = t0Total;
                                // }
                                //=> / END : Testing Purposes

                                if(!tree.no_total){
                                    var FindPL: any = _.find(ProfitLoss, {
                                        nama: tree.name
                                    });
                                    FindPL[tree.store_to] = t0Total;

                                    ProfitLoss.push({
                                        // nama: "Total E " + tree.name,
                                        nama: 'Total ' + tree.name,
                                        padding: 1,
                                        has_child: 1,
                                        is_total: 1,
                                        balance: t0Total
                                    });
                                }

                                // console.log(tree.name, c1COA);
                            }

                        }
                        //=> / END : Restruktur with tree
                    }

                }
                // this.gridApi.setRowData(NewData);
                this.gridApi.setRowData(ProfitLoss);

                // console.log(ProfitLoss);

            },
            error => {
                console.error(error);
                this.Data = [];
            }
        );

        // }

    }
    //=> / END : Load Data

	/**
	 * Grid Style
	 */
    RowStyle(params) {

        if (params.data) {

            var Style: any = {};

            if (params.data.has_child == 1) {
                Style.fontWeight = 'bold';
                Style.textTransform = 'uppercase';
            }

            if (params.data.is_total == 1) {
                // Style['border-top'] = '1px solid';
                Style.textTransform = 'uppercase';
            }

            if (params.data.padding) {
                Style.paddingLeft = (params.data.padding * 15) + 'px';
            }

            if(params.data.no_total == 1){
                Style.textAlign = 'center';
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

    }
    //=> / END : Filter Changed

	/**
	 * Context Menu
	 */
    // getContextMenuItems(params) {

    //     var menu = [];

    //     var data = params.node.data;
    //     var get = params.context;


    //     return menu;

    // }
    //=> / END : Context Menu

	/**
	 * Double Click
	 */
    onDoubleClick(params) {
        // this.ShowDetail(params.data);
    }
    //=> / END : Double Click
    //============================ END : GRID

}
