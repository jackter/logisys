import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from 'fuse/animations';
import * as moment from 'moment';
import { Core } from 'providers/core';
import swal from 'sweetalert2';
import { ShippingFormDialogComponent } from '../dialog/form';

@Component({
    selector: 'app-shipping-history',
    templateUrl: './history.html',
    styleUrls: ['../shipping.component.scss'],
    animations: fuseAnimations
})
export class ShippingHistoryDialogComponent implements OnInit {

    ComUrl = 'e/so/shipping/history/';

    public Com: any = {
        name: 'Shipping',
        title: 'History Shipping',
        icon: 'assignment'
    };

    HistoryID: any;
    Busy: any;
    filter: any = {};
    perm: any = {};
    form: any = {};
    Data: any;
    Default: any;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private router: Router,
        private ActivatedRoute: ActivatedRoute
    ) {
        ActivatedRoute.params.subscribe(params => {
            if (params.id) {
                this.HistoryID = params.id;
            }
        });
    }

    ngOnInit() {
        this.LoadSO();
        
    }

    Back() {
        this.router.navigate(['/so/shipping_instruction']);
    }

    /*Reload Data*/
    Reload() {
        this.LoadData(this.gridParams);
    }

    LoadSO(){
        var Params = {
            NoLoader: 1,
            id: this.HistoryID
        };

        this.core.Do(this.ComUrl + 'so_data', Params).subscribe(
            result => {

                if (result) {
                    this.Default = result;
        console.log(this.Default);

                }

            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );
    }

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

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Delivery Date',
            field: 'tanggal',
            width: 150,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
            valueGetter(params) {
                if (params.data) {
                    var Date = moment(params.data.tanggal).format('DD/MM/YYYY');
                    return Date;
                }
            }
        },
        {
            headerName: 'Code',
            field: 'kode',
            width: 200,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Status',
            field: 'status_data',
            // pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'UNVERIFIED',
                            'VERIFIED',
                            'APPROVED'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 100,
            suppressSizeToFit: false,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (params.data.verified != 1) {
                        return 'UNVERIFIED';
                    } else
                        if (params.data.verified == 1 && params.data.approved == 0) {
                            return 'VERIFIED, WAITING APPROVE';
                        } else
                            if ( params.data.verified == 1 && params.data.approved == 1) {
                                return 'APPROVED';
                            } else {
                                return 'Finish';
                            }

                    return Return;

                }
            }
        }
    ];

    /**
     * Grid Style
     */
    RowStyle(params) {
        if (params.data) {

            var Style: any = {};

            if (params.data.verified != 1) {
                Style = {
                    color: 'red',
                    backgroundColor: '#e8f756',
                    fontStyle: 'italic'
                };
            }

            if (
                (params.data.verified == 1 && params.data.approved == 0)
            ) {
                Style = {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            return Style;
        }
    }

    /**
     * Load Data
     */
    DelayData: any;
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
                            NoLoader: 1,
                            id: $this.HistoryID
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.core.Do($this.ComUrl + 'data', Params).subscribe(
                            result => {
                                // $this.count = result.count;
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
    // => / END : Load Data

    /**
   * Filter Changed
   */
    FilterChanged(params) {
        var ParamsFilter = this.gridApi.getFilterModel();
        this.filter.ftable = JSON.stringify(ParamsFilter);
    }

    /**
     * Context Menu
     */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        if (get.parent.perm.edit && data.verified != 1) {
            menu.push({
                name: 'Edit',
                action: function () {
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
                action: function () {
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

    /*Double Click*/
    onDoubleClick(params) {
        this.OpenForm('detail-' + params.data.id);
    }

    /*Form Dialog*/
    dialogRef: MatDialogRef<ShippingFormDialogComponent>;
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

                        if (result.storeloc_list) {
                            this.form.list_storeloc = result.storeloc_list;
                        }

                        // if (result.shipping) {
                        //     this.form.shipping = result.shipping;
                        // }
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
            ShippingFormDialogComponent,
            this.dialogRefConfig
        );

        this.form.is_shipping = true;

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

            if (result) {
                if (result.reopen == 1) {
                    this.OpenForm('detail-' + this.form.id);
                }
            }

        });
        // => / END : After Dialog Close

    }

    /**
     * Delete
     */
    Delete(item) {

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
                        id: item.id
                    };
                    this.core.Do(this.ComUrl + 'delete', Params).subscribe(
                        result => {

                            if (result.status == 1) {
                                var Success = {
                                    type: 'success',
                                    showConfirmButton: false,
                                    title: 'Delete Complete',
                                    msg: ''
                                };
                                this.core.OpenAlert(Success);
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
    //=> / END : Delete

}
