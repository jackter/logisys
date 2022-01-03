import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { LocalStorageService } from 'angular-2-local-storage';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { DeptDialogFormComponent } from './dialog/form';

@Component({
    selector: 'app-dept',
    templateUrl: './dept.component.html',
    styleUrls: ['./dept.component.scss'],
    animations: fuseAnimations
})
export class DeptComponent implements OnInit {

    ComUrl = 'e/master/dept/';

    form: any = {};
    filter: any = {};
    Default: any = {};
    perm: any = {};

    def_list: number;

    Busy;
    Data;
    DelayData;

    public Com: any = {
        name: 'Departement',
        title: 'Data Departement',
        icon: 'meeting_room'
    };

    constructor(
        private dialog: MatDialog,
        private LS: LocalStorageService,
        private core: Core
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
                if (result.data) {
                    this.Default.company = result.data;
                }
            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }

    // ====================== GRID DATA ======================
    limit = 100;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            width: 150,
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
        maxBlockInCache: 2

    };

    /**
     * Table Col
     */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            width: 100,
            filter: 'agSetColumnFilter',
            suppressSizeToFit: true
        },
        {
            headerName: 'Abbr',
            field: 'abbr',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Departement',
            field: 'nama',
            width: 150,
        }
    ];
    //=> END : Table Col

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }
    //=> END : Grid Ready

    /**
     * Load Data
     */
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
                                $this.perm = result.permissions;

                                setTimeout(() => {
                                    let lastRow = -1;
                                    let rowsThisPage = [];

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
    //=> END : Load Data

    /**
     * Filter Change
     */
    FilterChanged(params) {
        const ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }
    //=> END : FIlter Change

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
                action(): void {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
                ]
            });
        }

        if (get.parent.perm.hapus) {
            menu.push('separator');
            menu.push({
                name: 'Delete',
                action(): void {
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
    //=> END : Context Menu

    /**
     * List Change
     */
    ListChange(e) {
        this.def_list = e;
    }
    //=> END : List Change

    /**
     * Double CLick
     */
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    //=> END : Double Click
    // =============================== END : GRID DATA ==============================

    /**
     * Dialog Form
     */
    dialogRef: MatDialogRef<DeptDialogFormComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id) {
        this.form = {};

        if (id === 'add') {
            this.form.id = 'add';
            this.ShowFormDialog();
        } else {
            // Check if Detail
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
            DeptDialogFormComponent,
            this.dialogRefConfig
        );

        // fungsi untuk binding data parameter atau variable ke form.ts
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.form = this.form;
        this.dialogRef.componentInstance.Default = this.Default;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;

        // fungsi untuk merefresh data pada ag grid yang baru diinput
        this.dialogRef.afterClosed().subscribe(result => {
            this.dialogRef = null;

            if (result) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }
                if (result.reopen == 1) {
                    this.OpenForm(result.id);
                }
            }
        });
    }
    //=> END : Dialog Form

    /**
     * Delete
     */
    Delete(data) {
        swal({
            title: 'Apakah Anda yakin!',
            html: '<div>Menghapus data?</div><div><small><strong>' + data.nama + '</strong></small></div>',
            type: 'warning',
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
                        success => {
                            if (success.status === 1) {
                                this.gridApi.purgeServerSideCache();
                            } else {
                                var Alert = {
                                    msg: success.error_msg
                                };
                                this.core.OpenAlert(Alert);
                            }
                        },
                        error => {
                            this.core.OpenNotif(error);
                        }
                    );
                }
            }
        );
    }
    //=> END : Delete

}
