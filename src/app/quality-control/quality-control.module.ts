import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';
import { QualityControlRoutingModule, RoutableQualityControl, DialogQualityControl } from './quality-control-routing.module';

@NgModule({
    declarations: [
        RoutableQualityControl,
        DialogQualityControl
    ],
    imports: [
        CommonModule,
        QualityControlRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    entryComponents : [
        DialogQualityControl
    ],
    providers: [
        {
        	provide: MAT_DATE_FORMATS,
        	useValue: CoreDateFormat
        }
    ]
})
export class QualityControlModule { }
