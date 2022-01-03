import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/auth.guard';
import { VehicleActivityComponent } from './vehicle-activity/vehicle-activity.component';
import { VehicleActivityDetailComponent } from './vehicle-activity/detail/detail';
import { VehicleActivityDetailFormDialogComponent } from './vehicle-activity/detail/dialog/form';

import { WorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderFormDialogComponent } from './work-order/dialog/form';
import { WorkOrderPrintDialogComponent } from './work-order/dialog/print';
import { WoRequestComponent } from './wo-request/wo-request.component';
import { WORequestFormDialogComponent } from './wo-request/dialog/form';
import { WoProcessComponent } from './wo-process/wo-process.component';
import { WOProcessFormDialogComponent } from './wo-process/dialog/form';
import { ReportWoHistoryComponent } from './report/report-wo-history/report-wo-history.component';

const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 135
            },
            canActivate: [AuthGuard],
            path: 'vehicle_activity',
            children: [
                {
                    path: '',
                    component: VehicleActivityComponent,
                },
                {
                    path: 'detail/:id',
                    component: VehicleActivityDetailComponent
                }
            ]
        },
        {
            path: 'workshop',
            children: [
                {
                    data: {
                        id: 138
                    },
                    canActivate: [AuthGuard],
                    path: 'work-order',
                    component: WorkOrderComponent
                }
            ]
        },
        {
            path: 'workshop',
            children: [
                {
                    data: {
                        id: 192
                    },
                    canActivate: [AuthGuard],
                    path: 'wo-request',
                    component: WoRequestComponent
                }
            ]
        },
        {
            path: 'workshop',
            children: [
                {
                    data: {
                        id: 197
                    },
                    canActivate: [AuthGuard],
                    path: 'wo-process',
                    component: WoProcessComponent
                }
            ]
        },
        {
            path: 'report',
            children: [
                {
                    data: {
                        id: 199
                    },
                    canActivate: [AuthGuard],
                    path: 'wo-history',
                    component: ReportWoHistoryComponent
                }
            ]
        }
    ]
}];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class OperationRoutingModule { }

export const RoutableOperation = [
    VehicleActivityComponent,
    VehicleActivityDetailComponent,

    WorkOrderComponent,
    WoRequestComponent,
    WoProcessComponent,

    ReportWoHistoryComponent
];

export const DialogOperation = [
    VehicleActivityDetailFormDialogComponent,

    WorkOrderFormDialogComponent,
    WorkOrderPrintDialogComponent,
    WORequestFormDialogComponent,
    WOProcessFormDialogComponent

];
