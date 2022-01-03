import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplyDemandRoutingModule, RoutableSupplyDemand, DialogSupplyDemand } from './supply-demand-routing.module';
import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';
import { CommShared } from '../_shared/_shared.module';

@NgModule({
    imports: [
        CommonModule,
        SupplyDemandRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RoutableSupplyDemand,
        DialogSupplyDemand,
        CommShared
    ],
    entryComponents: [
        DialogSupplyDemand
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class SupplyDemandModule { }
