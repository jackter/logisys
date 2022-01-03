import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Core } from 'providers/core';
import { ExchangeRateDetailDialogComponent } from './dialog/detail';
import { ExchangeRateDialogComponent } from './dialog/form';

@Component({
    selector: 'app-exchange-rate',
    templateUrl: './exchange-rate.component.html',
    styleUrls: ['./exchange-rate.component.scss'],
    animations: fuseAnimations
})
export class ExchangeRateComponent implements OnInit {

    ComUrl = 'e/master/exchange/';

    form: any = {};
    filter: any = {};
    Default: any = {};

    def_list: number;

    Busy;
    perm: any = {};
    Data;
    DelayData;

    public Com: any = {
        name: 'Exchange Rate',
        title: 'Data Exchange Rate',
        icon: 'attach_money'
    };

    dialogRef: MatDialogRef<ExchangeRateDetailDialogComponent>;
    dialogRef2: MatDialogRef<ExchangeRateDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
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
            headerName: 'Tanggal',
            field: 'tanggal',
            width: 200,
            suppressSizeToFit: true
        },
        {
            headerName: 'Description',
            field: 'description'
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

                                    if (result) {
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


    /*Context Menu*/
    // getContextMenuItems(params): any {
    //     const menu = [];
    //     const data = params.node.data;
    //     const get = params.context;

    //     if (get.parent) {
    //         menu.push({
    //             name: 'Edit',
    //             action(): void {
    //                 get.parent.OpenForm(data.id);
    //             },
    //             icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
    //             cssClasses: [
    //                 'indigo-fg'
    //             ]
    //         });
    //     }

    //     if (get.parent) {
    //         menu.push('separator');
    //         menu.push({
    //             name: 'Delete',
    //             action(): void {
    //                 get.parent.Delete(data);
    //             },
    //             icon: '<i class="fa fa-trash red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
    //             cssClasses: [
    //                 'red-fg'
    //             ]
    //         });
    //     }
    //     return menu;
    // }

    /*List Change*/
    // ListChange(e): void {
    //     this.def_list = e;
    // }

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        return menu;

    }
    // => / END : Context Menu

    /*Double Click*/
    onDoubleClick(params): void {
        this.OpenForm(params.data.tanggal);
    }

    // /*Form Dialog*/
    OpenForm(tgl): void {
        this.form = {};
        if (tgl == 'add') {
            this.ShowFormDialog2();
        }
        else {
            this.form.tgl = tgl;
            this.ShowFormDialog();
        }
    }

    ShowFormDialog(): void {
        this.dialogRef = this.dialog.open(
            ExchangeRateDetailDialogComponent,
            this.dialogRefConfig
        );

        this.dialogRef.componentInstance.form = this.form;
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
                if (result.reopen === 1) {
                    this.OpenForm(result.id);
                }
            }
        });
    }

    ShowFormDialog2(): void {
        this.dialogRef2 = this.dialog.open(
            ExchangeRateDialogComponent,
            this.dialogRefConfig
        );

        this.dialogRef2.componentInstance.form = this.form;
        this.dialogRef2.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef2.componentInstance.Com = this.Com;

        // fungsi untuk merefresh data pada ag grid yang baru diinput
        this.dialogRef2.afterClosed().subscribe(result => {
            this.dialogRef2 = null;

            if (result) {
                if (!this.Data) {
                    this.LoadData(this.gridParams);
                } else {
                    this.gridApi.purgeServerSideCache();
                }
                if (result.reopen === 1) {
                    this.OpenForm(result.id);
                }
            }
        });
    }

    // // Delete
    // Delete(data): void {
    //     swal({
    //             title: 'Apakah Anda yakin!',
    //             html: '<div>Menghapus data?</div><div><small><strong>' + data.nama + '</strong></small></div>',
    //             type: 'warning',
    //             reverseButtons: true,
    //             focusCancel: true,
    //             showCancelButton: true,
    //             confirmButtonText: 'Yes',
    //             cancelButtonText: 'Cancel'
    //         }).then(
    //         result => {
    //             if (result.value) {
    //                 const Params = {
    //                     id: data.id
    //                 };
    //                 this.core.Do(this.ComUrl + 'delete', Params).subscribe(
    //                     success => {
    //                         if (success.status === 1) {
    //                             this.gridApi.purgeServerSideCache();
    //                         } else {
    //                             const Alert = {
    //                                 msg: success.error_msg
    //                             };
    //                             this.core.OpenAlert(Alert);
    //                         }
    //                     },
    //                     error => {
    //                         this.core.OpenNotif(error);
    //                     }
    //                 );
    //             }
    //         }
    //     );
    // }

}
