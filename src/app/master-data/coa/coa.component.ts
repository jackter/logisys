import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { COAFormDialogComponent } from './dialog/form';
import { fuseAnimations } from 'fuse/animations';
import swal from 'sweetalert2';

@Component({
    selector: 'app-coa',
    templateUrl: './coa.component.html',
    styleUrls: ['./coa.component.scss'],
    animations: fuseAnimations
})
export class CoaComponent implements OnInit {

    ComUrl = "e/master/coa/";
    form: any = {};

    public Com: any = {
        name: 'COA Data',
        title: 'Chart of Account',
        icon: 'list_alt',
    };

    Default: any = {};
    filter: any = {};
    perm: any = {};
    Busy;

    Data;
    def_list: number;

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) {

    }

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

                    if (result.company) {
                        this.Default.company = result.company;
                    }
                    if (result.params.account_type) {
                        this.Default.account_type = JSON.parse(JSON.stringify(result.params.account_type.value));
                    }
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
    limit = 1500;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            width: 100,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep'
            },
            // cellStyle: this.RowStyle
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
            headerName: 'Account Header',
            field: 'is_h',
            suppressSizeToFit: true,
            width: 150
        },
        {
            headerName: 'Code',
            field: 'kode',
            suppressSizeToFit: true,
            width: 200,
            cellStyle: function (params) {
                var Style: any = {};

                if (params.data) {
                    Style.paddingLeft = (params.data.padding * 15) + 'px';
                }

                return Style;

            }
        },
        {
            headerName: 'Name',
            field: 'nama',
            width: 400,
            cellStyle: function (params) {
                var Style: any = {};

                if (params.data) {
                    Style.paddingLeft = (params.data.padding * 15) + 'px';
                }

                return Style;

            }
        },
        {
            headerName: 'Type',
            field: 'type',
            width: 200
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

                                if(result){

                                    // $this.count = result.count;
                                    $this.perm = result.permissions;
    
                                    setTimeout(() => {
    
                                        var lastRow = -1;
                                        var rowsThisPage = [];
    
                                        if (result.data) {
    
                                            for (let item of result.data) {
                                                for (let lv = 2; lv <= 6; lv++) {
                                                    if (
                                                        item['lv' + (lv)] &&
                                                        item['lv' + (lv)] > 0
                                                    ) {
                                                        // Indentation Nama
                                                        item.padding = lv;
                                                    }
                                                }

                                                if(item.is_h == 0){
                                                    item.padding = 7;
                                                }                                                

                                            }
    
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
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

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
                action: function () {
                    get.parent.Delete(data);
                },
                icon: '<i class="fa fa-trash red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'red-fg'
                ]
            });
        }

        if (get.parent.perm.export_xls) {
            menu.push('separator');
            menu.push({
                name: 'Export to Excel',
                action() {
                    var D = new Date();

                    var params = {
                        columnGroups: true,
                        fileName: 'COA_Master_' + D.getTime(),
                        sheetName: 'COA Master'
                    };

                    get.parent.gridApi.exportDataAsExcel(params);
                }
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

        if (params.data && params.data.approved != 1) {
            return {
                color: 'red',
                backgroundColor: '#fff799',
                fontStyle: 'italic'
            };
        }

    }
    // => / END : Grid Style
    // ============================ END : GRID

    /**
* Form Dialog
*/
    dialogRef: MatDialogRef<COAFormDialogComponent>;
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

            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == "detail") {
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
            COAFormDialogComponent,
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

            var Reload = 0;

            this.core.GetSharing('reload').subscribe(
                result => {
                    if (result) {
                        Reload = 1;
                    }
                }
            );

            if (result || Reload == 1) {
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
