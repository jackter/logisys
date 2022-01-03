import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import { WOProcessFormDialogComponent } from './dialog/form';
import swal from 'sweetalert2';

@Component({
    selector: 'app-wo-process',
    templateUrl: './wo-process.component.html',
    styleUrls: ['./wo-process.component.scss'],
    animations:fuseAnimations
})
export class WoProcessComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/operation/wo-process/';

    perm: any = {};
    filter: any = {};

    Default: any;

    Data;
    Busy;

    Activity: any;
    Material: any;
    Mechanic: any;

    public Com: any = {
        name: 'Work Order Process',
        title: 'List Work Order Process',
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
        this.Data = [];
        this.Space = 0;
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

                    this.perm = this.Default.permissions;
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }

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
            headerName: 'Date',
            field: 'tanggal',
            suppressSizeToFit: true,
            width: 100,
            valueFormatter(params) {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'WO No',
            field: 'wo_kode',
            suppressSizeToFit: true,
            width: 250
        },
        
        {
            headerName: 'Area',
            field: 'dept_section_nama',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'Equipment No',
            field: 'equipment_kode',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'Running Hours',
            field: 'running_hours',
            suppressSizeToFit: true,
            width: 150,
            valueFormatter: function (params) {
                var get = params.context;
                if (params.value > 0) {
                    return get.parent.core.rupiah(params.value, 2, true);
                } else 
                if (params.data){

                    if(params.data.is_header == 1){
                        return "-";

                    }
                    
                }
            }
        },
        {
            headerName: 'Job Explain',
            field: 'job_explain',
            // suppressSizeToFit: true,
            width: 250
        }
        // {
        //     headerName: 'Status',
        //     field: 'status_data',
        //     suppressSizeToFit: false,
        //     width: 250,
        //     filter: 'agSetColumnFilter',
        //     filterParams: {
        //         values: function (params) {
        //             setTimeout(() => {
        //                 params.success([
        //                     'VERIFIED',
        //                     'DRAFT',
        //                     'COMPLETE'
        //                 ]);
        //             }, 250);
        //         },
        //         newRowsAction: 'keep'
        //     },
        //     valueGetter(params) {
        //         if (params.data) {

                    
        //         }
        //     }
        // }
    ];
    // => / END : TableCol

    /**
     * Load Data
     */
    DelayData;
    Space: number = 0;
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
                                    // $this.perm = result.permissions;

                                    setTimeout(() => {

                                        var lastRow = -1;
                                        var rowsThisPage = [];

                                        if (result.data) {

                                            // $this.Data = result.data;

                                            var NewData: any[] = [];
                                            var JobExplan = [];
                                            for(let item of result.data){

                                                NewData.push({
                                                    is_header : 1,
                                                    id: item.id,
                                                    completed: item.completed,
                                                    tanggal: item.tanggal,
                                                    wo_kode: item.wo_kode,
                                                    running_hours: item.running_hours,
                                                    dept_section_nama: item.dept_section_nama,
                                                    equipment_kode: item.equipment_kode,
                                                });

                                                JobExplan = JSON.parse(item.job_explain);

                                                for(let job of JobExplan){

                                                    NewData.push({
                                                        id: item.id,
                                                        completed: item.completed,
                                                        job_explain: job.job_explan
                                                    });

                                                    $this.Space += 1;
                                                }

                                            }

                                            // console.log(NewData);
                                            
                                            result.count += $this.Space;

                                            $this.Data = NewData;
                                            rowsThisPage = NewData;
                                            

                                            // rowsThisPage = result.data;

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

        if (data.completed != 1) {

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

        if (data.completed != 1) {
            if (get.parent.perm.hapus) {
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
    dialogRef: MatDialogRef<WOProcessFormDialogComponent>;
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
            WOProcessFormDialogComponent,
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

            if (result) {

                if (!this.Data) {
                    
                    this.LoadData(this.gridParams);
                } else {

                    this.Data = [];
                    this.Space = 0;
                    this.gridApi.purgeServerSideCache();
                }

            }

        });
        // => / END : After Dialog Close

    }
    // => / END : Form Dialog

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
                                this.Data = [];
                                this.Space = 0;

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
    // => / END : Delete
}
