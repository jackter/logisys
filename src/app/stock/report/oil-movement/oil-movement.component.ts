import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import * as _ from "lodash";
import * as XLSX from 'xlsx';
import { ReportOilMovementDetailDialogComponent } from './dialog/form';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-oil-movement',
    templateUrl: './oil-movement.component.html',
    styleUrls: ['./oil-movement.component.scss'],
    animations: fuseAnimations,
})
export class OilMovementComponent implements OnInit {

    form: any = {};
    ComUrl = "e/stock/report/oil-movement/";
    public Com: any = {
        name: 'Oil Movement',
        title: 'Oil Movement',
        icon: 'folder',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core,
        public dialog: MatDialog,
        public _fuseConfigService: FuseConfigService
    ) {
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    folded: true
                }
            }
        };
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
    CompanyRemove() {
        this.filter.company         = null;
        this.filter.company_abbr    = null;
        this.filter.company_nama    = null;
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
                newRowsAction: 'keep'
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
    }
    //=> / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Tank Kode',
            field: 'kode',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Tank Name',
            field: 'nama',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Oil',
            field: 'produk',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Opening Stock',
            children: [
                {
                    headerName: 'Qty',
                    field: 'qty_opening',
                    width: 150,
                    suppressSizeToFit: true,
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        }
                    },
                    cellStyle(params) {
                        var Default = {
                            textAlign: 'right'
                        };

                        return Default;
                    }
                },
                {
                    headerName: 'Temp (C)',
                    field: 'temp_opening',
                    suppressSizeToFit: true,
                    width: 150,
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        var Default = {
                            textAlign: 'right'
                        };

                        return Default;
                    }
                },
                {
                    headerName: 'Sounding (cm)',
                    field: 'sounding_opening',
                    suppressSizeToFit: true,
                    width: 150,
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        var Default = {
                            textAlign: 'right'
                        };

                        return Default;
                    }
                },
            ]
        },
        {
            headerName: 'Total Receive',
            field: 'total_receive',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Total Issued',
            field: 'total_issued',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Closing Stock',
            children: [
                {
                    headerName: 'Qty',
                    field: 'qty_closing',
                    width: 150,
                    suppressSizeToFit: true,
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        }
                    },
                    cellStyle(params) {
                        var Default = {
                            textAlign: 'right'
                        };

                        return Default;
                    }
                },
                {
                    headerName: 'Temp (C)',
                    field: 'temp_closing',
                    suppressSizeToFit: true,
                    width: 150,
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        var Default = {
                            textAlign: 'right'
                        };

                        return Default;
                    }
                },
                {
                    headerName: 'Sounding (cm)',
                    field: 'sounding_closing',
                    suppressSizeToFit: true,
                    width: 150,
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        var Default = {
                            textAlign: 'right'
                        };

                        return Default;
                    }
                },
            ]
        },
        {
            headerName: 'Different',
            field: 'total_diff',
            width: 150,
            suppressSizeToFit: true,
            valueFormatter(params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 0);
                } else {
                    return '-';
                }
            },
            cellStyle(params) {
                var Default = {
                    textAlign: 'right'
                };

                return Default;
            }
        },
        {
            headerName: 'Resume',
            field: 'resume',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Remarks',
            field: 'keterangan',
            width: 150,
            suppressSizeToFit: true
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
    DataReady: boolean = false;
    LoadData(params) {

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

                    if (result) {
                        this.FormatData(result, (ResultData) => {
                            
                            this.gridApi.setRowData(ResultData);
                            this.DataReady = true;

                        });
                    }

                    this.perm = result.permissions;
                    // this.gridApi.setRowData(result.data);

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

                var FileName = get.parent.filter.company_abbr + get.parent.filter.fdari + ' - ' + get.parent.filter.fhingga + ' ' + moment(new Date()).format('DD-MM-YYYY');

                var params = {
                    columnGroups: true,
                    fileName: 'Oil Movement ' + FileName,
                    sheetName: 'Oil Movement'
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

                var FileName = get.parent.filter.company_abbr + get.parent.filter.fdari + ' - ' + get.parent.filter.fhingga + ' ' + moment(new Date()).format('DD-MM-YYYY');
    
                FileName = "Oil Movement " + FileName;

                get.parent.core.DownloadExcel(params, xlsxContent, FileName);

            }
        });

        return menu;

    }
    //=> / END : Context Menu

    FormatData(result, cb) {
        var Sounding = result.data;
        var Tank = JSON.parse(JSON.stringify(result.tank));

        for(let item of Tank) {
            var FilterTank: any = _.filter(Sounding, {
                storeloc: item.id
            });

            var TotalReceive = 0,
                TotalIssued = 0, 
                TempOpening = 0,
                SoundingOpening = 0,
                QtyOpening = 0,
                TempClosing = 0,
                SoundingClosing = 0,
                QtyClosing = 0,
                Opening = 0,
                Closing = 0,
                Diff = 0,
                DiffSuhu = 0,
                SuhuOpening = 0,
                SuhuClosing = 0;

            var Resume = "",
                Keterangan = "";

            if(FilterTank.length > 0) {

                for(let detail of FilterTank) {
                    if(detail.closing) {
                        if(detail.receive) {
                            TotalReceive += Number(detail.receive);
                        }
                        if(detail.issued) {
                            TotalIssued += Number(detail.issued);
                        }   
                    }
                }
                
                if(FilterTank[0].opening) {
                    Opening = Number(FilterTank[0].opening);
                }
                if(FilterTank[FilterTank.length - 2]) {
                    if(FilterTank[FilterTank.length - 2].closing) {
                        Closing = Number(FilterTank[FilterTank.length - 2].closing);
                    }
                }

                Diff = Opening - Closing;

                if (Diff < 0) {
                    Diff = Diff * -1;
                } 

                if(FilterTank[0].temp) {
                    TempOpening = FilterTank[0].temp;
                }
                if(FilterTank[0].tinggi) {
                    SoundingOpening = FilterTank[0].tinggi;
                }
                if(FilterTank[0].opening) {
                    QtyOpening = FilterTank[0].opening;
                }

                if(FilterTank[FilterTank.length - 1]) {
                    if(FilterTank[FilterTank.length - 1].temp) {
                        TempClosing = FilterTank[FilterTank.length - 1].temp;
                    }
                    if(FilterTank[FilterTank.length - 1].tinggi) {
                        SoundingClosing = FilterTank[FilterTank.length - 1].tinggi;
                    }
                }

                if(FilterTank[FilterTank.length - 2]) {
                    if(FilterTank[FilterTank.length - 2].closing) {
                        QtyClosing = FilterTank[FilterTank.length - 2].closing;
                    }
                }
            }

            item.total_receive = TotalReceive;
            item.total_issued = TotalIssued;
            item.detail = FilterTank;
            item.temp_opening = TempOpening;
            item.sounding_opening = SoundingOpening;
            item.qty_opening = QtyOpening;
            item.temp_closing = TempClosing;
            item.sounding_closing = SoundingClosing;
            item.qty_closing = QtyClosing;
            item.total_diff = Math.round(Diff);
        }

        cb(Tank);           
    }

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.ShowDetail(params.data);
    }
    //=> / END : Double Click
    //============================ END : GRID

    /**
     * Detail Dialog
     */
    dialogDetail: MatDialogRef<ReportOilMovementDetailDialogComponent>;
    dialogDetailConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    ShowDetail(data) {

        this.dialogDetail = this.dialog.open(
            ReportOilMovementDetailDialogComponent,
            this.dialogDetailConfig
        );

        /**
         * Injecting Data
         */
        this.dialogDetail.componentInstance.ComUrl = this.ComUrl;
        this.dialogDetail.componentInstance.Data = data;
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

}
