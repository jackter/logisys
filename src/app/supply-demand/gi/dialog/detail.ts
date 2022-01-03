import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Core } from 'providers/core';

@Component({
    selector: 'dialog-form-gi-history_detail',
    templateUrl: './detail.html',
    styleUrls: [
        '../gi.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class GIHistoryDetailDialogComponent implements OnInit {
    form: any;
    item: any;
    Data: any[];
    WaitPrint: boolean;
    Busy;

    constructor(
        private core: Core
    ) {

    }

    ngOnInit() {

        /**
         * Load Detail
         */
        this.LoadDetail();
        // => / END : Load Detail

    }

    /**
     * Load Detail
     */
    LoadDetail() {

        var Params = {
            id: this.item.id
        };
        this.core.Do('e/snd/gi/detail', Params).subscribe(
            result => {

                if (result.status == 1) {
                    this.Data = result.data;

                    /**
                     * Inject Remarks
                     */
                    // for(let item of result.data){
                    //     for(let mr of result)
                    // }
                    // => / END : Inject Remarks
                }

            },
            error => {
                console.error('Get Detail GI', error);
            }
        );

    }
    // => / END : Load Detail

    Print() {
        this.WaitPrint = true;

        setTimeout(() => {

            $('.print-area').print({
                globalStyle: true,
                mediaPrint: true,
                title: 'GOODS ISSUED NO# ' + this.item.kode,
                timeout: 60000,
            });

            this.WaitPrint = false;

        }, 1000);
    }

}
