import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from 'fuse/shared.module';
import { WBRoutingModule, RoutableWB, EntryWB } from './wb-routing.module';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';

@NgModule({
    imports: [
        CommonModule,
        WBRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RoutableWB,
        EntryWB
    ],
    entryComponents: [
        EntryWB
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class WBModule { }
