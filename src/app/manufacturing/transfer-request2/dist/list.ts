import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from 'fuse/animations';
import { Core } from 'providers/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { FuseConfigService } from 'fuse/services/config.service';

@Component({
    selector: 'app-transfer-deliver',
    templateUrl: './list.html',
    styleUrls: [
        '../transfer-request2.component.scss'
    ],
    animations: fuseAnimations
})
export class TransferRequest2DeliveryComponent implements OnInit {

    DetailID;

    ComUrl = 'e/manufacturing/mtr2/dist/';

    public Com: any = {
        name: 'Delivery',
        title: 'Transfer Process',
        icon: 'local_shipping',
    };

    form: any = {};
    Default: any;
    filter: any = {};
    DFilter: any = {};
    perm: any = {};
    Busy;

    Data;

    Ready;

    constructor(
        private core: Core,
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public _fuseConfigService: FuseConfigService
    ) {
        activatedRoute.params.subscribe(params => {
            if (params.id) {
                this.DetailID = params.id;
            }
        });

        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    folded: true
                }
            }
        };
    }

    ngOnInit(): void {
        this.LoadDefault();
    }

    Back() {
        this.router.navigate(['/manufacturing/transfer_request2']);
    }

    /**
     * Reload Data
     */
    Reload() {
        // this.LoadData(this.gridParams);
        this.LoadDefault();
    }
    // => END : Reload Data

    /**
     * Load Default
     */
    LoadDefault() {

        var Params = {
            id: this.DetailID
        };

        this.Ready = false;

        this.core.Do(this.ComUrl + 'default', Params).subscribe(
            result => {

                if (result) {

                    this.Default = result;

                    if (this.Default.jo.kode) {
                        this.Com.title = this.Default.jo.kode;
                    }

                    // var Progress = this.core.rupiah(Number(this.Default.MTR.total_delive) / Number(this.Default.MTR.total_qty) * 100, 2);
                    // if (this.Default.MTR.total_delive || this.Default.MTR.total_qty) {
                    //     this.Default.MTR.progress = Progress;
                    // } else {
                    //     this.Default.MTR.progress = '-';
                    // }

                    if(result.permissions){
                        this.perm = result.permissions;
                    }

                }

                this.Ready = true;
            },
            error => {
                console.log('GetForm', error);
                this.core.OpenAlert(error);
            }
        );

    }
    // => / END : Load Default

}
