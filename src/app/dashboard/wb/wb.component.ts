import { Component, OnInit } from '@angular/core';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-wb',
    templateUrl: './wb.component.html',
    styleUrls: ['./wb.component.scss']
})
export class WbComponent implements OnInit {

    constructor(
        public _fuseConfigService: FuseConfigService
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
