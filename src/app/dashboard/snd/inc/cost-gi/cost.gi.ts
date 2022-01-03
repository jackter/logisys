import { Component } from '@angular/core';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import * as _ from 'lodash';

@Component({
    selector: 'dash-cost_gi',
    template: `
        <div [chart]="TheChart" style="height: 400px;"></div>
    `
})
export class ChartCostGIComponent {

    ComUrl = 'e/dashboard/snd/';

    Default: any = {};
    Data: any = {};
    Dept: any = {};
    GroupDept;

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
        this.core.Do(this.ComUrl + 'cost.gi', {}).subscribe(
            result => {
                this.Data = result;

                if(result.dept){
                    var Dept = [];
                    for(let item of result.dept){
                        for(let dept of item){
                            Dept.push(dept);
                        }
                    }

                    Dept = _.uniq(Dept);
                    this.GroupDept = Dept;
                }

                // this.Chart();

                this.core.Do(this.ComUrl + 'cost.gi.dept', {
                    dept: JSON.stringify(this.GroupDept)
                }).subscribe(
                    result => {
                        
                        this.Dept = result.dept;

                        this.Chart();

                    }
                );
            }
        )
    }
    //=> END : Load Data

    /**
     * Chart
     */
    TheChart;
    Chart(){
        var ChartOptions: any = {
            title: {
                text: 'Monthly Operational Costs'
            },
            xAxis: {
                categories: this.Data.bulan
            },
            yAxis: {
                title: {
                  text: 'Total Costs'
                },
                // min: - 2
            },
            labels: {
                // items: [{
                //     html: 'Total fruit consumption',
                //     style: {
                //         left: '50px',
                //         top: '18px',
                //         color: ( // theme
                //             Highcharts.defaultOptions.title.style &&
                //             Highcharts.defaultOptions.title.style.color
                //         ) || 'black'
                //     }
                // }]
            },
            tooltip: {
                pointFormat: '<b>{series.name}</b>: Rp. {point.y:,.2f}',
                split: true,
                shared: true,
                crosshairs: true
            },
            series: [
                {
                    type: 'column',
                    name: 'TOTAL',
                    color: '#303f9f',
                    data: this.Data.val,
                }, 
            ]
        }

        /**
         * Push Dept into Series spline
         */
        if(this.GroupDept){
            for(let item of this.GroupDept){

                // console.log(this.Dept[item]);

                ChartOptions.series.push({
                    type: 'spline',
                    name: item,
                    data: this.Dept[item]
                });
            }
        }
        //=> / END : Push Dept into Series spline

        this.TheChart = new Chart(ChartOptions as any);
    }
    //=> / END : Chart

}