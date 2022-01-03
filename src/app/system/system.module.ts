import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemRoutingModule, RoutableSystem } from './system-routing.module';
import { PermDialogComponent } from './perm/dialog/form';
import { PermListDialogComponent } from './perm/dialog/permissions';
import { UserDialogComponent } from './user/dialog/form';
import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
    imports: [
        CommonModule,
        SystemRoutingModule,
        SharedModule,
        AgGridModule.withComponents([]),
    ],
    declarations: [
        RoutableSystem
    ],
    entryComponents: [
        UserDialogComponent,

        PermDialogComponent,
        PermListDialogComponent
    ]
})
export class SystemModule { }
