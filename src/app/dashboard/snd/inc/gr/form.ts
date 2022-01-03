import { Component, Input } from '@angular/core';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'snd-gr',
    templateUrl: './form.html'
})
export class grFormComponent {

    ComUrl = 'e/dashboard/snd/';

    Default: any = {};
    Data: any = {};

	constructor(
        private core: Core
    ) {}

    ngOnInit() {
        this.LoadData();
    }

    /**
     * Load Data
     */
    LoadData(){
        this.core.Do(this.ComUrl + 'gr', {}).subscribe(
            result => {
                this.Data = result;

                this.Chart();
            }
        )
    }
    //=> END : Load Data
    
    chart_out;
    Chart(){

        var PieChart = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Invoice GR'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: 'black'
                        }
                    }
                }
            },
            colors: ['#2D8D2A', '#E1DC32'],
            series: [
                {
                    name: 'Total',
                    colorByPoint: true,
                    data: this.Data.gr
                }
            ]
        };

        this.chart_out = new Chart(PieChart as any);
    }

}