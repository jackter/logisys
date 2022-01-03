import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { WorkOrderFormDialogComponent } from './dialog/form';
import { param } from 'jquery';
import { WOProcessFormDialogComponent } from '../wo-process/dialog/form';

@Component({
    selector: 'app-work-order',
    templateUrl: './work-order.component.html',
    styleUrls: ['./work-order.component.scss'],
    animations: fuseAnimations
})
export class WorkOrderComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/operation/work-order/';

    perm: any = {};
    filter: any = {};

    Default: any;

    Data;
    Busy;

    Activity: any;
    Material: any;
    Mechanic: any;

    public Com: any = {
        name: 'Work Order',
        title: 'List Work Order',
        icon: 'local_shipping'
    };

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.LoadDefault();
    }

    Reload() {
        this.LoadData(this.gridParams);
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
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Load Default

    // ============================ GRID
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
                newRowsAction: 'keep'
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
            headerName: 'Order Date',
            field: 'order_date',
            suppressSizeToFit: true,
            width: 100,
            valueFormatter(params) {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'Company',
            field: 'company_abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Dept',
            field: 'dept_abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'WO No',
            field: 'kode',
            suppressSizeToFit: true,
            width: 250
        },
        {
            headerName: 'Section',
            field: 'section',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Maintenance Type',
            field: 'maintenance_type',
            suppressSizeToFit: true,
            width: 150,
            valueFormatter(params) {
                if (params.value) {
                    if (params.value == 1) {
                        return 'Corrective Maintenance';
                    } else if (params.value == 2) {
                        return 'Preventive Maintenance';
                    } else if (params.value == 3) {
                        return 'Predictive Maintenance';
                    } else if (params.value == 4) {
                        return 'Improvement Maintenance';
                    } else if (params.value == 5) {
                        return 'Fabrication';
                    } else if (params.value == 6) {
                        return 'Project';
                    } else if (params.value == 7) {
                        return 'Breakdown';
                    } else if (params.value == 8){
                        return 'Others';
                    }
                }
            }
        },
        {
            headerName: 'Equipment',
            field: 'equipment_kode',
            suppressSizeToFit: true,
            width: 150,
        },
        // {
        //     headerName: 'Act. Hours',
        //     field: 'actual_hours',
        //     suppressSizeToFit: true,
        //     width: 100,
        //     valueFormatter: function (params) {
        //         var get = params.context;
        //         if (params.value > 0) {
        //             return get.parent.core.rupiah(params.value, 2, true);
        //         } else {
        //             return "-";
        //         }
        //     },
        //     cellStyle(params) {

        //         if (params.data) {

        //             var get = params.context;

        //             var Default: any = {
        //                 textAlign: 'right'
        //             };

        //             if (params.data.verified != 1 || params.data.approved != 1) {
        //                 var Style = {};
        //                 Style = get.parent.RowStyle(params);


        //                 $.extend(Style, Default);

        //                 return Style;
        //             }
        //         }
        //     }
        // },
        {
            headerName: 'Status',
            field: 'status_data',
            suppressSizeToFit: false,
            width: 250,
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'VERIFIED',
                            'DRAFT',
                            'COMPLETE'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            valueGetter(params) {
                if (params.data) {

                    if (params.data.verified != 1 && params.data.gm_approve != 1) {
                        return 'UNVERIFIED';
                    } 
                    if (params.data.gm_approve == 1 && params.data.gm_approved != 1 && params.data.verified != 1) {
                        return 'WAITING APPROVED GM';
                    }
                        if (params.data.verified == 1 && params.data.processed != 1) {
                            return 'VERIFIED, WAITING PROCESSED'; 
                    }
                        if(params.data.gm_approve == 1 && params.data.gm_approved == 1){

                            if (params.data.processed == 1 && params.data.completed != 1 && params.data.verified == 1) {
                                return 'PROCESSED, WAITING COMPLETED';
                            } else {
                                return 'UNVERIFIED';
                            }
                    }
                        if (params.data.processed == 1 && params.data.completed != 1) {
                            return 'PROCESSED, WAITING COMPLETED';
                    }
                        if (params.data.processed == 1 && params.data.completed == 1 && params.data.approved2 != 1) {
                            return 'COMPLETED, WAITING APPROVED';
                    } 
                        if (params.data.processed == 1 && params.data.completed == 1 && params.data.approved2 == 1 && params.data.accepted != 1) {
                            return 'APPROVED, WAITING ACCEPTED';
                    } 
                        if (params.data.accepted == 1) {
                            return 'ACCEPTED';
                    }
                }
            }
        }
    ];
    // => / END : TableCol

    /**
     * Load Data
     */
    DelayData;
    LoadData(params) {

        var $this = this;

        var dataSource = {
            getRows: function (params) {

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

                                if (result) {

                                    // $this.count = result.count;
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

                                }

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
     * RowStyle
     */
    RowStyle(params) {

        if (params.data) {

            //UNVERIFIED
            if (params.data.verified != 1 && params.data.gm_approve != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            //VERIFIED, WAITING PROCESSED
            if (params.data.verified == 1 && params.data.processed != 1) {
                return {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }

            if(params.data.gm_approve == 1 && params.data.gm_approved == 1){
            
                //PROCESSED, WAITING COMPLETED
                if (params.data.processed == 1 && params.data.completed != 1 && params.data.verified) {
                    return {
                        color: 'blue',
                        fontStyle: 'italic'
                    };
                }else{
                    //UNVERIFIED
                    return {
                        color: 'rgba(0, 0, 0, 0.87)',
                        backgroundColor: '#e8f756',
                        fontStyle: 'italic'
                    };
                }
            }

            //PROCESSED, WAITING COMPLETED
            if (params.data.processed == 1 && params.data.completed != 1) {
                return {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            //COMPLETED, WAITING APPROVED
            if (params.data.processed == 1 && params.data.completed == 1 && params.data.approved2 != 1) {
                return {
                    fontWeight: 'bold'
                };
            }

            //APPROVED, WAITING ACCEPTED
            if (params.data.processed == 1 && params.data.completed == 1 && params.data.approved2 == 1 && params.data.accepted != 1) {
                return {
                    color: 'green'
                };
            }

            //ACCEPTED
            if (params.data.accepted == 1) {
                return {
                    color: 'black'
                };
            }

        }

    }
    // => / END : RowStyle

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        if (data.verified != 1 && data.gm_approve != 1 && data.gm_approved != 1) {

            if (get.parent.perm.edit) {
                menu.push({
                    name: 'Edit',
                    action: function () {
                        get.parent.OpenForm(data.id);
                    },
                    icon: '<i class="fa fa-edit primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'primary-fg'
                    ]
                });
            }

        }

        if (data.verified == 1 && data.completed != 1) {
            if (get.parent.perm.edit) {
                menu.push({
                    name: 'Process Daily',
                    action: function () {
                        get.parent.OpenProcess(data);
                    },
                    icon: '<i class="fa fa-check-square primary-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                    cssClasses: [
                        'primary-fg'
                    ]
                });
            }
        }

        return menu;
    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click
    // ============================ END : GRID

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<WorkOrderFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {

        this.form = {};

        if (id == 'add') {   // ADD

            this.form.id = 'add';

            this.ShowFormDialog();
        } else {  // EDIT

            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id,
                is_detail: isDetail
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
            WorkOrderFormDialogComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = this.Default;
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = this.form;
        // => / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogRef.afterClosed().subscribe(result => {

            this.dialogRef = null;

            this.Mechanic = [];

            if (result) {

                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }

            }

        });
        // => / END : After Dialog Close

    }
    // => / END : Form Dialog

    /**
     * Open Dialog Process
     */
    public ComProcess: any = {
        name: 'Work Order Process',
        title: 'List Work Order Process',
        icon: 'local_shipping'
    };

    ComUrlProcess = 'e/operation/wo-process/';

    ProcessdialogRef: MatDialogRef<WOProcessFormDialogComponent>;
    ProcessdialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    OpenProcess(data) {
        // this.form = {};

        data.id = 'add';

        this.ProcessdialogRef = this.dialog.open(
            WOProcessFormDialogComponent,
            this.ProcessdialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.ProcessdialogRef.componentInstance.ComUrl = this.ComUrlProcess;
        this.ProcessdialogRef.componentInstance.Com = this.ComProcess;
        this.ProcessdialogRef.componentInstance.form = data;
        // => / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.ProcessdialogRef.afterClosed().subscribe(result => {

            this.ProcessdialogRef = null;
            data.id = data.wo;

            if (result) {


                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }

            }

        });
        // => / END : After Dialog Close

    }
    //=>END: Open Dialog Process

}
