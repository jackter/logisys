import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { TransactionComponent } from './transaction/transaction.component';
import { ContractComponent } from './contract/contract.component';
import { Contract2Component } from './contract2/contract2.component';
import { TransporterComponent } from './transporter/transporter.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { ContractFormDialogComponent } from './contract/dialog/form';
import { Contract2FormDialogComponent } from './contract2/dialog/form';
import { VehicleFormDialogComponent } from './vehicle/dialog/form';
import { TransporterFormDialogComponent } from './transporter/dialog/form';
import { TrxFormDialogComponent } from './transaction/dialog/form';
import { AuthGuard } from '../auth.guard';
import { DetailContractFormDialogComponent } from './contract/dialog/detail';
import { DetailContract2FormDialogComponent } from './contract2/dialog/detail';
import { ContractProgressComponent } from './report/contract-progress/contract-progress.component';
import { TransporterProgressComponent } from './report/transporter-progress/transporter-progress.component';
import { TransactionPrintDialogComponent } from './transaction/dialog/print';
import { TransactionsComponent } from './report/transactions/transactions.component';

const routes: Routes = [{
    path: '',
    children: [
        {
            data:{
                id: 76
            },
            canActivate: [AuthGuard],
            path: 'contract',
            component: ContractComponent
        },
        {
            data:{
                id: 188
            },
            canActivate: [AuthGuard],
            path: 'contract2',
            component: Contract2Component
        },
        {
            data:{
                id: 77
            },
            canActivate: [AuthGuard],
            path: 'transaction',
            component: TransactionComponent
        },
        {
            data:{
                id: 78
            },
            canActivate: [AuthGuard],
            path: 'transporter',
            component: TransporterComponent
        },
        {
            data:{
                id: 79
            },
            canActivate: [AuthGuard],
            path: 'vehicle',
            component: VehicleComponent
        },
        {
            path: 'report',
            children: [
                {
                    data:{
                        id: 91
                    },
                    canActivate: [AuthGuard],
                    path: 'transactions',
                    component: TransactionsComponent
                },
                {
                    data:{
                        id: 92
                    },
                    canActivate: [AuthGuard],
                    path: 'contract-progress',
                    component: ContractProgressComponent
                },
                {
                    data:{
                        id: 93
                    },
                    canActivate: [AuthGuard],
                    path: 'transporter-progress',
                    component: TransporterProgressComponent
                },
                {
                    path: '**',
                    redirectTo: 'transactions'
                }
            ]
        },
    ]
}]

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class WBRoutingModule { }

export const RoutableWB = [
    ContractComponent,
    Contract2Component,
    TransactionComponent,
    TransporterComponent,
    VehicleComponent,
    TransactionsComponent,
    ContractProgressComponent,
    TransporterProgressComponent
];

export const EntryWB = [
    ContractFormDialogComponent,
    Contract2FormDialogComponent,
    TransporterFormDialogComponent,
    VehicleFormDialogComponent,
    TrxFormDialogComponent,
    DetailContractFormDialogComponent,
    DetailContract2FormDialogComponent,
    TransactionPrintDialogComponent
];
