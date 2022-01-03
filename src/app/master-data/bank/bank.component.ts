import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { BankDialogFormComponent } from './dialog/form';

@Component({
    selector: 'app-bank',
    templateUrl: './bank.component.html',
    styleUrls: ['./bank.component.scss'],
    animations: fuseAnimations
})
export class BankComponent implements OnInit {

    ComUrl = 'e/master/bank/';

    form: any = {};
    filter: any = {};
    Default: any = {};

    def_list: number;

    Busy;
    perm: any = {};
    Data;
    DelayData;

    public Com: any = {
        name: 'Bank',
        title: 'Data Bank',
        icon: 'account_balance_wallet'
    };

    /* ====================== GRID DATA ====================== */
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

    /* Table Column */
    TableCol = [
        {
            headerName: 'Bank',
            field: 'nama',
            width: 80,
            suppressSizeToFit: true
        },
        {
            headerName: 'Currency',
            field: 'currency',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Account No',
            field: 'no_rekening',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'COA Code',
            field: 'coa_kode',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'COA Name',
            field: 'coa_nama',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Company',
            field: 'company_nama',
            width: 150,
        },
        // {
        //     headerName: 'Saldo',
        //     field: 'saldo',
        //     filter: 'agSetColumnFilter',
        //     width: 150,
        //     valueFormatter(params) {
        //         var get = params.context;
        //         if (params.value > 0) {
        //             return get.parent.core.rupiah(params.value, 2, true);
        //         } else {
        //             return '-';
        //         }
        //     },
        //     cellStyle(params) {
        //         if (params.data) {
        //             let get = params.context;
        //             let Default = {
        //                 textAlign: 'right',
        //                 fontWeight: 'bold'
        //             };
        //             var Style = get.parent.RowStyle(params);

        //             $.extend(Style, Default);

        //             return Style;
        //         }
        //     }
        // },
        {
            headerName: 'Status',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'Active',
                            'Inactive'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 200,

            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (params.data.status == 1) {
                        Return = 'ACTIVE';
                    } else {
                        Return = 'INACTIVE';
                    }

                    return Return;
                }
            }
        }
    ];

    constructor(
        private dialog: MatDialog,
        private core: Core
    ) { }

    ngOnInit(): void {

        /*Load Company*/
        this.core.Do(this.ComUrl + 'default', {}).subscribe(
            result => {
                if (result.data) {
                    this.Default.company = result.data;
                    this.Default.bank = result.bank;
                    this.Default.coa = result.coa;
                }
            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }

    Reload() {
        this.LoadData(this.gridParams);
    }

    /*Grid Ready*/
    onGridReady(params): void {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }


    /*Load data*/
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

    /*Filter Change*/
    FilterChanged(params): void {
        const ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }

    /* Grid Style */
    RowStyle(params) {
        if (params.data) {
            return {};
        }
    }

    /*Context Menu*/
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
                icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
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

    /*List Change*/
    ListChange(e): void {
        this.def_list = e;
    }

    /*Double Click*/
    onDoubleClick(params): void {
        this.OpenForm('detail-' + params.data.id);
    }

    /*Form Dialog*/
    dialogRef: MatDialogRef<BankDialogFormComponent>;
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
            // Check if Detail
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
            BankDialogFormComponent,
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

    // Delete
    Delete(data): void {
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
                    const Params = {
                        id: data.id
                    };
                    this.core.Do(this.ComUrl + 'delete', Params).subscribe(
                        success => {
                            if (success.status == 1) {
                                this.gridApi.purgeServerSideCache();
                            } else {
                                const Alert = {
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

}
