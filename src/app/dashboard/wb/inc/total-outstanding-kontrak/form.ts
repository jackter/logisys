import { Component, OnInit } from '@angular/core';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'wb-total-outstanding-kontrak',
    templateUrl: './form.html'
})
export class TotalOutstandingKontrakFormComponent implements OnInit {

    ComUrl = 'e/dashboard/wb/';

    Default: any = {};
    Data: any = {};
    constructor(
        private core: Core
    ) {}

    ngOnInit() {
        this.LoadData();
    }

    // Load Data
    LoadData() {
        this.core.Do(this.ComUrl + 'total_outstanding_kontrak', {}).subscribe(
            result => {
                this.Data = result;
                this.Chart();
            }
        );
    }

    chart_out;

    Chart() {
        let PieChart = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Total Outstanding Contract'
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
                    data: this.Data.wb_kontrak
                }
            ]
        };
        this.chart_out = new Chart(PieChart as any);
    }

}
