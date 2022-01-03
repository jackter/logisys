import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import swal from 'sweetalert2';
import { BroadcasterService } from 'ng-broadcaster';
import * as _ from "lodash";
import * as moment from 'moment';

@Component({
    selector: 'dialog-form-oip',
    templateUrl: './form.html',
    styleUrls: ['../oip.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class OipFormDialogComponent implements OnInit {

    form: any = {};
    perm: any = {};
    Default: any = {};
    List: any = [{
        i: 0
    }];

    Total: any = {};

    Data: any[] = [];

    ComUrl;
    Com;
    Busy;

    Delay;
    
    minDate;

    constructor(
        public core: Core,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<OipFormDialogComponent>,
        private broadcaster: BroadcasterService
    ) {

    }

    ngOnInit() {

        if(this.form.id != 'add'){

            for(let i = 0; i < this.List.length; i++){
                this.List[i]['total'] = this.Total[i];
            }
            
            this.ReadySave = true;

        }
    }

    /**
     * Calculate Class
     */
    SUM: number;
    ReadySave;
    Calculate(detail, i) {

        this.ReadySave = false;
        
        clearTimeout(this.Delay);
        this.Delay = setTimeout(() => {

            var Lvl: number = detail.level;

            detail.actual_oip = (detail.mt * Lvl / 100) * 1000;

            this.SUM = 0;

            for(let item of this.List[i].detail){
                
                if(item.actual_oip){
                    this.SUM = this.SUM + Number(item.actual_oip);
                }

            }

            this.List[i]['total'] = this.SUM;

            this.ReadySave = true;
            
        }, 100);

    }
    // => / END : Class

    ShowList(){

        var Params = {
            plant : this.form.plant
        }

        this.core.Do(this.ComUrl + 'list', Params).subscribe(
            result => {

                this.List = result.data;
                
            },
            error => {

                console.error('Delete', error);
                this.core.OpenNotif(error);

            }
        );
        
    }

    Edit() {
        if (this.form.is_detail) {
            this.form.is_detail = null;
            this.broadcaster.broadcast('edit', this.form.is_detail);
        }
    }

    Simpan(){

        if(this.form.tanggal){
            this.form.tanggal_send = moment(this.form.tanggal).format('YYYY-MM-DD'); 
        }

        for(let item of this.List){
            for(let detail of item.detail){
                this.Data.push(detail);
            }
        }

        this.form.list = JSON.stringify(this.Data);
        
        var URL = this.ComUrl + 'edit';
        if (this.form.id == 'add') {
            URL = this.ComUrl + 'add';
        }

        this.Busy = true;
        this.core.Do(URL, this.form).subscribe(
            result => {

                if (result.status == 1) {

                    this.dialogRef.close(result);

                } else {
                    this.Busy = false;

                    var Alert = {
                        msg: result.error_msg
                    };
                    this.core.OpenAlert(Alert);
                }

            },
            error => {
                this.Busy = false;

                this.core.OpenNotif(error);
                console.error('Submit', error);
            }
        );
        
    }

    rupiah(val){
        if(val){
            return this.core.rupiah(val, 2, true);
        }
    }
}