import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { InputDobiFormDialogComponent } from './dialog/form';
import * as moment from 'moment';

@Component({
	selector: 'app-input-dobi',
	templateUrl: './input-dobi.component.html',
    styleUrls: ['./input-dobi.component.scss'],
    animations: fuseAnimations
})
export class InputDobiComponent implements OnInit {

	form: any = {};
    ComUrl = 'e/qc/incoming_dobi/';

    perm: any = {};
    filter: any = {};

    Default: any;

    Data;
    Busy;

    Ready = false;

    public Com: any = {
        name: 'Incoming Quality - Dobi',
        title: 'Incoming Quality - Dobi',
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
        // this.LoadData(this.gridParams);
        this.Ready = false;
        this.LoadDefault();
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
                    this.Default = result;

                    if(result.permissions){
                        this.perm = result.permissions;
                    }
                }

                this.Ready = true;

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
            headerName: 'Create Date',
            field: 'create_date',
            suppressSizeToFit: true,
            width: 150,
            valueGetter: function (params) {
                if (params.data) {
                    var Date = moment(params.data.create_date).format('DD/MM/YYYY HH:mm:ss');
                    return Date;

                }
            },
            filter: false
        },
        {
            headerName: 'PKS',
            field: 'pks'
        },
        {
            headerName: 'Start Date',
            suppressSizeToFit: true,
            width: 150,
            valueGetter: function(params){
                if(params.data){
                    var DateFormat = moment(params.data.start_date + ' ' + params.data.start_time).format('DD/MM/YYYY HH:mm');

                    return DateFormat;
                }
            },
            filter: false
        },
        {
            headerName: 'End Date',
            suppressSizeToFit: true,
            width: 150,
            valueGetter: function(params){
                if(params.data){
                    var DateFormat = moment(params.data.end_date + ' ' + params.data.end_time).format('DD/MM/YYYY HH:mm');

                    return DateFormat;
                }
            },
            filter: false
        },
        {
            headerName: 'Dobi',
            field: 'dobi',
            width: 100,
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.dobi && Number(data.dobi) != 0){
                        return $this.core.rupiah(Number(data.dobi), 2, true);
                    }else{
                        return '-';
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
                                    // $this.perm = result.permissions;

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

            return {};

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

        if (data.verified != 1) {

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

            // if (get.parent.perm.hapus) {
            //     menu.push('separator');
            //     menu.push({
            //         name: 'Delete',
            //         action: function () {
            //             get.parent.Delete(data);
            //         },
            //         icon: '<i class="fa fa-trash red-fg" style="font-size: 18px; padding-top: 2px;"></i>',
            //         cssClasses: [
            //             'red-fg'
            //         ]
            //     });
            // }
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
    // ============================ END : GRID

    /**
     * Form Dialog
     */
    dialogRef: MatDialogRef<InputDobiFormDialogComponent>;
    dialogRefConfig: MatDialogConfig = {
        disableClose: true,
        panelClass: 'event-form-dialog'
    }

    OpenForm(id){
        this.form = {};

        if(id == 'add'){
            this.form.id = 'add';
            this.ShowFormDialog();
        }else{
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
                        this.form.from_pr = 1;
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

    ShowFormDialog(){
        this.core.Sharing(null, 'reload');

        this.dialogRef = this.dialog.open(
            InputDobiFormDialogComponent,
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
    //=> / END : Form Dialog

}
