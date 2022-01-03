import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth.guard';
import { ContractInvoiceComponent } from './contract-invoice/contract-invoice.component';
import { ContractProgressComponent } from './contract-progress/contract-progress.component';
import { ContractAgreementComponent } from './contract-agreement/contract-agreement.component';
import { ContractAdendumComponent } from './contract-adendum/contract-adendum.component';
import { ContractRequestComponent } from './contract-request/contract-request.component';
import { ContractInvoiceDpComponent } from './contract-invoice-dp/contract-invoice-dp.component';
import { ContractAgreementFormDialogComponent } from './contract-agreement/dialog/form';
import { ContractAgreementPrintDialogComponent } from './contract-agreement/dialog/print';
import { ContractRequestFormDialogComponent } from './contract-request/dialog/form';
import { ContractRequestDialogPrintComponent } from './contract-request/dialog/print';
import { ContractProgresFormDialogComponent } from './contract-progress/dialog/form';
import { ContractProgressPrintDialogComponent } from './contract-progress/dialog/print';
import { ContractInvoiceFormDialogComponent } from './contract-invoice/dialog/form';
import { ContractInvoicePrintDialogComponent } from './contract-invoice/dialog/print';
import { ContractInvoiceDpFormDialogComponent } from './contract-invoice-dp/dialog/form';
import { ContractInvoiceDpPrintDialogComponent } from './contract-invoice-dp/dialog/print';

const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 179
            },
            canActivate: [AuthGuard],
            path: 'contract-invoice',
            component: ContractInvoiceComponent
        },
        {
            data: {
                id: 178
            },
            canActivate: [AuthGuard],
            path: 'contract-invoice-others',
            component: ContractInvoiceDpComponent
        },
        {
            data: {
                id: 180
            },
            canActivate: [AuthGuard],
            path: 'contract-progress',
            component: ContractProgressComponent
        },
        {
            data: {
                id: 181
            },
            canActivate: [AuthGuard],
            path: 'contract-agreement',
            component: ContractAgreementComponent
        },
        {
            data: {
                id: 182
            },
            canActivate: [AuthGuard],
            path: 'contract-adendum',
            component: ContractAdendumComponent
        },
        {
            data: {
                id: 183
            },
            canActivate: [AuthGuard],
            path: 'contract-request',
            component: ContractRequestComponent
        },
        {
            path: '**',
            redirectTo: 'contract-request'
        }
    ]
}];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class ContractRoutingModule { }

export const RoutableContract = [
    ContractInvoiceComponent,
    ContractInvoiceDpComponent,
    ContractProgressComponent,
    ContractAgreementComponent,
    ContractAdendumComponent,
    ContractRequestComponent
];

export const EntryContract = [
    ContractAgreementFormDialogComponent,
    ContractAgreementPrintDialogComponent,

    ContractRequestFormDialogComponent,
    ContractRequestDialogPrintComponent,
    
    ContractProgresFormDialogComponent,
    ContractProgressPrintDialogComponent,

    ContractInvoiceFormDialogComponent,
    ContractInvoicePrintDialogComponent,

    ContractInvoiceDpFormDialogComponent,
    ContractInvoiceDpPrintDialogComponent
];
