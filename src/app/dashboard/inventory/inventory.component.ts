import { Component, OnInit } from '@angular/core';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

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
