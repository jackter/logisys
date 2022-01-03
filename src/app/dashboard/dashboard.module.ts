import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'fuse/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { MAT_DATE_FORMATS } from '@angular/material';
import { CoreDateFormat } from '../../providers/core';
import { DashboardRoutingModule, RoutableDashboard, DialogDashboard } from './dashboard-routing.module';
import { ChartModule } from 'angular-highcharts';
@NgModule({
    declarations: [
        RoutableDashboard,
        DialogDashboard
    ],
    imports: [
        CommonModule,
        SharedModule,
        AgGridModule.withComponents([]),
        DashboardRoutingModule,
        ChartModule
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: CoreDateFormat
        }
    ]
})
export class DashboardModule { }
