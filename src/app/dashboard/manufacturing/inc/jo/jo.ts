import { Component } from '@angular/core';
import { Core } from 'providers/core';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'jo-progres',
    templateUrl: './jo.html'
})
export class JOProgresComponent {

    ComUrl = 'e/dashboard/manufacturing/';

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
        this.core.Do(this.ComUrl + 'jo', {}).subscribe(
            result => {

                if(result){
                    this.Data = result.data;

                }
            }
        )
    }
    //=> END : Load Data

}