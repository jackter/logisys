import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as moment from 'moment';

import { VehicleActivityDetailFormDialogComponent } from './dialog/form';

@Component({
    selector: 'app-vehicle-activity-detail',
    templateUrl: './detail.html',
    styleUrls: ['../vehicle-activity.component.scss'],
    animations: fuseAnimations
})
export class VehicleActivityDetailComponent implements OnInit {

    DetailID;

    ComUrl = "e/operation/vehicle_activity/";

    public Com: any = {
        name: 'Vehicle Activity',
        title: 'Vehicle Activity Detail',
        icon: 'local_shipping',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    Ready;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router

    ) {
        activatedRoute.params.subscribe(params => {
            if (params.id) {
                this.DetailID = params.id;
            }
        });
    }

    ngOnInit() {

        this.LoadDefault();
        this.GetPeriode();
    }

    Bulan: any = [];
    Tahun: any = [];
    GetPeriode() {
        for(let i = 1; i <= 12; i++) {

            this.Bulan.push({
                id: i,
                bulan: moment(i, 'MM').locale('id').format('MMMM')
            });
        } 

        var START = Number(moment(new Date).subtract(3, 'years').format('YYYY'));
        var END = Number(moment(new Date).add(3, 'years').format('YYYY'));

        for(let i = START; i <= END; i++) {
            
            this.Tahun.push({
                tahun: i
            });
        }
        
    }

    Back() {
        this.router.navigate(['/operation/vehicle_activity']);
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
            id: this.DetailID
        };

