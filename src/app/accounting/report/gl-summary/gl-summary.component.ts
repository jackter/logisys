import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig, MatDatepicker, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import * as moment from 'moment';
import { LocalStorageService } from 'angular-2-local-storage';
import * as _ from 'lodash';
import { FuseConfigService } from 'fuse/services/config.service';
import { Moment } from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GLSummaryDetailDialogComponent } from './dialog/detail';

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
    selector: 'app-gl-summary',
    templateUrl: './gl-summary.component.html',
    styleUrls: ['./gl-summary.component.scss'],
    animations: fuseAnimations,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class GlSummaryComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/report/gl-summary/";

    public Com: any = {
        title: 'General Ledger Summary',
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
                    folded: true
                }
            }
        };
    }



    ngOnInit() {

        var Filter = this.LS.get('GLSumFilter');
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

    TableCol = [
        // {
        //     headerName: 'Date',
        //     field: 'tanggal',
        //     filter: false,
        //     minWidth: 75,
        //     width: 75,
        //     valueFormatter: function(params){
        //         if(params.data){
        //             if(!params.data.is_header && !params.data.no_val){
        //                 var Tanggal = moment(params.value, 'YYYY-MM-DD').format('DD MMM YYYY');
        //                 return Tanggal;
        //             }else{
        //                 return params.value;
        //             }
        //         }
        //     }
        // },
        {
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

                if (params.value < 0) {
                    Style.color = "red";
                }

                if (params.data.has_child) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value < 0) {
                        return "(Cr) " + $this.core.rupiah((params.value), 2, true);
                    }
                    else if (params.value >= 0) {
                        return "(Dr) " + $this.core.rupiah((params.value), 2, true);
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
                if (params.data.has_child) {
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
                if (params.data.has_child) {
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
            headerName: 'Net Change',
            field: 'total_change',
            filter: false,
            minWidth: 150,
            width: 150,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };

                if (params.value < 0) {
                    Style.color = "red";
                }

                if (params.data.has_child) {
                    Style.fontWeight = 'bold';
                }

                return Style;
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value < 0) {
                        return "(Cr) " + $this.core.rupiah((params.value), 2, true);
                    }
                    else if (params.value >= 0) {
                        return "(Dr) " + $this.core.rupiah((params.value), 2, true);
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

                if (params.value < 0) {
                    Style.color = "red";
                }

                if (params.data.has_child) {
                    Style.fontWeight = 'bold';
                }

                return Style;
            },
            valueFormatter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.value < 0) {
                        return "(Cr) " + $this.core.rupiah((params.value), 2, true);
                    }
                    else if (params.value >= 0) {
                        return "(Dr) " + $this.core.rupiah((params.value), 2, true);
                    } else {
                        return "0,00";
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
            this.LS.set('GLSumFilter', JSON.parse(JSON.stringify(this.filter)));
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
                            for (let lv = 1; lv <= 5; lv++) {
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

                            if(item.is_h == 0){
                                item.padding = 6;
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

                                    if(Parent) {
                                        Parent.opening_balance = Number(Parent.opening_balance) + Number(item.opening_balance);
                                        Parent.total_debit = Number(Parent.total_debit) + Number(item.total_debit);
                                        Parent.total_credit = Number(Parent.total_credit) + Number(item.total_credit);
                                        Parent.total_change = Number(Parent.total_debit) + Number(Parent.total_credit);
                                        Parent.balance = Number(Parent.opening_balance) + Number(Parent.total_debit) + Number(Parent.total_credit);
                                    }

                                }
                            }

                            //=> / END : Calculate Header Value

                        }
                    }
                    //=> / END : Reformat Data

                }

                this.gridApi.setRowData(Data);


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
        if(params.data.is_h != 1) {
            this.ShowDetail(params.data);
        }
    }
    //=> / END : Double Click
    //============================ END : GRID

	/**
	* Detail Dialog
	*/
    dialogDetail: MatDialogRef<GLSummaryDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    ShowDetail(data) {

        var Params: any = {
            F_Start: this.filter.F_Start_send,
            F_End: this.filter.F_End_send,
            company: this.filter.company,
            coa: data.id
        };

        // console.log(Params);  

        this.dialogDetail = this.dialog.open(
            GLSummaryDetailDialogComponent,
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
    //=> / END : Detail Dialog

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

        if (target == 'F_Start') {
            this.minDateEnd = moment(normalizedMonth);
            this.maxDateEnd = new Date;
        } else {
            this.maxDateStart = moment(normalizedMonth);
            this.minDateStart = null;
        }

        this.gridApi.showLoadingOverlay();
        this.Reload();
    }
}
