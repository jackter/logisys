import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';

import swal from 'sweetalert2';
import { Core } from 'providers/core';

import { CompanyDialogFormComponent } from './dialog/form';

@Component({
    selector: 'app-company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss'],
    animations: fuseAnimations
})
export class CompanyComponent implements OnInit {

    form: any = {};
    ComUrl = 'e/master/company/';

    filter: any = {};
    perm: any = {};
    Busy;

    Data;
    DelayData;

    public Com: any = {
        name: 'Company',
        title: 'Data Company',
        icon: 'domain'
    };

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit() {

    }

    Reload() {
        this.LoadData(this.gridParams);
    }

    /*GRID*/
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

    /*TableCol*/
    TableCol = [
        {
            headerName: 'Abbr',
            field: 'abbr',
            suppressSizeToFit: true,
            width: 100
        },
        {
            headerName: 'Company',
            field: 'nama',
            width: 150
        }
    ];
    // => END : TableCol

    /*Grid Ready*/
    onGridReady(params): void {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }
    // => END : Grid Ready

    /*Load Data*/
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
    // => END : Load Data

    /*Filter Change*/
    FilterChanged(params) {
        var ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }
    // => END : FIlter Change

    /*Context Menu*/
    getContextMenuItems(params): any {
        var menu = [];
        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit) {
            menu.push({
                name: 'Edit',
                action(): void {
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
    // => END : Context Menu

    /*Double CLick*/
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }
    // => END : Double CLick

    /*Dialog Form*/
    dialogRef: MatDialogRef<CompanyDialogFormComponent>;
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

            /*Check if Detail*/
            var IDSplit = id.toString().split('-');
            let isDetail = false;

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
            CompanyDialogFormComponent,
            this.dialogRefConfig
        );

        /*Inject Data to Dialog*/
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Com = this.Com;
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = this.form;

        /*After Dialog Close*/
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
    }
    // => END : Dialog Form

    /*Delete*/
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
                    const Params = {
                        id: data.id
                    };

                    this.core.Do(this.ComUrl + 'delete', Params).subscribe(
                        result => {
                            if (result.status == 1) {
                                this.gridApi.purgeServerSideCache();
                            } else {
                                const Alert = {
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
    // => END : Dialog Form

}
