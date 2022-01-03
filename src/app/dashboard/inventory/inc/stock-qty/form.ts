import { Component, Input } from '@angular/core';
import { BroadcasterService } from 'ng-broadcaster';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'stock-qty',
    templateUrl: './form.html'
})
export class StockQtyComponent {

    ComUrl = 'e/dashboard/inventory/';

    Data: any = {};

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
        this.core.Do(this.ComUrl + 'stock_qty', {}).subscribe(
            result => {

                if(result){
                    this.Data = result.stock_qty;

                    for(let item of this.Data){

                        if(item.satuan == 'Kg'){
                            item.y = Math.round(item.y) / 1000; 
                            item.satuan = "Ton";
                        }
                        if(item.satuan == 'Ltr'){
                            item.y = Math.round(item.y) / 1000; 
                            item.satuan = "Kl"
                        }

                        item.y = Math.round(item.y); 
                        if(item.decimal == 1){
                            item.y_cast = this.numberWithCommas(item.y) + '.00';
                        }else{
                            item.y_cast = this.numberWithCommas(item.y);                        
                        }
                    }
                    
                    this.ChartStockBalance();
                }
            }
        )
    }
    //=> END : Load Data

    stock_qty;
    ChartStockBalance(){

        // var ChartLine = {
        //     chart: {
        //         type: 'column',
        //         height: screen.availHeight
        //     },
        //     title: {
        //         text: 'Stock Qty'
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
        //         tickPixelInterval: 100,
        //         title: {
        //             text: 'Summary'
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
        // this.stock_qty = new Chart(ChartLine as any);


        var PieChart = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                height: screen.availHeight
            },
            title: {
                text: 'Stock Qty'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y_cast}</b> {point.satuan}'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        // format: '<b>{point.name}</b>: {point.y:.4f}',
                        format: '<b>{point.name}: {point.y_cast}</b> {point.satuan}',
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
        this.stock_qty = new Chart(PieChart as any);

    }

    numberWithCommas(n) {
        var parts=n.toString().split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
    }

}