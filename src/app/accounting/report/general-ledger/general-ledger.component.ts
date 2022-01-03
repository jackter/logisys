import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { GLDetailDialogComponent } from './dialog/detail';
import { FuseConfigService } from 'fuse/services/config.service';
import * as _ from 'lodash';
import { GLDetailPrintDialogComponent } from './dialog/print';

@Component({
    selector: 'app-general-ledger',
    templateUrl: './general-ledger.component.html',
    styleUrls: ['./general-ledger.component.scss'],
    animations: fuseAnimations
})
export class GeneralLedgerComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/report/gl/";

    public Com: any = {
        title: 'General Ledger Detail',
        icon: 'payment'
    };

    AllCOA: any = [];

    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    Data;
    ParamID;
    FilterShow: boolean;

    DataReady: boolean = false;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private LS: LocalStorageService,
        public _fuseConfigService: FuseConfigService,
    ) {

        this.activeRoute.params.subscribe(params => {

            if (params.bulan) {
                this.filter.bulan = params.bulan;
            }
            if (params.tahun) {
                this.filter.tahun = Number(params.tahun);
            }
            if (params.company) {
                this.filter.company = params.company;
            }
            if (params.company_nama) {
                this.filter.company_nama = params.company_nama;
            }

            if (params.id) {
                this.ParamID = params.id;
            }

        });

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

        var Filter = this.LS.get('GLFilter');
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

        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        this.filter.fhingga = moment(this.filter.fhingga).format('YYYY-MM-DD');
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

                        var FindCoa = _.find(this.Default.coa, {
                            company: this.filter.company
                        });
        
                        this.filter.coa_kode_from = FindCoa.coa_kode_from;
                        this.filter.coa_kode_to = FindCoa.coa_kode_to;
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
        {
            headerName: 'Date',
            field: 'tanggal',
            filter: false,
            minWidth: 100,
            width: 100,
            valueFormatter: function (params) {
                if (params.data) {
                    if (!params.data.is_header && !params.data.no_val && !params.data.is_total) {
                        var Tanggal = moment(params.value).format('DD/MM/YYYY');
                        return Tanggal;
                    } else {
                        return params.value;
                    }
                }
            },
            colSpan(params){
                if(params.data) {
                    return params.data.colspan;
                }
            }
        },
        {
            headerName: 'Account No',
            field: 'coa_kode',
            tooltipField: 'coa_kode',
            minWidth: 100,
            width: 100
        },
        {
            headerName: 'Account Name',
            field: 'coa_nama',
            tooltipField: 'coa_nama',
            minWidth: 200,
            width: 200
        },
        {
            headerName: 'Source',
            field: 'ref_kode',
            tooltipField: 'ref_kode',
            minWidth: 150,
            width: 150
        },
        {
            headerName: 'Cost Center',
            field: 'cost_center',
            hide: true,
            tooltipField: 'cost_center',
            minWidth: 150,
            width: 150
        },
        {
            headerName: 'Item Name',
            field: 'item_nama',
            hide: true,
            tooltipField: 'item_nama',
            minWidth: 150,
            width: 150
        },
        {
            headerName: 'Job Allocation',
            field: 'job_alocation_nama',
            hide: true,
            tooltipField: 'job_alocation_nama',
            minWidth: 150,
            width: 150
        },
        {
            headerName: 'Third Party',
            field: 'pihak_ketiga_nama',
            hide: true,
            tooltipField: 'pihak_ketiga_nama',
            minWidth: 150,
            width: 150
        },
        {
            headerName: 'Description',
            field: 'keterangan',
            tooltipField: 'keterangan',
            minWidth: 200,
            width: 200
        },
        {
            headerName: 'Debit',
            field: 'debit',
            filter: false,
            minWidth: 150,
            width: 150,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };
                if (params.data.is_header || params.data.is_total) {
                    Style.fontWeight = 'bold';
                }

                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.data.debit) {
                        return $this.core.rupiah(params.data.debit, 2, true);
                    } else {
                        if (!params.data.is_header) {
                            if (!params.data.no_val) {
                                return 0.00;
                            }
                        }
                        // else{
                        //     return $this.core.rupiah(params.data.debit, 2, true);
                        // }
                    }
                }
            }
        },
        {
            headerName: 'Credit',
            field: 'credit',
            filter: false,
            minWidth: 150,
            width: 150,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };
                if (params.data.is_header || params.data.is_total) {
                    Style.fontWeight = 'bold';
                }

                return Style;

            },
            valueGetter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    if (params.data.credit) {
                        return $this.core.rupiah((params.data.credit * -1), 2, true);
                    } else {
                        if (!params.data.is_header) {
                            if (!params.data.no_val) {
                                return 0;
                            }
                        }
                        // else{
                        //     return $this.core.rupiah(params.data.credit, 2, true);
                        // }
                    }
                }
            }
        },
        {
            headerName: 'Balance',
            field: 'balance',
            filter: false,
            minWidth: 150,
            width: 150,
            cellStyle: function (params) {
                var Style: any = {
                    textAlign: 'right'
                };
                if (params.data.is_header || params.data.is_total) {
                    Style.fontWeight = 'bold';
                }

                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {
                    var $this = params.context.parent;
                    // if (params.data.balance < 0) {
                    //     return "(Cr) " + $this.core.rupiah((params.data.balance), 2, true);
                    // }
                    // else if (params.data.balance >= 0) {
                    //     return "(Dr) " + $this.core.rupiah((params.data.balance), 2, true);
                    // }
                    if (params.data.balance < 0 || params.data.balance >= 0) {
                        return $this.core.rupiah((params.data.balance), 2, true);
                    }
                    else {
                        if (!params.data.no_val) {
                            return 0;
                        }
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

        this.Data = [];

        this.DataReady = false;

        if (this.filter) {
            this.LS.set('GLFilter', JSON.parse(JSON.stringify(this.filter)));
        }        

        if (
            this.filter.fdari &&
            this.filter.fhingga &&
            this.filter.company && 
            (this.filter.coa_from || this.filter.coa_kode_from) &&
            (this.filter.coa_to || this.filter.coa_kode_to)
        ) {

            /**
             * Load Data
             */
            var Params: any = {
                NoLoader: 1,
                notimeout: 1,
                fdari: moment(this.filter.fdari).format('YYYY-MM-DD'),
                fhingga: moment(this.filter.fhingga).format('YYYY-MM-DD'),
                coa_kode_from: this.filter.coa_kode_from,
                coa_kode_to: this.filter.coa_kode_to,
                company: this.filter.company
            };

            if (this.ParamID) {
                Params.coa = this.ParamID;
            }

            this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    this.DataReady = true;
                    
                    var Formatted = [];
                    if (result && result.data) {
                        this.perm = result.permissions;

                        if (result.status == 0) {

                            this.gridApi.showNoRowsOverlay();
                        }

                        /**
                         * Format Data
                         */
                        var Data = result.data;

                        var DebitTotal: number = 0;
                        var CreditTotal: number = 0;

                        for (let item of Data) {

                            Formatted.push({
                                no_val: true,
                                colspan: 8
                            });
                            Formatted.push({
                                colspan: 7,
                                tanggal: item.coa_kode + ' - ' + item.coa_nama,
                                // ref_kode: item.coa_nama,
                                is_header: true,
                                balance: item.opening_balance
                            });

                            if (item.detail) {
                                let x = 0;
                                var Debit: number = 0;
                                var Credit: number = 0;
                                for (let detail of item.detail) {

                                    if(detail) {
                                        detail.is_detail = 1;
                                        detail.colspan = 1;
                                    }
                                    /**
                                     * Kalkulasi balance
                                     */
                                    if (x == 0) {
                                        if (detail.debit != 0) {
                                            detail.balance = Number(item.opening_balance) + Number(detail.debit);
                                        } else
                                            if (detail.credit != 0) {
                                                detail.balance = Number(item.opening_balance) + Number(detail.credit);
                                            } else {
                                                detail.balance = Number(item.opening_balance);
                                            }
                                    } else {
                                        if (detail.debit != 0) {
                                            detail.balance = Number(item.detail[x - 1].balance) + Number(detail.debit);
                                        } else
                                            if (detail.credit != 0) {
                                                detail.balance = Number(item.detail[x - 1].balance) + Number(detail.credit);
                                            } else {
                                                detail.balance = Number(item.detail[x - 1].balance);
                                            }
                                    }

                                    if (detail.debit != 0) {
                                        Debit += Number(detail.debit);
                                        DebitTotal += Number(detail.debit);
                                    }
                                    if (detail.credit != 0) {
                                        Credit += Number(detail.credit);
                                        CreditTotal += Number(detail.credit);
                                    }
                                    //=> / END : kalkulasi balance

                                    Formatted.push(detail);

                                    x++;
                                }
                            }

                            //set nilai total debit credit
                            item.tot_debit = Debit;
                            item.tot_credit = Credit;
                            // item.balance = Debit + Credit;
                            item.balance = 0;
                            if (item.detail[item.detail.length - 1].balance) {
                                item.balance = item.detail[item.detail.length - 1].balance;
                            }

                            Formatted.push({
                                colspan: 5,
                                // tanggal: '',
                                account: item.coa_kode,
                                // ref_kode: '',
                                is_total: true,
                                debit: item.tot_debit,
                                credit: item.tot_credit,
                                balance: item.balance
                                // balance: ''
                            });
                        }
                        //=> / END : Format Data

                        this.AllCOA = Data;
                        
                    }

                    this.gridApi.setPinnedBottomRowData([
                        {
                            colspan: 4,
                            is_total: true,
                            keterangan: 'TOTAL',
                            debit: DebitTotal,
                            credit: CreditTotal
                        }
                    ]);
                    
                    this.gridApi.setRowData(Formatted);

                    this.Data = Formatted;
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

            if (params.data.is_header) {
                return {
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                };
            } else {
                return {};
            }

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

        var TotalCredit = 0;
        var TotalDebit = 0;

        for(let item of rowData) {
            if(item.is_detail){
                if(item.credit) {
                    TotalCredit += Number(item.credit);
                }
                if(item.debit) {
                    TotalDebit += Number(item.debit);
                }
            }
        }

        this.gridApi.setPinnedBottomRowData([
            {
                colspan: 4,
                is_total: true,
                keterangan: 'TOTAL',
                debit: TotalDebit,
                credit: TotalCredit
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
        var $this = params.context.parent;

        menu.push('copy');
        menu.push('excelExport');

        return menu;

    }
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        if(params.data.is_detail == 1) {
            this.ShowDetail(params.data);
        }
    }
    //=> / END : Double Click
    //============================ END : GRID


    /**
     * Detail Dialog
     */
    dialogDetail: MatDialogRef<GLDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    ShowDetail(data) {

        var Params: any = {
            periode: this.filter.periode,
            company: this.filter.company,
            ref_kode: data.ref_kode
        };

        this.dialogDetail = this.dialog.open(
            GLDetailDialogComponent,
            this.dialogDetailConfig
        );

        /**
         * Injecting Data
         */
        this.dialogDetail.componentInstance.ComUrl = this.ComUrl;
        this.dialogDetail.componentInstance.Params = Params;
        this.dialogDetail.componentInstance.nama = data.ref_kode;
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
     * Print Dialog
     */
    dialogPrint: MatDialogRef<GLDetailPrintDialogComponent>;
    dialogPrintConfig: MatDialogConfig = {
        disableClose: false,
        panelClass: 'event-form-dialog'
    };
    Print() {

        this.dialogPrint = this.dialog.open(
            GLDetailPrintDialogComponent,
            this.dialogPrintConfig
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

                var FindCoa = _.find(this.Default.coa, {
                    company: this.filter.company
                });

                this.filter.coa_kode_from = FindCoa.coa_kode_from;
                this.filter.coa_kode_to = FindCoa.coa_kode_to;

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

    /**
     * COA
     */
    COA: any = [];
    COAFilter(target) {
    
        var val;
        if(target == 'from') {
            val = this.filter.coa_nama_from;
        }else{
            val = this.filter.coa_nama_to;
        }

        if(val) {

            val = val.toString().toLowerCase();

            let i = 0;
            let Filtered = [];
            for (let item of this.AllCOA) {

                var Combine = item.coa_nama + ' (' + item.coa_kode + ')';
                if(
                    item.coa_kode.toString().toLowerCase().indexOf(val) != -1 ||
                    item.coa_nama.toLowerCase().indexOf(val) != -1 ||
                    Combine.toLowerCase().indexOf(val) != -1
                ) {
                    Filtered[i] = item;
                    i++;
                }
            }
            this.COA = Filtered;
        } else {
            this.COA = this.AllCOA;
        }
    }
    COASelect(e, item, target) {
        if (e.isUserInput) {
            setTimeout(() => {
                this.filter['coa_' + target] = item.coa;
                this.filter['coa_kode_' + target] = item.coa_kode;
                this.filter['coa_nama_' + target] = item.coa_nama;

                if(this.filter.coa_from && this.filter.coa_to) {
                    this.LoadData(this.gridParams);
                }
            }, 100);
        }
    }
    COAReset(target) {
        
        this.filter['coa_' + target] = null;
        this.filter['coa_kode_' + target] = null;
        this.filter['coa_nama_' + target] = null;

        if(!this.filter.coa_from && !this.filter.coa_to) {

            var FindCoa = _.find(this.Default.coa, {
                company: this.filter.company
            });

            this.filter.coa_kode_from = FindCoa.coa_kode_from;
            this.filter.coa_kode_to = FindCoa.coa_kode_to;

            this.LoadData(this.gridParams);
        }
    }
    //=> END : COA

    changedFilter() {
        this.LoadData(this.gridParams);
    }
}
