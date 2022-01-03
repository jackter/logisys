import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import * as moment from 'moment';
import swal from 'sweetalert2';
import { ContractRequestFormDialogComponent } from './dialog/form';

@Component({
    selector: 'app-contract-request',
    templateUrl: './contract-request.component.html',
    styleUrls: ['./contract-request.component.scss'],
    animations: fuseAnimations
})
export class ContractRequestComponent implements OnInit {

    ComUrl = 'e/contract/contract_request/';

    form: any = {};
    filter: any = {};
    Default: any = {};
    perm: any = {};
    Busy: any;

    Data: any;
    DelayData: any;

    /**
     * Grid Options
     */
    limit = 100;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            width: 150,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: 'keep',
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history',
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
        maxBlocksInCache: 2
    };

    /**
    * TableCol
    */
    TableCol = [
        {
            headerName: 'Request Date',
            field: 'tanggal',
            suppressSizeToFit: true,
            width: 130,
            valueFormatter(params): string {
                if (params.value) {
                    return moment(params.value).format('DD/MM/YYYY');
                }
            }
        },
        {
            headerName: 'Company',
            field: 'company_abbr',
            width: 100,
            suppressSizeToFit: true
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 400
        },
        {
            headerName: 'Work Code',
            field: 'work_code',
            width: 150,
            suppressSizeToFit: true
        },
        {
            headerName: 'Status',
            pinned: 'right',
            field: 'status_data',
            filter: 'agSetColumnFilter',
            filterParams: {
                values(params): void {
                    setTimeout(() => {
                        params.success([
                            'DRAFT',
                            'VERIFIED, WAITING APPROVE',
                            'APPROVED'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 300,

            valueGetter(params): any {
                if (params.data) {
                    var Return;

                    if (params.data.verified != 1) {
                        Return = 'DRAFT';
                    } else if (params.data.approved == 1) {
                        Return = 'APPROVED';
                    }
                    else {
                        Return = 'VERIFIED, WAITING APPROVE';
                    }
                    return Return;
                }
            }
        }
    ];

    public Com: any = {
        name: 'Contract Request',
        title: 'Contract Request List',
        icon: 'library_books',
    };

    constructor(
        private core: Core,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.LoadCompany();
    }

    LoadCompany() {
        var Params = {
            NoLoader: 1
        };
        this.core.Do(this.ComUrl + 'company', Params).subscribe(
            result => {
                if (result) {
                    this.Default = result;
                }
            },
            error => {
                console.error('LoadCompany', error);
                this.core.OpenNotif(error);
            }
        );

    }

    onGridReady(params): void {
        this.gridParams = params;
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.LoadData(params);
    }

    Reload(): void {
        this.LoadData(this.gridParams);
    }

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

    /**
     * Filter Changed
     */
    FilterChanged(params) {
        var ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }

    /**
     * Grid Style
     */
    RowStyle(params) {
        if (params.data) {
            if (params.data.verified != 1) {
                return {
                    color: 'rgba(0, 0, 0, 0.87)',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (params.data.verified == 1 && params.data.approved == 0) {
                return {
                    color: 'red',
                    fontStyle: 'italic'
                };
            }
        }
    }

    /**
     * Double Click
     */
    onDoubleClick(params): void {
        this.OpenForm('detail-' + params.data.id);
    }

    /**
     * Context Menu
     */
    getContextMenuItems(params): any {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit && data.verified != 1) {
            menu.push({
                name: 'Edit',
                action() {
                    get.parent.OpenForm(data.id);
                },
                icon: '<i class="fa fa-edit indigo-fg" style="font-size: 18px; padding-top: 2px;"></i>',
                cssClasses: [
                    'indigo-fg'
                ]
            });
        }

        if (get.parent.perm.hapus && data.verified != 1) {
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

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<ContractRequestFormDialogComponent>;
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
        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            ContractRequestFormDialogComponent,
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
    }

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

}
