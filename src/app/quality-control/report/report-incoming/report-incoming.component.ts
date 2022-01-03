import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import * as moment from 'moment';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-report-incoming',
    templateUrl: './report-incoming.component.html',
    styleUrls: ['./report-incoming.component.scss'],
    animations: fuseAnimations
})
export class ReportIncomingComponent implements OnInit {

    form: any = {};
    ComUrl = "e/qc/report/incoming/";
    public Com: any = {
        name: 'Report Resume Incoming Control',
        title: 'Report Resume Incoming Control',
        icon: 'done',
    };

    Default: any;
    filter: any = {};
    perm: any = {};
    Busy;

    Data: any = [];

    maxDate = moment(new Date()).format('YYYY-MM-DD');

    constructor(
        private core: Core,
        public _fuseConfigService: FuseConfigService
    ) {
        //configure the layout
        this._fuseConfigService.config = {
            layout:{
                navbar:{
                    folded:true
                }
            }
        }

    }

    ngOnInit() {
        this.LoadDefault();

        this.filter.flisting_type = 1;
    }

    rupiah(val, dec = 2, force = false){
        if(val){
            return this.core.rupiah(Number(val), dec, force);
        }else{
            return '-';
        }
    }
    rupiah2(val, dec = 2, force = true){
        return this.core.rupiah(Number(val), dec, force);
    }

    DelayTime;
    FillTime(){

        clearTimeout(this.DelayTime);
        this.DelayTime = setTimeout(() => {
            if(this.filter.Tdari && this.filter.Thingga){

                this.LoadData(this.gridParams);
    
            }
        }, 800);
        
    }


    //======== FillHingga
    FillHingga() {
        this.Data = [];

        var FinalHingga = "";

        if (!this.filter.fhingga) {
            var END = moment(this.filter.fdari, 'YYYY-MM-DD').endOf('month');
            this.filter.Tdari = '00:00';
            this.filter.Thingga = '23:59';

            FinalHingga = END.format('YYYY-MM-DD').toString();
            if (moment(END, 'YYYY-MM-DD') > moment(this.maxDate, 'YYYY-MM-DD')) {
                FinalHingga = this.maxDate;
            }

            setTimeout(() => {
                $('*[name="company_nama"]').focus();
            }, 250);
        } else {

            var Dari = moment(this.filter.fdari, 'YYYY-MM-DD');
            var Hingga = moment(this.filter.fhingga, 'YYYY-MM-DD');

            if (Dari > Hingga) {

                var END = moment(this.filter.fdari, 'YYYY-MM-DD').endOf('month');

                FinalHingga = END.format('YYYY-MM-DD').toString();
                if (moment(END, 'YYYY-MM-DD') > moment(this.maxDate, 'YYYY-MM-DD')) {
                    FinalHingga = this.maxDate;
                }

            }

            this.LoadData(this.gridParams);

        }

        this.filter.fdari = moment(this.filter.fdari).format('YYYY-MM-DD');
        if (FinalHingga) {
            this.filter.fhingga = FinalHingga;
        }

        this.LoadData(this.gridParams);

    }
    //======== / FillHingga

