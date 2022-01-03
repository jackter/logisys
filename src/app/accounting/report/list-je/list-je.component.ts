import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Core } from 'providers/core';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-list-je',
    templateUrl: './list-je.component.html',
    styleUrls: ['./list-je.component.scss'],
    animations: fuseAnimations
})
export class ListJeComponent implements OnInit {

    form: any = {};
    ComUrl = "e/accounting/report/list-je/";
    public Com: any = {
        name: 'List Journal Entry',
        title: 'List Journal Entry',
        icon: 'payment',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];
    ParamID;
    FilterShow: boolean;

    DataReady: boolean = false;

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private activeRoute: ActivatedRoute,
        private LS: LocalStorageService,
        public _fuseConfigService: FuseConfigService,

    ) {

        this.activeRoute.params.subscribe(params => {

            if (params.fdari) {
                this.filter.fdari = params.fdari;
            }
            if (params.fhingga) {
                this.filter.fhingga = params.fhingga;
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

        var Filter = this.LS.get('JEFilter');
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
            cellStyle: this.RowStyle
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
            headerName: 'Tanggal',
            field: 'tanggal',
            suppressSizeToFit: true,
            valueFormatter: function (params) {
                if (params.data) {
                    if (!params.data.is_header && !params.data.no_val) {
                        var Tanggal = moment(params.value, 'YYYY-MM-DD').format('DD/MM/YYYY');
                        return Tanggal;
                    } else {
                        if(!params.data.no_val){
                            return moment(params.value, 'YYYY-MM-DD').format('DD MMM YYYY');
                        }
                    }
                }
            }
        },
        {
            headerName: 'PT',
            field: 'company_abbr',
            suppressSizeToFit: true
        },
        {
            headerName: 'Account',
            field: 'account',
            suppressSizeToFit: true,
            width: 270
        },
        {
            headerName: 'Ref Kode',
            field: 'ref_kode',
            suppressSizeToFit: true,
            width: 200
        },      
        {
            headerName: 'Description',
            field: 'keterangan',
        },
        {
            headerName: 'Total Debit',
            field: 'debit',
            width: 175,
            suppressSizeToFit: true,
            valueGetter: function(params){
                var data = params.data;
                var $this = params.context.parent;
                if(data){
                    if(data.debit != 0 && !data.is_header && !data.no_val){
                        // return data.currency + ' ' + $this.core.rupiah(data.debit, true, 2);
                        return $this.core.rupiah(data.debit, true, 2);
                    }else{
                        if (!params.data.no_val && !data.is_header) {
                            return "-";
                        }
                    }
                }
            },
            cellStyle: function (params) {

                var Style: any = {
                    textAlign: 'right'
                };

                return Style;
            }
        },
        {
            headerName: 'Total Credit',
            field: 'credit',
            suppressSizeToFit: true,
            width: 175,
            valueGetter: function(params){
                var data = params.data;
                var $this = params.context.parent;
                if(data){
                    if(data.credit != 0 && !data.is_header && !data.no_val){

                        // return data.currency + ' ' + $this.core.rupiah(data.credit, true, 2);
                        return $this.core.rupiah(data.credit*-1, true, 2);
                    }else{
                        if (!params.data.no_val && !data.is_header) {
                            return "-";
                        }
                    }
                }
            },
            cellStyle: function (params) {

                var Style: any = {
                    textAlign: 'right'
                };

                return Style;
            }
        },
    ];
    //=> / END : TableCol

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        this.DataReady = false;

        if (this.filter) {
            this.LS.set('JEFilter', JSON.parse(JSON.stringify(this.filter)));
        }

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
                    
                    var Formatted = [];
                    if(result && result.data){

                        this.perm = result.permissions;

                        /**
                         * Format Data
                         */
                        var Data = result.data;

                        for (let item of Data) {
                            Formatted.push({
                                no_val: true
                            });
                            Formatted.push({
                                tanggal: item.tanggal,
                                is_header: true
                            });

                            if (item.detail) {

                                for (let detail of item.detail) {

                                    Formatted.push(detail);
                                }

                            }

                        }
                        // console.log(Formatted);

                        this.gridApi.setRowData(Formatted);
                    }

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
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.is_header) {
                return {
                    fontWeight: 'bold'
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

    }
    //=> / END : Filter Changed

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

}
