import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

    ComUrl = 'e/dashboard/';

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
        this.core.Do(this.ComUrl + 'stats', {}).subscribe(
            result => {
                this.Data = result;

                this.ChartOutstanding();
            }
        )
    }
    //=> END : Load Data
    
    chart_out;
    ChartOutstanding(){

        var PieChart = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Outstanding'
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
                    data: this.Data.outstanding
                }
            ]
        };

        this.chart_out = new Chart(PieChart as any);
    }

}
