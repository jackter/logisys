import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IncomingComponent } from './incoming/incoming.component';
import { AuthGuard } from 'app/auth.guard';
import { ReportIncomingComponent } from './report/report-incoming/report-incoming.component';
import { IncomingFormDialogComponent } from './incoming/dialog/form';
import { InputDobiComponent } from './input-dobi/input-dobi.component';
import { InputDobiFormDialogComponent } from './input-dobi/dialog/form';

const routes: Routes = [{
  path: '',
  children: [
    {
        data: {
            id : 121
        },
        canActivate: [AuthGuard],
        path: 'incoming',
        component: IncomingComponent
    },
    {
        data: {
            id : 125
        },
        canActivate: [AuthGuard],
        path: 'incoming_dobi',
        component: InputDobiComponent
    },
    {
        path: 'report',
        children: [
            {
                data: {
                    id : 122
                },
                canActivate: [AuthGuard],
                path: 'incoming',
                component: ReportIncomingComponent
            }
        ]
    }
  ]
}];

export const RoutableQualityControl = [
    IncomingComponent,
    ReportIncomingComponent,
    InputDobiComponent
];

export const DialogQualityControl = [
    IncomingFormDialogComponent,
    InputDobiFormDialogComponent
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]

})
export class QualityControlRoutingModule { }
