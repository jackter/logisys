import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from 'fuse/shared.module';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from 'providers/core';
import { ContractRoutingModule, RoutableContract, EntryContract } from './contract-routing.module';

@NgModule({
    declarations: [
        RoutableContract,
        EntryContract
    ],
    imports: [
        CommonModule,
        ContractRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    entryComponents: [
        EntryContract
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class ContractModule { }
