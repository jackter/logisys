import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractComponent } from './contract/contract.component';
import { AuthGuard } from 'app/auth.guard';
import { ContractFormDialogComponent } from './contract/dialog/form';
import { ContractPrintDialogComponent } from './contract/dialog/print';
import { ShippingComponent } from './shipping/shipping.component';
import { ShippingFormDialogComponent } from './shipping/dialog/form';
import { ShippingHistoryDialogComponent } from './shipping/history/history';
import { ShippingHistoryDetailDialogComponent } from './shipping/dialog/detail';
import { SalesOrderComponent } from './sales-order/sales-order.component';
import { SalesOrderFormDialogComponent } from './sales-order/dialog/form';
import { SalesOrderDetailDialogComponent } from './sales-order/dialog/detail';
import { BillOfLadingComponent } from './bill-of-lading/bill-of-lading.component';
import { BLFormDialogComponent } from './bill-of-lading/dialog/form';
import { BLPrintDialogComponent } from './bill-of-lading/dialog/print';
import { SalesHandoverComponent } from './sales-handover/sales-handover.component';
import { SalesHandoverDialogFormComponent } from './sales-handover/dialog/form';
import { SalesHandoverDialogPrintComponent } from './sales-handover/dialog/print';


const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 68
            },
            canActivate: [AuthGuard],
            path: 'contract',
            component: ContractComponent
        },
        {
            data: {
                id: 99
            },
            canActivate: [AuthGuard],
            path: 'sales_order',
            component: SalesOrderComponent
        },
        {
            data: {
                id: 69
            },
            canActivate: [AuthGuard],
            path: 'gi_product',
            children: [
                {
                    path: '',
                    component: ShippingComponent

                },
                {
                    path: 'history/:id',
                    component: ShippingHistoryDialogComponent
                }
            ]
        },
        {
            data: {
                id: 198
            },
            canActivate: [AuthGuard],
            path: 'bill_of_lading',
            component: BillOfLadingComponent
        },
        {
            data: {
                id: 200
            },
            canActivate: [AuthGuard],
            path: 'sales_handover',
            component: SalesHandoverComponent
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesOrderRoutingModule { }

export const RoutableSalesOrder = [
    ContractComponent,
    ShippingComponent,
    ShippingHistoryDialogComponent,
    BillOfLadingComponent,
    SalesOrderComponent,
    SalesHandoverComponent
];

export const EntrySalesOrder = [
    ContractFormDialogComponent,
    ContractPrintDialogComponent,
    ShippingFormDialogComponent,
    ShippingHistoryDetailDialogComponent,
    SalesOrderFormDialogComponent,
    SalesOrderDetailDialogComponent,
    BLFormDialogComponent,
    BLPrintDialogComponent,
    SalesHandoverDialogFormComponent,
    SalesHandoverDialogPrintComponent
];
