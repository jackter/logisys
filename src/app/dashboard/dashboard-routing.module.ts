import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SndComponent } from './snd/snd.component';
import { ManufacturingComponent } from './manufacturing/manufacturing.component';
import { InventoryComponent } from './inventory/inventory.component';
import { FinanceComponent } from './finance/finance.component';
import { WbComponent } from './wb/wb.component';
import { DashboardComponent } from './dashboard.component';
import { StockQtyComponent } from './inventory/inc/stock-qty/form';
import { StockBalanceComponent } from './inventory/inc/stock-balance/form';
import { prFormComponent } from './snd/inc/pr/form';
import { PoFormComponent } from './snd/inc/po/form';
import { grFormComponent } from './snd/inc/gr/form';
import { TotalOutstandingKontrakFormComponent } from './wb/inc/total-outstanding-kontrak/form';
import { AuthGuard } from 'app/auth.guard';
import { ChartCostGIComponent } from './snd/inc/cost-gi/cost.gi';
import { ChartMonthlyComponent } from './snd/inc/monthly/monthly';
import { JOProgresComponent } from './manufacturing/inc/jo/jo';

const routes: Routes = [{
    path: '',
    children: [
        {
            path: '',
            redirectTo: 'default',
        },
        {
            path: 'default',
            component: DashboardComponent
        },
        {
            data: {
                id: 101
            },
            canActivate: [AuthGuard],
            path: 'snd',
            component: SndComponent
        },
        {
            data: {
                id: 102
            },
            canActivate: [AuthGuard],
            path: 'manufacturing',
            component: ManufacturingComponent
        },
        {
            data: {
                id: 103
            },
            canActivate: [AuthGuard],
            path: 'inventory',
            component: InventoryComponent
        },
        {
            data: {
                id: 104
            },
            canActivate: [AuthGuard],
            path: 'finance',
            component: FinanceComponent
        },
        {
            data: {
                id: 105
            },
            canActivate: [AuthGuard],
            path: 'wb',
            component: WbComponent
        },
        {
            path: '**',
            redirectTo: '/error/404'
        }
    ]
}];

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
export class DashboardRoutingModule { }

export const RoutableDashboard = [
    DashboardComponent,
    SndComponent,
    ManufacturingComponent,
    InventoryComponent,
    FinanceComponent,
    WbComponent
];

export const DialogDashboard = [
    StockQtyComponent,
    StockBalanceComponent,

    prFormComponent,
    PoFormComponent,
    grFormComponent,

    ChartCostGIComponent,
    ChartMonthlyComponent,

    TotalOutstandingKontrakFormComponent,

    JOProgresComponent
];
