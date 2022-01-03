import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from '../../providers/core';
import { ManufacturingRoutingModule, RoutableManufacturing, EntryManufacturing } from './manufacturing-routing.module';
import { Fg2Component } from './fg2/fg2.component';

@NgModule({
    imports: [
        CommonModule,
        ManufacturingRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RoutableManufacturing,
        EntryManufacturing,
        Fg2Component
    ],
    entryComponents: [
        EntryManufacturing
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]

})
export class ManufacturingModule { }
