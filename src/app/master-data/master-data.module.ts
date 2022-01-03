import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterDataRoutingModule, RoutableMasterData, EntryMasterData } from './master-data-routing.module';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from 'fuse/shared.module';

@NgModule({
    imports: [
        CommonModule,
        MasterDataRoutingModule,
        SharedModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        RoutableMasterData,
        EntryMasterData
    ],
    entryComponents: [
        EntryMasterData
    ]
})
export class MasterDataModule { }