    /*Load Default*/
    LoadDefault() {
        var Params = {
            NoLoader: 1
        };
        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {
                if (result) {
                    this.Default = result;
                    this.PKS = this.Default.data;
                    
                }
            },
            error => {
                console.error('LoadDefault', error);
                this.core.OpenNotif(error);
            }
        );

    }

    PKS: any = [];
    PKSLast;
    PKSFilter(){
        setTimeout(() => {
            var val = this.filter.pks;

            if (val != this.PKSLast) {
                this.Data = [];
                this.filter.sup_cust = null;
            }
            if (val) {

                val = val.toString().toLowerCase();

                let i = 0;
                let Filtered = [];
                for (let item of this.Default.data) {
                    if (
                        item.pks.toLowerCase().indexOf(val) != -1
                    ) {
                        Filtered[i] = item;
                        i++;
                    }
                }
                this.PKS = Filtered;
            } else {
                this.PKS = this.Default.data;
                this.LoadData(this.gridParams);
            }
        }, 0);

    }

    PKSSelect(e,item){
        if (e.isUserInput) {
            setTimeout(() => {
        
                this.filter.sup_cust = item.sup_cust;
                this.filter.pks = item.pks;

                this.PKSLast = item.pks;
    
                this.LoadData(this.gridParams);
            },100);
        }
    }

    //============================ GRID
    /**
     * Grid Options
     */
    limit = 100;
    gridParams;
    gridApi;

    gridOptions: any = {
        defaultColDef: {
            minWidth: 75,
            filter: 'agTextColumnFilter',
            filterParams: {
                newRowsAction: "keep"
            },
            cellStyle: this.RowStyle,
            tooltipField: 'history'
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

        rowModelType: 'clientSide',
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

    defaultExportParams = {
        suppressTextAsCDATA: true
    };
    //=> / END : Grid Options

    /**
     * Grid Ready
     */
    onGridReady(params) {
        this.gridParams = params;
        this.gridApi = params.api;

        params.api.sizeColumnsToFit();

        this.LoadData(params);

    }
    //=> / END : Grid Ready

    /**
     * TableCol
     */
    TableCol = [
        {
            headerName: 'Date',
            field: 'create_date',
            suppressSizeToFit: true,
            minWidth: 100,
            valueFormatter(params) {
                if (params.data) {
                    if (
                        params.value && 
                        params.data.is_header != 1 &&
                        params.data.bottom != 1
                    ) {
                        return moment(params.value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
                    }else{
                        return params.value;
                    }
                }
            }
        },
        {
            headerName: 'Date Out',
            field: 'w_out_date',
            suppressSizeToFit: true,
            minWidth: 100,
            valueFormatter(params) {
                if (params.data) {
                    if (
                        params.value && 
                        params.data.is_header != 1 &&
                        params.data.bottom != 1
                    ) {
                        return moment(params.value, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
                    }else{
                        return params.value;
                    }
                }
            }
        },
        {
            headerName: 'Product',
            field: 'item_nama',
            suppressSizeToFit: true,
            width: 200,
            valueFormatter(params) {
                if (params.data) {
                    if (
                        params.value && 
                        params.data.is_header != 1
                    ) {
                        return params.value;
                    }
                }
            }
        },
        {
            headerName: 'No. Vehicle',
            field: 'veh_nopol',
            suppressSizeToFit: true,
            minWidth: 100,
            width: 100,
        },
        {
            headerName: 'Netto',
            field: 'netto',
            minWidth: 100,
            width: 100,
            cellStyle: function (params) {
                var Style: any = {
                    // textAlign: 'right'
                };

                Style = {
                    textAlign: 'right'
                };

                return Style;
            },
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.netto && Number(data.netto) != 0){
                        return $this.core.rupiah(Number(data.netto));
                    }else{
                        if(data.is_header != 1){
                            return '-';
                        }
                    }

                }
            }
        },
        {
            headerName: 'Source',
            field: 'pks',
            width: 100
        },
        {
            headerName: 'FFA',
            field: 'ffa_qc',
            minWidth: 50,
            width: 50,
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.ffa_qc && Number(data.ffa_qc) != 0){
                        return $this.core.rupiah(Number(data.ffa_qc), 2, true);
                    }else{
                        if(data.is_header != 1){
                            return '-';
                        }
                    }

                }
            }
        },
        {
            headerName: 'M & I',
            field: 'mai_qc',
            minWidth: 50,
            width: 50,
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.mai_qc && Number(data.mai_qc) != 0){
                        return $this.core.rupiah(Number(data.mai_qc), 2, true);
                    }else{
                        if(data.is_header != 1){
                            return '-';
                        }
                    }

                }
            }
        },
        {
            headerName: 'Dobi',
            field: 'dobi_qc',
            minWidth: 50,
            width: 50,
            valueGetter: function (params) {
                if (params.data) {

                    var data = params.data;
                    var $this = params.context.parent;

                    if(data.dobi_qc && Number(data.dobi_qc) != 0){
                        return $this.core.rupiah(Number(data.dobi_qc), 2, true);
                    }else{
                        if(data.is_header != 1){
                            return '-';
                        }
                    }

                }
            }
        }
    ];
    //=> / END : TableCol

    ExcelStyles = [
        {
            id: 'rupiah',
            numberFormat: {
                format: "#,##0.00"
            }
        }
    ];

    overlayLoadingTemplate = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div><span class="ag-overlay-loading-center">PLEASE WAIT</span>';
    overlayNoRowsTemplate = '<span class="ag-overlay-loading-center" style="color: #FF0000;">NO DATA TO DISPLAY, OR DATA IS EMPTY</span>';

    /**
     * Load Data
     */
    DelayData;
    Panel: any = {
        target_ffa: 4,
        target_mai: 0.25,
        target_dobi: 2.50,
        usl_ffa: 5,
        usl_mai: 0.5,
        usl_dobi: 2.7,
        lsl_ffa: 3,
        lsl_mai: 0.1,
        lsl_dobi: 2.4
    };
    LoadData(params) {

        if (
            this.filter.fdari &&
            this.filter.fhingga
        ) {

            this.filter.fhingga = moment(this.filter.fhingga).format('YYYY-MM-DD');
            // this.filter.Tdari = moment(this.filter.Tdari, 'HH:mm').format('HH:mm');
            // this.filter.Thingga = moment(this.filter.Thingga, 'HH:mm').format('HH:mm');

            /**
             * Load Data
             */
            var Params = {
                NoLoader: 1,
                notimeout: 1
            };

            if (this.filter) {
                $.extend(Params, this.filter);
            }

            this.gridApi.showLoadingOverlay();

            this.core.Do(this.ComUrl + 'data', Params).subscribe(
                result => {

                    this.perm = result.permissions;

                    if(result.data){

                        /**
                         * Insert Storage Nama sebagai header
                         */
                        var Last;
                        var NewData: any[] = [];

                        let Total: number = 0;
                        let TotalFFA: number = 0;
                        let TotalMAI: number = 0;
                        let TotalDobi: number = 0;

                        let SumFFA2: number = 0;
                        let SumMAI2: number = 0;
                        let SumDobi2: number = 0;

                        let SumFFA: number = 0;
                        let SumMAI: number = 0;
                        let SumDobi: number = 0;

                        let CountFFA: number = 0;
                        let CountMAI: number = 0;
                        let CountDobi: number = 0;

                        for(let item of result.data){
                            if(Last != item.pks){

                                Last = item.pks;

                                NewData.push({
                                    is_header: 1
                                });
                                NewData.push({
                                    create_date: item.pks,
                                    is_header: 1
                                });

                            }

                            /**
                             * Total
                             */
                            if(item.netto && Number(item.netto) > 0){
                                Total = Total + Number(item.netto);

                                if(Number(item.has_ffa) == 1){
                                    TotalFFA += Number(item.netto);
                                    CountFFA++;

                                    item.ffa_qty_a2 = Number(item.netto) * Math.pow(Number(item.ffa_qc), 2);
                                    // console.log(item.ffa_qty_a2);
                                    SumFFA2 += Number(item.ffa_qty_a2);

                                    item.ffa_qty = Number(item.ffa_qc) * Number(item.netto);
                                    SumFFA += Number(item.ffa_qty);
                                }
                                if(Number(item.has_mai) == 1){
                                    TotalMAI += Number(item.netto);
                                    CountMAI++;

                                    item.mai_qty_a2 = Number(item.netto) * Math.pow(Number(item.mai_qc), 2);
                                    SumMAI2 += Number(item.mai_qty_a2);

                                    item.mai_qty = Number(item.mai_qc) * Number(item.netto);
                                    SumMAI += Number(item.mai_qty);
                                }
                                if(Number(item.has_dobi) == 1){
                                    TotalDobi += Number(item.netto);
                                    CountDobi++;

                                    item.dobi_qty_a2 = Number(item.netto) * Math.pow(Number(item.dobi_qc), 2);
                                    SumDobi2 += Number(item.dobi_qty_a2);

                                    item.dobi_qty = Number(item.dobi_qc) * Number(item.netto);
                                    SumDobi += Number(item.dobi_qty);
                                }
                            }
                            //=> / END : Total

                            NewData.push(item);
                        }
                        // NewData;
                        //=> / END : Insert Storage Nama sebagai header

                        var BOTTOM = [
                            {
                                bottom: 1,
                                veh_nopol: 'TOTAL',
                                netto: Total,
                                pks: 'Average Quality',
                                ffa_qc: (SumFFA / TotalFFA),
                                mai_qc: (SumMAI / TotalMAI),
                                dobi_qc: (SumDobi / TotalDobi)
                            }
                        ];

                        this.gridApi.setPinnedBottomRowData(BOTTOM);

                        if(this.filter.pks){
                            this.gridApi.setRowData(result.data);
                        }else{
                            this.gridApi.setRowData(NewData);
                        }

                        this.Panel.SumFFA = SumFFA;
                        this.Panel.SumFFA2 = SumFFA2;
                        this.Panel.SumFFA22 = Math.pow(SumFFA, 2);
                        this.Panel.TotalFFA = TotalFFA;

                        this.Panel.SumMAI = SumMAI;
                        this.Panel.SumMAI2 = SumMAI2;

                        /**
                         * Panel Information
                         */
                        // this.Panel.avg_netto = TotalFFA / CountFFA;
                        this.Panel.avg_netto = TotalFFA;

                        this.Panel.avg_ffa = SumFFA / TotalFFA;
                        this.Panel.avg_mai = SumMAI / TotalMAI;
                        this.Panel.avg_dobi = SumDobi / TotalDobi;

                        // var ffa2 = Math.pow(SumFFA, 2);
                        // var ffa_a1 = ffa2 / TotalFFA;
                        // var ffa_a = SumFFA2 - ffa_a1;
                        // var ffa_b = 1 - TotalFFA;
                        // var ffa_c = Math.abs(ffa_a / ffa_b);
                        // console.log(ffa2, ffa_a1, ffa_a, ffa_b, ffa_c);
                        // this.Panel.stdev_ffa = ffa_a;

                        // this.Panel.stdev_ffa = Math.abs((SumFFA2-((SumFFA^2)/TotalFFA))/(1-TotalFFA))^0.5;
                        // this.Panel.stdev_ffa = Math.abs((SumFFA2 - (Math.pow(SumFFA, 2) / TotalFFA))) / Math.abs(Math.pow((1 - TotalFFA), 0.5));

                        // var ffa_1 = Math.pow(SumFFA, 2);
                        // var ffa_2 = ffa_1 / TotalFFA;
                        // var ffa_3 = SumFFA2 - ffa_2;
                        // var ffa_4 = 1-TotalFFA;
                        // var ffa_5 = this.core.sci(ffa_3 / ffa_4);
                        // console.log(ffa_1, ffa_2, ffa_3, ffa_4, ffa_5, Math.pow(Number(ffa_5), 0.5));

                        this.Panel.stdev_ffa = Math.pow(Math.abs((SumFFA2 - (Math.pow(SumFFA, 2) / TotalFFA)) / (1 - TotalFFA)), 0.5);
                        this.Panel.stdev_mai = Math.pow(Math.abs((SumMAI2 - (Math.pow(SumMAI, 2) / TotalMAI)) / (1 - TotalMAI)), 0.5);
                        this.Panel.stdev_dobi = Math.pow(Math.abs((SumDobi2 - (Math.pow(SumDobi, 2) / TotalDobi)) / (1 - TotalDobi)), 0.5);
                        // this.Panel.stdev_ffa = SumFFA2;

                        this.Panel.sigma3_ffa = 3 * this.Panel.stdev_ffa;
                        this.Panel.sigma3_mai = 3 * this.Panel.stdev_mai;
                        this.Panel.sigma3_dobi = 3 * this.Panel.stdev_dobi;

                        this.Panel.sigma6_ffa = 6 * this.Panel.stdev_ffa;
                        this.Panel.sigma6_mai = 6 * this.Panel.stdev_mai;
                        this.Panel.sigma6_dobi = 6 * this.Panel.stdev_dobi;

                        this.Panel.ucl_ffa = this.Panel.avg_ffa + this.Panel.sigma3_ffa;
                        this.Panel.ucl_mai = this.Panel.avg_mai + this.Panel.sigma3_mai;
                        this.Panel.ucl_dobi = this.Panel.avg_dobi + this.Panel.sigma3_dobi;

                        this.Panel.lcl_ffa = this.Panel.avg_ffa - this.Panel.sigma3_ffa;
                        this.Panel.lcl_mai = this.Panel.avg_mai - this.Panel.sigma3_mai;
                        this.Panel.lcl_dobi = this.Panel.avg_dobi - this.Panel.sigma3_dobi;

                        this.Panel.cp_ffa = (this.Panel.usl_ffa - this.Panel.lsl_ffa) / this.Panel.sigma6_ffa;
                        this.Panel.cp_mai = (this.Panel.usl_mai - this.Panel.lsl_mai) / this.Panel.sigma6_mai;
                        this.Panel.cp_dobi = (this.Panel.usl_dobi - this.Panel.lsl_dobi) / this.Panel.sigma6_dobi;

                        this.Panel.cpl_ffa = (this.Panel.avg_ffa - this.Panel.lsl_ffa) / this.Panel.sigma3_ffa;
                        this.Panel.cpl_mai = (this.Panel.avg_mai - this.Panel.lsl_mai) / this.Panel.sigma3_mai;
                        this.Panel.cpl_dobi = (this.Panel.avg_dobi - this.Panel.lsl_dobi) / this.Panel.sigma3_dobi;

                        this.Panel.cpu_ffa = (this.Panel.usl_ffa - this.Panel.avg_ffa) / this.Panel.sigma3_ffa;
                        this.Panel.cpu_mai = (this.Panel.usl_mai - this.Panel.avg_mai) / this.Panel.sigma3_mai;
                        this.Panel.cpu_dobi = (this.Panel.usl_dobi - this.Panel.avg_dobi) / this.Panel.sigma3_dobi;

                        this.Panel.cpk_ffa = this.Panel.cpl_ffa;
                        if(this.Panel.cpk_ffa > this.Panel.cpu_ffa){
                            this.Panel.cpk_ffa = this.Panel.cpu_ffa;
                        }
                        this.Panel.cpk_mai = this.Panel.cpl_mai;
                        if(this.Panel.cpk_mai > this.Panel.cpu_mai){
                            this.Panel.cpk_mai = this.Panel.cpu_mai;
                        }
                        this.Panel.cpk_dobi = this.Panel.cpl_dobi;
                        if(this.Panel.cpk_dobi > this.Panel.cpu_dobi){
                            this.Panel.cpk_dobi = this.Panel.cpu_dobi;
                        }

                        // var TestFormula = Math.pow(Math.abs((4432066-(Math.pow(1494607, 2)/504120)) / (1-504120)), 0.5);

                        // console.log(TestFormula);

                        // console.log(this.Panel);
                        //=> / END : Panel Information

                    }else{
                        this.gridApi.setRowData([]);
                    }

                },
                error => {
                    console.error(error);
                    this.Data = [];
                }
            );

        }

    }
    //=> / END : Load Data

    /**
     * Grid Style
     */
    RowStyle(params) {
        var Style: any = {};

        if (params.data) {

            if(params.data.is_header == 1){
                Style = {
                    fontWeight: 'bold'
                }
            }

            if(params.data.bottom == 1){
                Style = {
                    backgroundColor : '#fff799',
                    color: 'red',
                    fontWeight: 'bold'
                }
            }

        }

        return Style;
    }
    //=> / END : Grid Style

    /**
     * Filter Changed
     */
    FilterChanged(params) {

        var ParamsFilter = this.gridApi.getFilterModel();

        this.filter.ftable = JSON.stringify(ParamsFilter);

    }
    //=> / END : Filter Changed

    /**
	 * Context Menu
	 */
    getContextMenuItems(params) {

        var menu = [];

        var data = params.node.data;
        var get = params.context;

        menu.push('copy');
        menu.push('excelExport');

        return menu;

    }
    //=> / END : Context Menu

}
