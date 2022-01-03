import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'dialog-print-work-order',
    templateUrl: './print2.html',
    styleUrls: ['../work-order.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WorkOrderPrintDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    WaitPrint: boolean;

    ComUrl;
    Com;
    Busy;

    Delay;
    Activity: any;
    Material: any;
    Mechanic: any;
    JobTitle: any;
    JobExplan: any;
    JobOvertime: any;
    AditionalMaterial: any;
    Comment: any;

    Row;

    constructor(
        public core: Core,
        public dialogRef: MatDialogRef<WorkOrderPrintDialogComponent>
    ) {

    }

    newMechanic: any;

    ngOnInit() {
        this.Material = this.form.material;
        this.Mechanic = this.form.mechanic;
        this.JobOvertime = this.form.overtime;
        this.AditionalMaterial = this.form.aditional;
        this.JobExplan = this.form.job_explan;

        if(this.Material || this.AditionalMaterial){

            var newData = [];
            if(this.Material){

                for(let item of this.Material){
    
                    newData.push(item);
                }
            }

            if(this.AditionalMaterial){
                
                for(let item of this.AditionalMaterial){
                    newData.push(item);
                }
            }

            this.Material = newData;
            
        }
        // console.log(this.JobOvertime);

        if(this.JobOvertime){

            var newdata = [];
            var GroupLevel = Object.values(_.groupBy(this.JobOvertime, 'level'));

            var i = 0;
            for (let item of GroupLevel){

                var TotOvertime: number = 0;
                for(var j = 0; j <= item.length - 1; j++){
                    TotOvertime += GroupLevel[i][j].total_over_time;
                }

                var durasi = TotOvertime* 60;

                var jam = Math.floor(durasi/60);
                var menit = durasi - (jam * 60);

                newdata.push({
                    level : item[0].level,
                    total : jam + ' Jam '+ menit +' Menit',
                    manpower : item.length
                });

                i++;
            }

            this.newMechanic = newdata;
        }
        

        
        // if(this.Mechanic){

        //     console.log(this.Mechanic);
            
            
        //     var newdata = [];
        //     var FilterData = [];

        //     for(let item of this.Mechanic){

        //         FilterData = _.filter(this.JobOvertime, {
        //             kid: item.kid
        //         });
           
        //         var TotOvertime: number = 0;
        //         for(let detail of FilterData){
        //             TotOvertime += detail.over_time;
        //         }   
                
        //         item.total_overtime = TotOvertime;
         
        //     }
           
        //     var GroupLevel = Object.values(_.groupBy(this.Mechanic, 'level'));

        //     var i = 0;
        //     for (let item of GroupLevel){

        //         var TotOvertime: number = 0;
        //         for(var j = 0; j <= item.length - 1; j++){
        //             TotOvertime += GroupLevel[i][j].total_overtime;
        //         }

        //         var durasi = TotOvertime* 60;

        //         var jam = Math.floor(durasi/60);
        //         var menit = durasi - (jam * 60);

        //         newdata.push({
        //             level : item[0].level,
        //             total : jam + ' Jam '+ menit +' Menit',
        //             manpower : item.length
        //         });

        //         i++;
        //     }

        //     this.newMechanic = newdata;

        // }

        this.Row = this.form.gm_approve == 1 ? '9' : '6'; 

        if (this.form.maintenance == 1) {
            this.form.maintenance_show = 'Corrective Maintenance';
        } else
            if (this.form.maintenance == 2) {
                this.form.maintenance_show = 'Predictive Maintenance';
            } else
                if (this.form.maintenance == 3) {
                    this.form.maintenance_show = 'Preventive Maintenance';
                }

        if(this.form.job_title) {
            this.JobTitle = JSON.parse(this.form.job_title);
        }

        // if(this.form.job_explan) {
        //     this.JobExplan = JSON.parse(this.form.job_explan);
        // }

        if(this.form.comment) {
            this.Comment = JSON.parse(this.form.comment);
        }
    }

    rupiah(val) {
        return this.core.rupiah(val, 1, true);
    }

    date_indo(val) {
        return moment(val).locale('id').format('LL');
    }

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                // title: 'MATERIAL REQUEST NO# ' + this.form.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
