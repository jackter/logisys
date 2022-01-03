import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MRComponent } from './mr/mr.component';
import { MRFormDialogComponent } from './mr/dialog/form';

import { PMRComponent } from './pmr/pmr.component';
import { PMRFormDialogComponent } from './pmr/dialog/form';
import { PRMultiMRFormDialogComponent } from './pmr/dialog/formmulti';

import { PRComponent } from './pr/pr.component';
import { PRFormDialogComponent } from './pr/dialog/form';

import { PQComponent } from './pq/pq.component';
import { PQFormDialogComponent } from './pq/dialog/form';
import { PQGenerateDialogComponent } from './pq/dialog/generate';
import { PQReplyDialogComponent } from './pq/dialog/reply';
import { PQCompareDialogComponent } from './pq/dialog/compare';
import { PQCloseDialogFormComponent } from './pq/dialog/close';
import { PQRejectFormDialogComponent } from './pq/dialog/reject';

import { POComponent } from './po/po.component';
import { POFormDialogComponent } from './po/dialog/form';
import { GRComponent } from './gr/gr.component';
import { GRFormDialogComponent } from './gr/dialog/form';
import { ReportMRComponent } from './report/report-mr/report-mr.component';
import { GIComponent } from './gi/gi.component';
import { GIFormDialogComponent } from './gi/dialog/form';
import { MTComponent } from './mt/mt.component';
import { MTFormDialogComponent } from './mt/dialog/form';
import { MRPrintDialogComponent } from './mr/dialog/print';
import { AuthGuard } from './../auth.guard';
import { PRPrintDialogComponent } from './pr/dialog/print';
import { GRDetailDialogComponent } from './gr/dialog/detail';
import { POCreateFormDialogComponent } from './po/dialog/create';
import { GIHistoryDialogComponent } from './gi/dialog/history';
import { GIHistoryDetailDialogComponent } from './gi/dialog/detail';
import { RGRComponent } from './rgr/rgr.component';
import { RGRCreateFormDialogComponent } from './rgr/dialog/create';
import { RGRPrintDialogComponent } from './rgr/dialog/print';

import { RGIComponent } from './rgi/rgi.component';
import { RGICreateFormDialogComponent } from './rgi/dialog/create';
import { RGIPrintDialogComponent } from './rgi/dialog/print';
import { MonitoringRequestComponent } from './report/monitoring-request/monitoring-request.component';
import { POCloseFormDialogComponent } from './po/dialog/close';
import { WbGrnComponent } from './wb-grn/wb-grn.component';
import { WBGrnFormDialogComponent } from './wb-grn/dialog/form';
import { MonitoringPrComponent } from './report/monitoring-pr/monitoring-pr.component';
import { MonitoringPoComponent } from './report/monitoring-po/monitoring-po.component';
import { ReportGrnComponent } from './report/report-grn/report-grn.component';
import { ReportRgrComponent } from './report/report-rgr/report-rgr.component';
import { MonitoringGrComponent } from './report/monitoring-gr/monitoring-gr.component';
import { POCancelFormDialogComponent } from './po/dialog/cancel';
import { PRCloseFormDialogComponent } from './pr/dialog/close';
import { MRRejectFormDialogComponent } from './mr/dialog/reject';
import { PRRejectFormDialogComponent } from './pr/dialog/reject';
import { MtoComponent } from './mto/mto.component';
import { MtiComponent } from './mti/mti.component';
import { MTOFormDialogComponent } from './mto/dialog/form';
import { MTIFormDialogComponent } from './mti/dialog/form';
import { MTIPrintDialogComponent } from './mti/dialog/print';
import { MTOPrintDialogComponent } from './mto/dialog/print';
import { MR2Component } from './mr2/mr2.component';
import { MR2FormDialogComponent } from './mr2/dialog/form';
import { MR2PrintDialogComponent } from './mr2/dialog/print';
import { MR2RejectFormDialogComponent } from './mr2/dialog/reject';
import { DirectPRFormDialogComponent } from './pr/dialog/direct';
import { OsPoNullComponent } from './report/os-po-null/os-po-null.component';
import { OsPoPartialComponent } from './report/os-po-partial/os-po-partial.component';

