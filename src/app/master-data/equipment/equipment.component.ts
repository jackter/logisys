import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import swal from 'sweetalert2';
import { Core } from 'providers/core';
import { EquipmentFormDialogComponent } from './dialog/form';

@Component({
    selector: 'app-equipment',
    templateUrl: './equipment.component.html',
    styleUrls: ['./equipment.component.scss'],
    animations: fuseAnimations
})
export class EquipmentComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/master/equipment/';
    public Com: any = {
        name: 'Equipment',
        title: 'List Equipment',
        icon: 'build',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data;
    def_list: number;

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

     // Load Company
     LoadDefault() {
        var Params = {
            NoLoader: 1
        };
        this.core.Do(this.ComUrl + 'default', {}).subscribe(
            result => {
                if (result) {
                    this.Default = result;
                    this.perm = this.Default.permissions;
                    this.Default.company = this.Default.company;

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
            width: 100,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep'
            },
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
            headerName: 'Location',
            field: 'wo_location_nama',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'Nama',
            field: 'nama',
            width: 400,
            suppressSizeToFit: false
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
        this.OpenForm('detail-' + params.data.id);
    }
    // => / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {
        // if (params.data && params.data.approved != 1) {
        //     return {
        //         color: 'red',
        //         backgroundColor: '#fff799',
        //         fontStyle: 'italic'
        //     };
        // }
    }
    // => / END : Grid Style
    // ============================ END : GRID

        /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<EquipmentFormDialogComponent>;
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
                id: id
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

        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            EquipmentFormDialogComponent,
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
