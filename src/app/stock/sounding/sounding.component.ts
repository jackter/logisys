import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as _ from 'lodash';
import { SoundingFormDialogComponent } from './dialog/form';

@Component({
    selector: 'app-sounding',
    templateUrl: './sounding.component.html',
    styleUrls: ['./sounding.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class SoundingComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/stock/sounding/';

    perm: any = {};
    filter: any = {};

    Default: any;

    Data;
    Busy;

    Unapproved: number;
    LastTanggal;

    public Com: any = {
        name: 'Sounding',
        title: 'Sounding',
        icon: 'assignment'
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
        this.LoadDefault();
    }

    /**
     * Load Default
     */
    LoadDefault() {
        this.SoundingReady = false;

        var Params = {
            NoLoader: 1
        };

        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {

                if (result) {
                    this.Default = result;

                    setTimeout(() => {
                        this.Calculate();
                    }, 100);
                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }
    // => / END : Load Default

    HasilSounding: any[] = [];
    SoundingReady : boolean = false;
    Calculate(){
        this.HasilSounding = [];

        for(let item of this.Default.storeloc){

            var FindSounding: any = _.find(this.Default.sounding, {
                storeloc: item.id
            });

            if(FindSounding){
                item.weight = FindSounding.weight;

                item.kapasitas_kg = item.kapasitas * 1000;

                item.persentase = this.core.rupiah((FindSounding.weight / item.kapasitas_kg  * 100),0); 

                item.styleHeight = "calc(15px + "+ item.persentase +"%)";
                item.styleBot = "calc("+ item.persentase +"% - 15px)";
            }

            this.HasilSounding.push(item);
            
        }

        this.SoundingReady = true;   
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
            headerName: 'Sounding Date',
            field: 'tanggal',
            suppressSizeToFit: true,
            width: 150,
            cellStyle(params) {
                if (params.data) {
                    if (params.data.is_header != 1) {

                        var get = params.context;

                        var Default: any = {
                            textAlign: 'right',
                            paddingLeft: '30px'
                        };
    
                        if (params.data.approved != 1) {
                            var Style = {};
                            Style = get.parent.RowStyle(params);
    
    
                            $.extend(Style, Default);
    
                            return Style;
                        } else {
                            return Default;
                        }
                    }
                    if (params.data.is_header == 1) {
                        return {
                            fontWeight: 'bold'
                        };
                    }
                }
            },
            valueGetter(params) {
                if (params.data) {
                    if (params.data.is_header != 1) {
                        if (params.data.tanggal) {
                            return moment(params.data.tanggal).format('DD/MM/YYYY');
                        }
                    } else {
                        return params.data.tanggal;
                    }
                }
            }
        },
        {
            headerName: 'Create Date',
            field: 'create_date',
            suppressSizeToFit: true,
            width: 150,
            cellStyle(params) {
                if (params.data) {
                    if (params.data.is_header != 1) {
                        var get = params.context;

                        var Default: any = {
                            textAlign: 'right',
                            paddingLeft: '30px'
                        };
    
                        if (params.data.approved != 1) {
                            var Style = {};
                            Style = get.parent.RowStyle(params);
    
    
                            $.extend(Style, Default);
    
                            return Style;
                        } else {
                            return Default;
                        }
                    }
                    if (params.data.is_header == 1) {
                        return {
                            fontWeight: 'bold'
                        };
                    }
                }
            },
            valueGetter(params) {
                if (params.data) {
                    if (params.data.is_header != 1) {
                        if (params.data.create_date) {
                            return moment(params.data.create_date).format('DD/MM/YYYY');
                        }
                    }
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
            headerName: 'Remarks',
            field: 'remarks',
            width: 250,
            suppressSizeToFit: false
        },
        {
            headerName: 'Status',
            field: 'status_data',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'DRAFT',
                            'APPROVED'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,
            valueGetter: function (params) {
                if (params.data) {
                    if (params.data.is_header != 1) {
                        var Return;

                        if (params.data.approved != 1) {
                            Return = 'DRAFT';
                        } else {
                            Return = 'APPROVED';
                        }

                        return Return;
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

                                    $this.Unapproved = result.unapproved;
                                    $this.LastTanggal = result.last_tanggal;

                                    setTimeout(() => {

                                        var lastRow = -1;
                                        var rowsThisPage = [];

                                        if (result.data) {

                                            $this.Data = result.data;

                                            var Tanggal;
                                            var NewData: any[] = [];
                                            for (let item of result.data) {
                                                // console.log(item);
                                                if (Tanggal != item.tanggal) {
                                                    Tanggal = item.tanggal;

                                                    NewData.push({
                                                        tanggal: moment(item.tanggal).format('D MMMM YYYY'),
                                                        is_header: 1
                                                    });
                                                    result.count = Number(result.count) + 1;

                                                }

                                                NewData.push(item);
                                            }

                                            rowsThisPage = NewData;

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

            if (params.data.approved != 1 && params.data.is_header != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (params.data.is_header == 1) {
                return {
                    fontWeight: 'bold'
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

        if (data.approved != 1) {
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
        }

        return menu;
    }
    // => / END : Context Menu

    /**
     * Double Click
     */
    onDoubleClick(params) {
        if (params.data.is_header != 1) {
            this.OpenForm('detail-' + params.data.id);
        }
    }
    // => / END : Double Click
    // ============================ END : GRID

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<SoundingFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog-full'
    };

    OpenForm(id) {
        this.form = {};

        if (id === 'add') {   // ADD

            /**
             * Check Unapproved
             */
            if (this.Unapproved > 0) {

                this.core.OpenAlert({
                    title: 'Action Rejected!',
                    msg: `
                        <div>
                            Please Finish all outstanding Sounding Data before create a new one.
                        </div>
                        <br>
                        <div>
                            Check unapproved sounding on the list.
                        </div>
                    `,
                    width: 400
                });

                return false;

            }
            // => / END : Check Unapproved

            this.form.last_tanggal = moment(this.LastTanggal, 'YYYY-MM-DD');
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
        this.dialogRef = this.dialog.open(
            SoundingFormDialogComponent,
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
                    this.LoadDefault();
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
