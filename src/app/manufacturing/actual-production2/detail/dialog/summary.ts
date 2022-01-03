import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Core } from 'providers/core';
import * as _ from 'lodash';

@Component({
    selector: 'summary-ap-detail',
    templateUrl: './summary.html'
})
export class SummaryDialogComponent implements OnInit {

    Default: any = [];
    Summary: any = [];

    ComUrl;

    Busy: any;

    constructor(
        public core: Core,
        public dialog: MatDialog

    ) { }

    ngOnInit() {
        this.LoadSummary();
    }

    LoadSummary() {
        var Params = {
            id: this.Default.JO.jo
        };

        this.core.Do(this.ComUrl + 'detail/summary', Params).subscribe(
            result => {

                if(result.data) {

                    var JO = result.data.detail_jo;
                    var Receive = result.data.detail_receive;
                    var Consume = result.data.detail_consume;

                    
                    for(let item of JO) {
                        
                        var FindReceive = _.find(Receive, {
                            item : item.item
                        });

                        var FindConsume = _.find(Consume, {
                            item : item.item
                        });

                        if(FindReceive) {
                            item.total_receive = FindReceive.total_receive;
                        }

                        if(FindConsume) {
                            item.total_consume = FindConsume.total_consume;
                        }
                    }

                    this.Summary = JO;

                }

            },
            error => {

                console.error('Gagal', error);
                this.core.OpenNotif(error);

            }
        );
    }

    rupiah(val) {
        if(val) {
            return this.core.rupiah(val);
        }
    }
}