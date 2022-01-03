import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-vehicle-activity',
    templateUrl: './vehicle-activity.component.html',
    styleUrls: ['./vehicle-activity.component.scss'],
    animations: fuseAnimations
})
export class VehicleActivityComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/operation/vehicle_activity/';

    public Com: any = {
        name: 'Vehicle Activity',
        title: 'List Vehicle Activity',
        icon: 'local_shipping',
    };

    Default: any ={};
    filter: any = {};
    perm: any = {};
    Busy;

    Data;

    constructor(
        private core: Core,
        private router: Router,
        public dialog: MatDialog
    ) { }

    ngOnInit() {

        this.LoadDefault();

    }

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

        var val = this.filter.company_nama;

        if (val != this.CompanyLast) {
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

    }

    CompanySelect(e, item) {
        if (e.isUserInput) {
            this.filter.company = item.id;
            this.filter.company_nama = item.nama;
            this.filter.company_abbr = item.abbr;

            this.CompanyLast = item.nama;

        }
    }

    CompanyRemove() {
        this.filter.company = null;
        this.filter.company_nama = null;
        this.filter.company_abbr = null;

        this.CompanyFilter();
    }
    //=> END : AC Company

    // ============================ GRID
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
            // cellStyle: this.RowStyle,
            tooltipField: 'history',
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

        rowModelType: 'serverSide',
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
    // => / END : Grid Options

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;

        params.api.sizeColumnsToFit();

        this.LoadData(params);

    }
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Nopol',
            field: 'nopol',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Type Vehicle',
            field: 'vgrup_nama',
            suppressSizeToFit: true,
            width: 175
        },
        {
            headerName: 'Description',
            field: 'keterangan',
            suppressSizeToFit: false,
            width: 175
        }
    ];
    // => / END : TableCol

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        if(
            this.filter.company
        ) {

            var $this = this;

            var dataSource = {
                getRows(params) {
    
                    clearTimeout($this.DelayData);
                    $this.DelayData = setTimeout(() => {
    
                        if (!$this.Busy) {
    
                            $this.Busy = true;
    
                            var startRow = params.request.startRow;
                            var endRow = params.request.endRow;

                            var Params = {
                                offset: startRow,
                                limit: $this.limit,
                                NoLoader: 1
                            };
    
                            if ($this.filter) {
                                $.extend(Params, $this.filter);
                            }
                        
                            $this.core.Do($this.ComUrl + 'data', Params).subscribe(
                                result => {
    
                                    $this.perm = result.permissions;
    
                                    setTimeout(() => {
    
                                        var lastRow = -1;
                                        var rowsThisPage = [];
    
                                        if (result.data) {
    
                                            $this.Data = result.data;
    
                                            rowsThisPage = result.data;
    
                                            if (result.count <= endRow) {
                                                lastRow = result.count;
                                            }
    
                                        } else {
                                            lastRow = result.count;
                                        }
    
                                        params.successCallback(rowsThisPage, lastRow);
    
                                        $this.Busy = false;
    
                                    }, 100);
    
                                },
                                error => {
                                    console.error(error);
                                    $this.core.OpenNotif(error);
                                    $this.Busy = false;
                                }
                            );
    
                        }
    
                    }, 100);
    
                }
            };
            params.api.setServerSideDatasource(dataSource);
        }

    }
    // => / END : Load Data

    /**
     * Filter Changed
     */
    FilterChanged(params) {

        var ParamsFilter = this.gridApi.getFilterModel();

        this.filter.ftable = JSON.stringify(ParamsFilter);

    }
    // => / END : Filter Changed

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit) {
            menu.push({
                name: 'Edit',
                action() {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'primary-fg'
                ]
            });
        }

        if (get.parent.perm.hapus) {
            menu.push('separator');
            menu.push({
                name: 'Delete',
                action() {
                    get.parent.Delete(data);
                },
                icon: '<i class="fa fa-trash red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'red-fg'
                ]
            });
        }

        return menu;

    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        // this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click

    /**
     * Click
     */
    onClick(params) {
        
        this.router.navigate(['/operation/vehicle_activity/detail/' + params.data.id]);
    }
    // => / END : Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            if (params.data.approved != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }
            
        }

    }
    // => / END : Grid Style
    // ============================ END : GRID

}
