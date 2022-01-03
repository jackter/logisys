import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Core } from 'providers/core';
import { fuseAnimations } from 'fuse/animations';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { TrRequestFormComponent } from '../dialog/form.request';
import { TrIssuedFormComponent } from '../dialog/form.issued';

@Component({
    selector: 'inc-request',
    templateUrl: './inc.request.html',
    animations: fuseAnimations
})
export class TrRequestComponent implements OnInit {

    @Input() params: any = {};

    @Output() reload = new EventEmitter();

    ComUrl: any;
    Default: any = {};
    perm: any = {};
    form: any = {};

    filter: any = {};
    DFilter: any = {};
    Busy;

    Data: any[] = [];
    Request: any;
    Unapproved: number;

    constructor(
        private core: Core,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.ComUrl = this.params.ComUrl;
        this.Default = this.params.Default;
        this.perm = this.params.Default.permissions;
    }

    Reload() {
        this.Data = [];
        this.LoadData(this.gridParams);
    }

    /**
     * Open Form
     */
    dialogRef: MatDialogRef<TrRequestFormComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    OpenForm(id) {

        this.form = {};

        if (id === 'add') {

            /**
             * Check Unapproved
             */
            if (this.Unapproved > 0) {

                this.core.OpenAlert({
                    title: 'Action Rejected!',
                    msg: `
                        <div>
                            Please Finish all outstanding Request Data before create a new one.
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

            this.form.id = 'add';

            this.ShowFormDialog();

        } else {
            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id,
                is_detail: isDetail,
                jo: this.params.DetailID
            };

            this.core.Do(this.ComUrl + 'request/get', Params).subscribe(
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
            TrRequestFormComponent,
            this.dialogRefConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogRef.componentInstance.ComUrl = this.ComUrl;
        this.dialogRef.componentInstance.Default = JSON.parse(JSON.stringify(this.Default));
        this.dialogRef.componentInstance.perm = this.perm;
        this.dialogRef.componentInstance.form = this.form;
        // =. / END : Inject Data to Dialog

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


            if (result && result.openIssued) {

                if (result.request) {
                    this.Request = result.request;
                }

                this.OpenFormIssued('add');

                return false;
            }

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
    // => / END : Open Form

    /**
     * Open Form Issued
     */
    dialogIssued: MatDialogRef<TrIssuedFormComponent>;
    dialogIssuedConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    };
    OpenFormIssued(id) {

        this.form = {};

        if (id === 'add') {

            this.form.id = 'add';

            this.ShowFormDialogIssued();

        } else {
            // => Check if Detail
            var IDSplit = id.toString().split('-');

            var isDetail = false;
            if (IDSplit[0] == 'detail') {
                isDetail = true;
                id = IDSplit[1];
            }

            var Params = {
                id: id,
                is_detail: isDetail,
                jo: this.params.DetailID
            };

            this.core.Do(this.ComUrl + 'request/get', Params).subscribe(
                result => {

                    if (result) {
                        this.form = result.data;
                        if (isDetail) {
                            this.form.is_detail = isDetail;
                        }

                        this.ShowFormDialogIssued();
                    }

                },
                error => {
                    console.error('GetForm', error);
                    this.core.OpenNotif(error);
                }
            );
        }

    }
    ShowFormDialogIssued() {
        this.core.Sharing(null, 'reload');

        this.dialogIssued = this.dialog.open(
            TrIssuedFormComponent,
            this.dialogIssuedConfig
        );

        /**
         * Inject Data to Dialog
         */
        this.dialogIssued.componentInstance.ComUrl = this.ComUrl;
        this.dialogIssued.componentInstance.Default = JSON.parse(JSON.stringify(this.Default));
        this.dialogIssued.componentInstance.perm = this.perm;
        this.dialogIssued.componentInstance.form = this.form;
        this.dialogIssued.componentInstance.Request = this.Request;
        // =. / END : Inject Data to Dialog

        /**
         * After Dialog Close
         */
        this.dialogIssued.afterClosed().subscribe(result => {
            this.dialogIssued = null;

            var Reload = 0;

            this.core.GetSharing('reload').subscribe(
                result => {
                    if (result) {
                        Reload = 1;
                    }
                }
            );

            if (result && Reload == 1) {

                this.reload.emit();
                // if (!this.Data) {
                //     this.LoadData(this.gridParams);
                // } else {
                //     this.gridApi.purgeServerSideCache();
                // }
            }

            // if (result) {
            //     if (result.reopen == 1) {
            //         this.OpenForm('detail-' + this.form.id);
            //     }
            // }
        });
        // => / END : After Dialog Close
    }
    // => / END : Open Form Issued

    // ============================ GRID
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
                newRowsAction: 'keep'
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history',
            wrapText: true,
            autoHeight: true
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
    // => / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Date',
            field: 'tanggal',
            width: 100,
            suppressSizeToFit: true,
            colSpan: function (params) {
                if (params.data) {
                    return params.data.is_header == 1 ? 2 : 1;
                }
            }
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Input Date',
            field: 'create_date',
            width: 100,
            filter: false,
            suppressSizeToFit: true,
            // cellStyle: this.RowStyle,
        },
        {
            headerName: 'Item Code',
            field: 'item_kode',
            width: 100,
            suppressSizeToFit: true,
            filter: false,
            colSpan: function (params) {
                if (params.data) {
                    return params.data.is_header == 1 ? 5 : 1;
                }
            }
        },
        {
            headerName: 'Item',
            field: 'item_nama',
            filter: false,
            width: 200,
            minWidth: 200,
            suppressSizeToFit: true,
        },
        {
            headerName: 'Qty Req',
            field: 'qty_req',
            filter: false,
            width: 75,
            minWidth: 75,
            cellStyle: function (params) {
                if (params.data) {

                    var $this = params.context.parent;

                    var CurrentStyle = {
                        textAlign: 'right'
                    };

                    var Style = $.extend($this.RowStyle(params), CurrentStyle);

                    return Style;

                }
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if (data.qty_req && Number(data.qty_req) != 0) {
                        return $this.core.rupiah(Number(data.qty_req), 2, true);
                    } else {
                        return '-';
                    }

                }
            }
        },
        // {
        //     headerName: 'Total Issued',
        //     field: 'total_issued',
        //     filter: false,
        //     cellStyle: function(params){
        //         if(params.data){

        //             var $this = params.context.parent;

        //             var CurrentStyle = {
        //                 textAlign: 'right'
        //             };

        //             var Style = $.extend($this.RowStyle(params), CurrentStyle);

        //             return Style;

        //         }
        //     },
        //     valueGetter: function (params) {
        //         if (params.data) {

        //             var data = params.data;
        //             var $this = params.context.parent;

        //             if(data.total_issued && Number(data.total_issued) != 0){
        //                 return $this.core.rupiah(Number(data.total_issued), 2, true);
        //             }else{
        //                 return '-';
        //             }

        //         }
        //     }
        // },
        {
            headerName: 'Outstanding',
            field: 'outstanding',
            filter: false,
            width: 75,
            minWidth: 75,
            cellStyle: function (params) {
                if (params.data) {

                    var $this = params.context.parent;

                    var CurrentStyle = {
                        textAlign: 'right',
                        color: '#FF0000'
                    };

                    var Style = $.extend($this.RowStyle(params), CurrentStyle);

                    return Style;

                }
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if (data.outstanding && Number(data.outstanding) != 0) {
                        return $this.core.rupiah(Number(data.outstanding), 2, true);
                    } else {
                        return '-';
                    }

                }
            }
        },
        {
            headerName: 'UOM',
            field: 'satuan',
            width: 75,
            minWidth: 75,
            suppressSizeToFit: true,
            filter: false
        },
        {
            headerName: 'Status',
            pinned: 'right',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function (params) {
                    setTimeout(() => {
                        params.success([
                            'Draft',
                            'Verified'
                        ]);
                    }, 250);
                },
                newRowsAction: 'keep'
            },
            width: 100,
            // suppressSizeToFit: true,
            valueGetter: function (params) {
                if (params.data) {

                    var Return;

                    if (!params.data.is_empty && !params.data.is_header) {
                        if (params.data.verified != 1) {
                            Return = 'DRAFT';
                        } else
                            if (params.data.verified == 1 && params.data.approved == 0) {
                                Return = 'Verified, Waiting Approve';
                            } else
                                if (Number(params.data.outstanding) == Number(params.data.qty_req)) {
                                    Return = 'Approved, Waiting for issued';
                                } else
                                    if (Number(params.data.outstanding) < Number(params.data.qty_req) && Number(params.data.outstanding) > 0) {
                                        Return = 'Issuing Process';
                                    } else
                                        if (Number(params.data.outstanding) <= 0) {
                                            Return = 'Finish';
                                        }
                    }

                    return Return;

                }
            }
        }
    ];
    // => / END : TableCol

    /**
     * Load Data
     */
    DelayData;
    Space: number = 0;
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
                            jo: $this.params.DetailID
                        };

                        if ($this.filter) {
                            $.extend(Params, $this.filter);
                        }

                        $this.Space = 0;

                        $this.core.Do($this.ComUrl + 'request/data', Params).subscribe(
                            result => {

                                // $this.count = result.count;
                                // $this.perm = result.permissions;
                                $this.Unapproved = result.unapproved;

                                setTimeout(() => {

                                    var lastRow = -1;
                                    var rowsThisPage = [];

                                    if (result.data) {

                                        var TempID;
                                        var NewData: any[] = [];

                                        for (let item of result.data) {

                                            if (item.id != TempID) {
                                                TempID = item.id;

                                                NewData.push({
                                                    verified: 1,
                                                    approved: 1,
                                                    is_separator: 1,
                                                    is_header: 1
                                                });
                                                NewData.push({
                                                    id: item.id,
                                                    tanggal: item.tanggal,
                                                    item_kode: item.kode,
                                                    is_header: 1,
                                                    is_big: 1,
                                                    verified: item.verified,
                                                    approved: item.approved,
                                                });

                                                $this.Space += 2;

                                            }

                                            // if(item.tipe != TempTipe){
                                            //     TempTipe = item.tipe;

                                            //     var TextTipe = '';
                                            //     switch(TempTipe){
                                            //         case 1:
                                            //             TextTipe = 'MATERIALS';
                                            //             break;
                                            //         case 2:
                                            //             TextTipe = 'PRODUCTIONS';
                                            //             break;
                                            //         case 3:
                                            //             TextTipe = 'UTILITIES';
                                            //             break;
                                            //         case 4:
                                            //             TextTipe = 'OTHERS';
                                            //             break;
                                            //     }

                                            //     NewData.push({
                                            //         id: item.id,
                                            //         item_kode: TextTipe,
                                            //         is_header: 1,
                                            //         verified: item.verified,
                                            //         approved: item.approved,
                                            //     });

                                            //     $this.Space += 1;

                                            // }

                                            NewData.push(item);
                                        }

                                        result.count += $this.Space;

                                        $this.Data = Object.assign($this.Data, NewData);
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

        if (get.parent.perm.edit_request && data.verified != 1) {
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

        if (get.parent.perm.hapus_request && data.verified != 1) {
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

    /**
     * Double Click
     */
    onDoubleClick(params) {
        if (Number(params.data.is_separator) != 1) {
            this.OpenForm('detail-' + params.data.id);
        }
    }
    onClick(params) {
        // if (params.data.approved == 1) {
        //     this.router.navigate(['/manufacturing/transfer_request2/deliver/' + params.data.id]);
        // }
    }
    // => / END : Double Click

    /**
     * Grid Style
     */
    RowStyle(params) {

        if (params.data) {

            var Style: any = {};

            if (params.data.verified != 1) {

                Style = {
                    color: 'red',
                    backgroundColor: '#faffc4',
                    fontStyle: 'italic'
                };
            }

            if (params.data.verified == 1 && params.data.approved == 0) {
                Style = {
                    color: 'blue',
                    fontStyle: 'italic'
                };
            }

            if (params.data.is_header == 1) {
                Style.fontWeight = 'bold';
            }

            if (params.data.is_big == 1) {
                Style.fontSize = '15px';
            }

            if (params.data.is_separator == 1) {
                // Style.backgroundColor = '#3f51b5';
                Style.backgroundColor = '#ccc';
            }

            Style.whiteSpace = 'normal';
            Style.lineHeight = '16px';

            return Style;
        }
    }
    // => / END : Grid Style
    // ============================ END : GRID

}
