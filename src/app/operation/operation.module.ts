import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';
import { RoutableOperation, DialogOperation, OperationRoutingModule } from './operation-routing.module';

@NgModule({
    declarations: [
        RoutableOperation,
        DialogOperation
    ],
    imports: [
        CommonModule,
        SharedModule,
        AgGridModule.withComponents([]),
        OperationRoutingModule
    ],
    entryComponents: [
        DialogOperation
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class OperationModule { }