const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 28
            },
            canActivate: [AuthGuard],
            path: 'mr',
            component: MRComponent
        },
        {
            data: {
                id: 186
            },
            canActivate: [AuthGuard],
            path: 'mr2',
            component: MR2Component
        },
        {
            data: {
                id: 29
            },
            canActivate: [AuthGuard],
            path: 'pmr',
            component: PMRComponent
        },
        {
            data: {
                id: 30
            },
            canActivate: [AuthGuard],
            path: 'pr',
            component: PRComponent
        },
        {
            data: {
                id: 31
            },
            canActivate: [AuthGuard],
            path: 'pq',
            component: PQComponent
        },
        {
            data: {
                id: 32
            },
            canActivate: [AuthGuard],
            path: 'po',
            component: POComponent
        },
        {
            data: {
                id: 33
            },
            canActivate: [AuthGuard],
            path: 'gr',
            component: GRComponent
        },
        {
            data: {
                id: 36
            },
            canActivate: [AuthGuard],
            path: 'gi',
            component: GIComponent
        },
        {
            data: {
                id: 37
            },
            canActivate: [AuthGuard],
            path: 'material_transfer',
            component: MTComponent
        },
        {
            path: 'report',
            children: [
                {
                    data: {
                        id: 35
                    },
                    canActivate: [AuthGuard],
                    path: 'mr',
                    component: ReportMRComponent
                },
                {
                    data: {
                        id: 56
                    },
                    canActivate: [AuthGuard],
                    path: 'monitoring_request',
                    component: MonitoringRequestComponent
                },
                {
                    data: {
                        id: 190
                    },
                    canActivate: [AuthGuard],
                    path: 'monitoring_pr',
                    component: MonitoringPrComponent
                },
                {
                    data: {
                        id: 94
                    },
                    canActivate: [AuthGuard],
                    path: 'monitoring_po',
                    component: MonitoringPoComponent
                },
                {
                    data: {
                        id: 97
                    },
                    canActivate: [AuthGuard],
                    path: 'monitoring_gr',
                    component: MonitoringGrComponent
                },
                {
                    data: {
                        id: 95
                    },
                    canActivate: [AuthGuard],
                    path: 'grn',
                    component: ReportGrnComponent
                },
                {
                    data: {
                        id: 96
                    },
                    canActivate: [AuthGuard],
                    path: 'rgr',
                    component: ReportRgrComponent
                },
                {
                    data: {
                        id: 209
                    },
                    canActivate: [AuthGuard],
                    path: 'os_po_null',
                    component: OsPoNullComponent
                },
                {
                    data: {
                        id: 210
                    },
                    canActivate: [AuthGuard],
                    path: 'os_po_partial',
                    component: OsPoPartialComponent
                }
            ]
        },
        {
            data: {
                id: 43
            },
            canActivate: [AuthGuard],
            path: 'rgr',
            component: RGRComponent
        },
        {
            data: {
                id: 44
            },
            canActivate: [AuthGuard],
            path: 'rgi',
            component: RGIComponent
        },
        {
            data: {
                id: 129
            },
            canActivate: [AuthGuard],
            path: 'mto',
            component: MtoComponent
        },
        {
            data: {
                id: 130
            },
            canActivate: [AuthGuard],
            path: 'mti',
            component: MtiComponent
        },
        {
            data: {
                id: 83
            },
            canActivate: [AuthGuard],
            path: 'wb-grn',
            component: WbGrnComponent
        }
    ]
}];

export const RoutableSupplyDemand = [
    MRComponent,
    MR2Component,
    PMRComponent,
    PRComponent,
    PQComponent,
    POComponent,
    GRComponent,
    GIComponent,
    MTComponent,
    RGIComponent,

    ReportMRComponent,

    RGRComponent,
    RGIComponent,

    MtoComponent,
    MtiComponent,

    MonitoringRequestComponent,
    MonitoringPrComponent,
    MonitoringPoComponent,
    MonitoringGrComponent,
    WbGrnComponent,
    ReportGrnComponent,
    ReportRgrComponent,
    OsPoNullComponent,
    OsPoPartialComponent,

];

export const DialogSupplyDemand = [
    MRFormDialogComponent,
    MRPrintDialogComponent,
    MRRejectFormDialogComponent,

    PMRFormDialogComponent,
    PRMultiMRFormDialogComponent,

    PRFormDialogComponent,
    PRCloseFormDialogComponent,
    PRPrintDialogComponent,
    PRRejectFormDialogComponent,
    DirectPRFormDialogComponent,

    PQFormDialogComponent,
    PQGenerateDialogComponent,
    PQReplyDialogComponent,
    PQCompareDialogComponent,
    PQRejectFormDialogComponent,
    PQCloseDialogFormComponent,

    POFormDialogComponent,
    POCreateFormDialogComponent,
    POCloseFormDialogComponent,
    POCancelFormDialogComponent,

    GRFormDialogComponent,
    GRDetailDialogComponent,

    GIFormDialogComponent,
    GIHistoryDialogComponent,
    GIHistoryDetailDialogComponent,

    MTFormDialogComponent,

    RGRCreateFormDialogComponent,
    RGRPrintDialogComponent,
    RGICreateFormDialogComponent,
    RGIPrintDialogComponent,

    WBGrnFormDialogComponent,

    MTOFormDialogComponent,
    MTIFormDialogComponent,
    MTIPrintDialogComponent,
    MTOPrintDialogComponent,

    MR2FormDialogComponent,
    MR2PrintDialogComponent,
    MR2RejectFormDialogComponent,
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SupplyDemandRoutingModule { }
