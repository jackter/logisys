import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingRoutingModule, RoutableAccounting, EntryAccounting } from './accounting-routing.module';
import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from '../../providers/core';

@NgModule({
	imports: [
		CommonModule,
        AccountingRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RoutableAccounting,
        EntryAccounting
    ],
    entryComponents: [
        EntryAccounting
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class AccountingModule {}