        this.core.Do(this.ComUrl + 'get.detail', Params).subscribe(
            result => {

                if (result) {

                    this.Default = result;

                }
            },
            error => {
                console.log('GetForm', error);
                this.core.OpenAlert(error);
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
            minWidth: 100,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: "keep"
            },
            cellStyle: this.RowStyle,
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
        maxBlocksInCache: 2
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

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Tanggal',
            field: 'tanggal',
            pinned: 'left',
            width: 150,
            valueFormatter: function (params) {
                if (params.value) {

                    return moment(params.value).format('DD/MM/YYYY');

                }
            }
        },
        {
            headerName: 'Waktu (Jam)',
            pinned: 'left',
            children: [
                {
                    headerName: 'Dari',
                    field: 'waktu_start',
                    width: 100,
                    pinned: 'left'
                },
                {
                    headerName: 'Sampai',
                    field: 'waktu_end',
                    pinned: 'left',
                    width: 100
                },
                {
                    headerName: 'Total',
                    field: 'total_waktu',
                    pinned: 'left',
                    width: 100,
                    filter: 'agTextColumnFilter',
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        if(params.data){
                            var get = params.context;

                            var Default = {
                                textAlign: 'right'
                            };
    
                            if(params.data.approved != 1) {
                                var Style = get.parent.RowStyle(params);
    
                                $.extend(Style, Default);
    
                                return Style;
                            } else {
                                return Default;
                            }
                        }

                    }
                }
            ]
        },
        {
            headerName: 'Jarak Tempuh (km)',
            children: [
                {
                    headerName: 'Dari',
                    field: 'jarak_start',
                    width: 150,
                    filter: 'agTextColumnFilter',
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        if(params.data){
                            var get = params.context;
                        
                            var Default = {
                                textAlign: 'right'
                            };
                            
                            if(params.data.approved != 1) {
                                var Style = get.parent.RowStyle(params);
    
                                $.extend(Style, Default);
    
                                return Style;
                            } else {
                                return Default;
                            }
                        }
                    }
                },
                {
                    headerName: 'Sampai',
                    field: 'jarak_end',
                    width: 150,
                    filter: 'agTextColumnFilter',
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        if(params.data){
                            var get = params.context;
                            var Default = {
                                textAlign: 'right'
                            };
    
                            if(params.data.approved != 1) {
                                var Style = get.parent.RowStyle(params);
    
                                $.extend(Style, Default);
    
                                return Style;
                            } else {
                                return Default;
                            }
                        }
                    }
                },
                {
                    headerName: 'Total',
                    field: 'total_jarak',
                    width: 150,
                    filter: 'agTextColumnFilter',
                    valueFormatter(params) {
                        var get = params.context;
                        if (params.value > 0) {
                            return get.parent.core.rupiah(params.value, 2, true);
                        } else {
                            return '-';
                        }
                    },
                    cellStyle(params) {
                        if(params.data){
                            var get = params.context;
                            var Default = {
                                textAlign: 'right'
                            };
    
                            if(params.data.approved != 1) {
                                var Style = get.parent.RowStyle(params);
    
                                $.extend(Style, Default);
    
                                return Style;
                            } else {
                                return Default;
                            }
                        }
                    }
                }
            ]
        },
        {
            headerName: 'Akun',
            children: [
                {
                    headerName: 'Kode',
                    field: 'coa_kode',
                    width: 100,
                    filter: 'agTextColumnFilter'
                },
                {
                    headerName: 'Deskripsi',
                    field: 'coa_nama',
                    width: 150
                }
            ]
        },
        {
            headerName: 'Muatan',
            children: [
                {
                    headerName: 'Kode',
                    field: 'muatan_abbr',
                    width: 100
                },
                {
                    headerName: 'Deskripsi',
                    field: 'muatan_nama',
                    width: 150
                }
            ]
        },
        {
            headerName: 'QTY',
            field: 'qty',
            width: 100,
            valueFormatter(params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else {
                    return '-';
                }
            },
            cellStyle(params) {
                if(params.data){
                    var get = params.context;
                    var Default = {
                        textAlign: 'right'
                    };
    
                    if(params.data.approved != 1) {
                        var Style = get.parent.RowStyle(params);
    
                        $.extend(Style, Default);
    
                        return Style;
                    } else {
                        return Default;
                    }
                }                
            }
        },
        {
            headerName: 'UOM',
            field: 'uom',
            width: 100
        },
        {
            headerName: 'Keterangan',
            field: 'keterangan',
            width: 300,
        },
        {
            headerName: 'Status',
            field: 'approved',
            width: 200,
            valueGetter(params) {

                if (params.data) {

                    if (params.data.approved != 1) {

                        return 'DRAFT';

                    } else {

                        return 'APPROVED';

                    }
                }
            }
        }
    ];
    //=> / END : TableCol

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        if (
            this.filter.bulan &&
            this.filter.tahun
        ) {

            var $this = this;

            var dataSource = {
                getRows: function (params) {
    
                    clearTimeout($this.DelayData);
                    $this.DelayData = setTimeout(() => {
    
                        if (!$this.Busy) {
    
                            $this.Busy = true;
    
                            var startRow = params.request.startRow;
                            var endRow = params.request.endRow;
    
                            var Bulan = $this.filter.bulan;
                            var Tahun = $this.filter.tahun;
    
                            var START = Tahun + '-' + Bulan + '-' + moment(Bulan, 'MM').startOf('month').format('DD');
                            var END = Tahun + '-' + Bulan + '-' + moment(Bulan, 'MM').endOf('month').format('DD');            
    
                            var Params = {
                                offset: startRow,
                                limit: $this.limit,
                                NoLoader: 1,
                                vehicle: $this.DetailID,
                                fdari: moment(START).format('YYYY-MM-DD'),
                                fhingga: moment(END).format('YYYY-MM-DD')
                            };

                            if ($this.filter) {
                                $.extend(Params, $this.filter);
                            }
    
                            $this.core.Do($this.ComUrl + 'data.detail', Params).subscribe(
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

        if (get.parent.perm.edit && data.approved != 1) {
            menu.push({
                name: 'Edit',
                action: function () {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
                ]
            });
        }

        if (get.parent.perm.hapus && data.approved != 1) {
            menu.push('separator');
            menu.push({
                name: 'Delete',
                action: function () {
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
    //=> / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    //=> / END : Double Click

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
    //=> / END : Grid Style
    //============================ END : GRID


    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<VehicleActivityDetailFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    OpenForm(id) {

        this.form = {};

        if (id === 'add') {   // ADD

            this.form.id = 'add';

            this.ShowFormDialog();

        } else {  // EDIT

            //=> Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == "detail") {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id,
                is_detail: isDetail,
                company: this.Default.company
            };

            this.core.Do(this.ComUrl + 'get', Params).subscribe(
                result => {

                    if (result) {
                        this.form = result.data;
                        if (isDetail) {
                            this.form.is_detail = isDetail;
                        }

                        this.ShowFormDialog();
                    }

                },
                error => {
                    console.error('GetForm', error);
                    this.core.OpenNotif(error);
                }
            );

        }

    }
    ShowFormDialog() {

        this.dialogRef = this.dialog.open(
            VehicleActivityDetailFormDialogComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        if(this.Data) {
            var i = this.Data.length;
            this.dialogRef.componentInstance.Data = this.Data[i-1];
        }
        
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = this.Default;
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = this.form;
        //=> / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogRef.afterClosed().subscribe(result => {

            this.dialogRef = null;

            if (result) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {

                    this.gridApi.purgeServerSideCache();
                }
            }
        });
        //=> / END : After Dialog Close

    }

    /**
    * Delete
    */
    Delete(data) {

        swal({
            title: 'Delete this Data?',
            html: '<div>Are you sure to continue?</div>',
            type: 'error',
            reverseButtons: true,
            focusCancel: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then(
            result => {

                if (result.value) {

                    var Params = {
                        id: data.id
                    };
                    this.core.Do(this.ComUrl + 'delete', Params).subscribe(
                        result => {

                            if (result.status == 1) {
                                this.gridApi.purgeServerSideCache();
                            } else {
                                var Alert = {
                                    msg: result.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }

                        },
                        error => {

                            console.error('Delete', error);
                            this.core.OpenNotif(error);

                        }
                    );

                }

            }
        );

    }
    //=> / END : Delete

}