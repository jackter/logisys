import { Component, Input } from '@angular/core';
import { BroadcasterService } from 'ng-broadcaster';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'stock-balance',
    templateUrl: './form.html'
})
export class StockBalanceComponent {

    ComUrl = 'e/dashboard/inventory/';

    Data: any = {};
    Total;

    constructor(
        private broadcaster: BroadcasterService,
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
        this.core.Do(this.ComUrl + 'stock_balance', {}).subscribe(
            result => {

                if(result){
                    this.Data = result.stock_balance;

                    /**
                     * Total
                     */
                    var Total = 0;
                    for(let item of this.Data){
                        Total += Number(item.y);
                    }
                    this.Total = this.core.rupiah(Total, 2, true);
                    //=> END : Total

                    for(let item of this.Data){
                        item.y = Math.round(item.y);
                        item.y_cast = this.numberWithCommas(item.y) + '.00';
                    }
                    
                    this.ChartStockBalance();
                }
            }
        )
    }
    //=> END : Load Data

    stock_balance;
    ChartStockBalance(){

        // var ChartLine = {
        //     chart: {
        //         type: 'column',
        //         height: screen.availHeight
        //     },
        //     title: {
        //         text: 'Stock Balance'
        //     },
        //     xAxis: {
        //         type: 'category',
        //         labels: {
        //             rotation: -90,
        //             style: {
        //                 fontSize: '10px',
        //                 fontFamily: 'Verdana, sans-serif'
        //             }
        //         }
        //     },
        //     yAxis: {
        //         min: 0,
        //         title: {
        //             text: 'Rp'
        //         }
        //     },
        //     tooltip: {
        //         pointFormat: '{series.name}: <b>{point.y}</b>'
        //     },
        //     plotOptions: {
        //         pie: {
        //             allowPointSelect: true,
        //             cursor: 'pointer',
        //             dataLabels: {
        //                 enabled: true,
        //                 format: '<b>{point.name}</b>: {point.y :.1f}',
        //                 style: {
        //                     color: 'black'
        //                 }
        //             }
        //         }
        //     },
        //     legend: {
        //         enabled: false
        //     },
        //     series: [
        //         {
        //             name: 'Total',
        //             colorByPoint: true,
        //             data: this.Data,
        //             dataLabels: {
        //                 enabled: false,
        //                 rotation: -90,
        //                 color: '#FFFFFF',
        //                 align: 'right',
        //                 format: '{point.y}',
        //                 y: 0,
        //                 style: {
        //                     fontSize: '13px',
        //                     fontFamily: 'Verdana, sans-serif'
        //                 }
        //             }
        //         }
        //     ]

        // }
        // this.stock_balance = new Chart(ChartLine as any);


        var PieChart = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                height: screen.availHeight
            },
            title: {
                text: 'Stock Balance'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>Rp {point.y_cast}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        // format: '<b>{point.name}</b>: Rp {point.y:.4f}',
                        format: '<b>{point.name}</b>: Rp {point.y_cast}',
                        style: {
                            color: 'black'
                        }
                    }
                }
            },
            // colors: ['#2D8D2A', '#E1DC32'],
            series: [
                {
                    name: 'Total',
                    colorByPoint: true,
                    data: this.Data
                }
            ]
        };
        this.stock_balance = new Chart(PieChart as any);

    }

    numberWithCommas(n) {
        var parts=n.toString().split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
    }
}