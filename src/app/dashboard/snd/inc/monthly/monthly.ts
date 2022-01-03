import { Component } from '@angular/core';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';
import * as _ from 'lodash';
import * as moment from 'moment';


@Component({
    selector: 'dash-monthly',
    template: `
        <div [chart]="chart_out" style="height: 400px;"></div>
    `
})
export class ChartMonthlyComponent {

    ComUrl = 'e/dashboard/snd/';

    Data: any = {};

    constructor(
        private core: Core
    ){

    }

    ngOnInit(){
        this.LoadData();
    }

   /**
     * Load Data
     */
    LoadData(){
        this.core.Do(this.ComUrl + 'multi-line', {}).subscribe(
            result => {
                this.Data = result;

                this.Chart();
            }
        )
    }
    //=> END : Load Data

    Year;

    chart_out;
    Chart() {

        this.Year = moment(new Date()).format('YYYY');

        var LineChart = {

            chart: {
                type: 'spline',
            },
            title: {
                text: 'Monthly Supply & Demand ' + this.Year
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: this.Data.bulan
            },
            yAxis: {
                title: {
                    text: 'Data'
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        // radius: 4,
                        lineColor: '#666666',
                        lineWidth: 1
                    }
                }
            },
            series: [{
                name: 'MR',
                marker: {
                    symbol: 'square'
                },
                data: this.Data.mr       
            },{
                name: 'PR',
                marker: {
                    symbol: 'diamond'
                },
                data: this.Data.pr
        
            },{
                name: 'PO',
                marker: {
                    symbol: 'square'
                },
                data: this.Data.po
        
            },{
                name: 'GR',
                marker: {
                    symbol: 'diamond'
                },
                data: this.Data.gr
        
            },{
                name: 'GI',
                marker: {
                    symbol: 'square'
                },
                data: this.Data.gi
        
            }]

        } 

        this.chart_out = new Chart(LineChart as any);

    }

}