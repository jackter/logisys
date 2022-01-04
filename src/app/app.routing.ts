import { Routes } from "@angular/router";
import { FuseError404Component } from './pages/error/404/error-404.component';

import { ReportItemDetailDialogComponent } from 'app/stock/report/report-item/dialog/detail';

export const AppRoutes: Routes = [
    {
        path        : '',
        redirectTo  : '/dashboard/default',
        pathMatch   : 'full'
    },
    {
        path        : 'error',
        children    : [
            {
                path: '404',
                component: FuseError404Component
            }
        ]
    },
    {
        path            : 'system',
        loadChildren    : './system/system.module#SystemModule'
    },
    {
        path            : 'master',
        loadChildren    : './master-data/master-data.module#MasterDataModule'
    },
    {
        path            : 'stock',
        loadChildren    : './stock/stock.module#StockModule'
    },
    {
        path            : 'snd',
        loadChildren    : './supply-demand/supply-demand.module#SupplyDemandModule'
    },
    {
        path            : 'qc',
        loadChildren    : './quality-control/quality-control.module#QualityControlModule'
    },
    {
        path            : 'acc',
        loadChildren    : './accounting/accounting.module#AccountingModule'
    },
    {
        path            : 'so',
        loadChildren    : './sales-order/sales-order.module#SalesOrderModule'
    },
    {
        path            : 'operation',
        loadChildren    : './operation/operation.module#OperationModule'
    },
    {
        path            : 'contract',
        loadChildren    : './contract/contract.module#ContractModule'
    },
    {
        path            : 'dashboard',
        loadChildren    : './dashboard/dashboard.module#DashboardModule'
    },
    // {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // },
    {
        path      : '**',
        redirectTo: '/error/404'
    }
];

export const RoutableComponents = [
    FuseError404Component
];

export const EntryComponents = [
    ReportItemDetailDialogComponent   
];