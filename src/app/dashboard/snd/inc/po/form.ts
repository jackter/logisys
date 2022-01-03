import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'snd-po',
    templateUrl: './form.html'
})
export class PoFormComponent implements OnInit {

    ComUrl = 'e/dashboard/snd/';

    Default: any = {};
    Data: any = {};

    constructor(
        private core: Core
    ) { }

    ngOnInit() {
        this.LoadData();
    }

    /**
     * Load Data
     */
    LoadData() {
        this.core.Do(this.ComUrl + 'po', {}).subscribe(
            result => {
                this.Data = result;

                this.Chart();
            }
        );
    }
    // => END : Load Data

    chart_out;

    Chart() {
        var PieChart = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Proces PO'
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
                    data: this.Data.po
                }
            ]
        };

        this.chart_out = new Chart(PieChart as any);
    }
}
