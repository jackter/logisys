import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';

import swal from 'sweetalert2';
import { Core } from 'providers/core';

import { TaxDialogFormComponent } from './dialog/form';

@Component({
    selector: 'app-tax',
    templateUrl: './tax.component.html',
    styleUrls: ['./tax.component.scss'],
    animations: fuseAnimations
})
export class TaxComponent implements OnInit {

    ComUrl = 'e/master/tax/';
    
    form: any = {};
    Default: any = {};
    filter: any = {};
    perm: any = {};
    Busy;

    Data;
    DelayData;

    public Com: any = {
        name: 'Tax',
        title: 'Tax',
        icon: 'monetization_on',
    };

    /* GRID */
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
    /* End Grid */

    /* TableCol */
    TableCol = [
        {
            headerName: 'Company',
            field: 'company_abbr',
            width: 80
        },
        {
            headerName: 'Code',
            field: 'code',
            width: 125
        },
        {
            headerName: 'Description',
            field: 'description',
            width: 150
        },
        {
            headerName: 'Rate',
            field: 'rate',
            width: 100
        },
        {
            headerName: 'Tipe',
            field: 'tipe',
            filter: 'agSetColumnFilter',
            filterParams: {
                values(params): void {
                    setTimeout(() => {
                        params.success([
                            'PPh', 'Pajak Pengeluaran', 'Pajak Pemasukkan'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            valueGetter(params): any {
                if (params.data) {
                    if (params.data.tipe == 1) {
                        return 'PPh';
                    }
                    if (params.data.tipe == 2) {
                        return 'Pajak Pengeluaran';
                    } else {
                        return 'Pajak Pemasukkan';
                    }
                }
            }
        },
        {
            headerName: 'Pembukuan',
            field: 'pembukuan',
            filterParams: {
                values(params): void {
                    setTimeout(() => {
                        params.succes([
                            'Credit', 'Debit'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            valueGetter(params): any {
                if (params.data) {
                    if (params.data) {
                        if (params.data.pembukuan == 'credit') {
                            return 'Credit';
                        } else {
                            return 'Debit';
                        }
                    }
                }
            }
        },
        {
            headerName: 'COA Code',
            field: 'coa_kode',
            width: 150
        },
        {
            headerName: 'COA Name',
            field: 'coa_nama',
            width: 150
        }
    ];

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.LoadDefault();
    }

    Reload() {
        this.LoadData(this.gridParams);
    }

    /*Load Default*/
    LoadDefault(): void {
        const Params = {
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

    /* Grid Ready */
    onGridReady(params): void {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }

    /* Load Data */
    LoadData(params): void {

        const $this = this;

        const dataSource = {
            getRows(params): void {
                clearTimeout($this.DelayData);
                $this.DelayData = setTimeout(() => {
                    if (!$this.Busy) {
                        $this.Busy = true;

                        const startRow = params.request.startRow;
                        const endRow = params.request.endRow;

                        const Params = {
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

    /* Filter Changed */
    FilterChanged(params): void {
        const ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }

    /* Context Menu */
    getContextMenuItems(params): any {
        const menu = [];

        const data = params.node.data;
        const get = params.context;

        if (get.parent) {
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
        if (get.parent) {
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

    /* Double Click */
    onDoubleClick(params): void {
        this.OpenForm('detail-' + params.data.id);
    }

    /* Form Dialog */
    dialogRef: MatDialogRef<TaxDialogFormComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };

    OpenForm(id): void {

        this.form = {};

        if (id == 'add') {

            this.form.id = 'add';

            this.ShowFormDialog();
        } else {

            /*Check if Detail*/
            const IDSplit = id.toString().split('-');

            let isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }
            const Params = {
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

    ShowFormDialog(): void {
        this.dialogRef = this.dialog.open(
            TaxDialogFormComponent,
            this.dialogRefConfig
        );

        /*Inject Data to Dialog*/
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = this.Default;
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

    /* Delete */
    Delete(data): void {

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

}
