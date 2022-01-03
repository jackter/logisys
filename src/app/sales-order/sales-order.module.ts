import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesOrderRoutingModule, RoutableSalesOrder, EntrySalesOrder } from './sales-order-routing.module';
import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';

@NgModule({
    imports: [
        CommonModule,
        SalesOrderRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RoutableSalesOrder,
        EntrySalesOrder
    ],
    entryComponents: [
        EntrySalesOrder
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class SalesOrderModule { }
