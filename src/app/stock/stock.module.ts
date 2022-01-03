import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockRoutingModule, RoutableStock, DialogStock } from './stock-routing.module';
import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';

@NgModule({
    imports: [
        CommonModule,
        StockRoutingModule,
        SharedModule,
        AgGridModule.withComponents([]),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot()
    ],
    declarations: [
        RoutableStock,
        DialogStock
    ],
    entryComponents: [
        DialogStock
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class StockModule { }
