import { Component, OnInit } from '@angular/core';
import { FuseConfigService } from 'fuse/services/config.service';
import { Chart } from 'angular-highcharts';
import { Core } from 'providers/core';

@Component({
    selector: 'app-snd',
    templateUrl: './snd.component.html',
    styleUrls: ['./snd.component.scss']
})
export class SndComponent implements OnInit {


    Data: any = {};

    constructor(
        public _fuseConfigService: FuseConfigService,
        private core: Core

    ) {
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    folded: true
                }
            }
        };
    }

    ngOnInit() {
    }

    

}
