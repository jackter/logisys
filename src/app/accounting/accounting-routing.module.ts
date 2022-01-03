import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoiceDPComponent } from './invoice-dp/invoice-dp.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceFormDialogComponent } from './invoice/dialog/form';
import { PrintFormDialogComponent } from './invoice/dialog/print';
import { InvoiceDPFormDialogComponent } from './invoice-dp/dialog/form';
import { InvoiceDPPrintDialogComponent } from './invoice-dp/dialog/print';
import { OsPostingGiComponent } from './os-posting-gi/os-posting-gi.component';
import { AuthGuard } from './../auth.guard';
import { PostingGIFormDialogComponent } from './os-posting-gi/dialog/form';
import { JournalEntryComponent } from './journal-entry/journal-entry.component';
import { JournalFormDialogComponent } from './journal-entry/dialog/form';
import { GeneralLedgerComponent } from './report/general-ledger/general-ledger.component';
import { AssetComponent } from './asset/asset.component';
import { AssetFormDialogComponent } from './asset/dialog/form';
import { AssetTypeFormDialogComponent } from './asset-type/dialog/form';
import { AssetTypeComponent } from './asset-type/asset-type.component';
import { PeriodeEndComponent } from './periode-end/periode-end.component';
import { PeriodeEndFormDialogComponent } from './periode-end/dialog/form';
import { GLDetailDialogComponent } from './report/general-ledger/dialog/detail';
import { GlSummaryComponent } from './report/gl-summary/gl-summary.component';
import { GLSummaryDetailDialogComponent } from './report/gl-summary/dialog/detail';
import { PaymentRequestComponent } from './payment-request/payment-request.component';
import { PaymentRequestFormDialogComponent } from './payment-request/dialog/form';
import { PaymentRequestPrintDialogComponent } from './payment-request/dialog/print';
import { SalesInvComponent } from './sales-inv/sales-inv.component';
import { SalesInvDpComponent } from './sales-inv-dp/sales-inv-dp.component';
import { TrialBalanceComponent } from './report/trial-balance/trial-balance.component';
import { TBDetailDialogComponent } from './report/trial-balance/dialog/detail';
import { InvAgingComponent } from './report/inv-aging/inv-aging.component';
import { Sp3ManualComponent } from './sp3-manual/sp3-manual.component';
import { SP3FormDialogComponent } from './sp3-manual/dialog/form';
import { SP3JournalFormDialogComponent } from './sp3-manual/dialog/form_journal';
import { ListP3Component } from './report/list-p3/list-p3.component';
import { BankPaymentComponent } from './bank-payment/bank-payment.component';
import { BankReceiveComponent } from './bank-receive/bank-receive.component';
import { BankPaymentDialogFormComponent } from './bank-payment/dialog/form';
import { BankPaymentDialogPrintComponent } from './bank-payment/dialog/print';
import { BankReceiveDialogFormComponent } from './bank-receive/dialog/form';
import { BankReceiveDialogPrintComponent } from './bank-receive/dialog/print';
import { BalanceSheetComponent } from './report/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './report/profit-loss/profit-loss.component';
import { ListJeComponent } from './report/list-je/list-je.component';
import { SalesInvoiceFormDialogComponent } from './sales-inv/dialog/form';
import { SalesDpDialogFormComponent } from './sales-inv-dp/dialog/form';
import { SalesDpDialogPrintComponent } from './sales-inv-dp/dialog/print';
import { SalesDialogPrintComponent } from './sales-inv/dialog/print';

import { InvoiceMiscellaneousComponent } from './invoice-miscellaneous/invoice-miscellaneous.component';
import { InvoiceMiscellaneousFormDialogComponent } from './invoice-miscellaneous/dialog/form';
import { InvoiceMiscellaneousPrintDialogComponent } from './invoice-miscellaneous/dialog/print';
import { PengeluaranDialogPrintComponent } from './bank-payment/dialog/print2';
import { PenerimaanDialogPrintComponent } from './bank-receive/dialog/print2';
import { SalesInvMiscComponent } from './sales-inv-misc/sales-inv-misc.component';
import { SalesMiscDialogPrintComponent } from './sales-inv-misc/dialog/print';
import { SalesMiscDialogFormComponent } from './sales-inv-misc/dialog/form';
import { TBPrintDialogComponent } from './report/trial-balance/dialog/print';
import { GLDetailPrintDialogComponent } from './report/general-ledger/dialog/print';
import { TrialBalanceSummaryComponent } from './report/trial-balance-summary/trial-balance-summary.component';
import { TBSummaryDialogComponent } from './report/trial-balance-summary/dialog/detail';
import { TBSummaryPrintDialogComponent } from './report/trial-balance-summary/dialog/print';
import { ImportJVDialogComponent } from './journal-entry/dialog/import';
import { InvAgingSummaryComponent } from './report/inv-aging-summary/inv-aging-summary.component';
import { InvAgingArComponent } from './report/inv-aging-ar/inv-aging-ar.component';
import { InvAgingArSummaryComponent } from './report/inv-aging-ar-summary/inv-aging-ar-summary.component';
import { PrintInvAgingDialogComponent } from './report/inv-aging/dialog/print';
import { PrintInvAgingSummaryDialogComponent } from './report/inv-aging-summary/dialog/print';
import { DebitNoteComponent } from './debit-note/debit-note.component';
import { DebitNoteFormDialogComponent } from './debit-note/dialog/form';
import { DNPrintFormDialogComponent } from './debit-note/dialog/print';


const routes: Routes = [{
    path: '',
    children: [
        {
            path: 'inv',
            children: [
                {
                    data: {
                        id: 46
                    },
                    canActivate: [AuthGuard],
                    path: 'others',
                    component: InvoiceDPComponent
                },
                {
                    data: {
                        id: 47
                    },
                    canActivate: [AuthGuard],
                    path: 'default',
                    component: InvoiceComponent
                },
                {
                    data: {
                        id: 202
                    },
                    canActivate: [AuthGuard],
                    path: 'miscellaneous',
                    component: InvoiceMiscellaneousComponent
                },
                {
                    data: {
                        id: 208
                    },
                    canActivate: [AuthGuard],
                    path: 'sales_inv_misc',
                    component: SalesInvMiscComponent
                },
                {
                    data: {
                        id: 72
                    },
                    canActivate: [AuthGuard],
                    path: 'sales_inv',
                    component: SalesInvComponent
                },
                {
                    data: {
                        id: 73
                    },
                    canActivate: [AuthGuard],
                    path: 'sales_inv_dp',
                    component: SalesInvDpComponent
                },
                {
                    data: {
                        id: 216
                    },
                    canActivate: [AuthGuard],
                    path: 'debit_note',
                    component: DebitNoteComponent
                },
                {
                    data: {
                        id: 63
                    },
                    canActivate: [AuthGuard],
                    path: 'pay_request',
                    component: PaymentRequestComponent
                },
                {
                    path: '**',
                    redirectTo: 'default'
                }
            ]
        },
        {
            path: 'bank',
            children: [
                {
                    data: {
                        id: 117
                    },
                    canActivate: [AuthGuard],
                    path: 'payment',
                    component: BankPaymentComponent
                },
                {
                    data: {
                        id: 118
                    },
                    canActivate: [AuthGuard],
                    path: 'receive',
                    component: BankReceiveComponent
                },
                {
                    path: '**',
                    redirectTo: 'default'
                }
            ]
        },
        {
            data: {
                id: 50
            },
            canActivate: [AuthGuard],
            path: 'os_posting_gi',
            component: OsPostingGiComponent
        },
        {
            data: {
                id: 51
            },
            canActivate: [AuthGuard],
            path: 'journal_entry',
            component: JournalEntryComponent
        },
        {
            path: 'ast',
            children: [
                {
                    data: {
                        id: 52
                    },
                    canActivate: [AuthGuard],
                    path: 'ast-list',
                    component: AssetComponent
                },
                {
                    data: {
                        id: 53
                    },
                    canActivate: [AuthGuard],
                    path: 'ast-type',
                    component: AssetTypeComponent
                },
                {
                    path: '**',
                    redirectTo: 'default'
                }
            ]
        },
        {
            path: 'report',
            children: [
                {
                    data: {
                        id: 54
                    },
                    canActivate: [AuthGuard],
                    path: 'gl',
                    component: GeneralLedgerComponent
                },
                {
                    data: {
                        id: 55
                    },
                    canActivate: [AuthGuard],
                    path: 'gl-summary',
                    component: GlSummaryComponent
                },
                {
                    data: {
                        id: 85
                    },
                    canActivate: [AuthGuard],
                    path: 'tb',
                    component: TrialBalanceComponent
                },
                {
                    data: {
                        id: 211
                    },
                    canActivate: [AuthGuard],
                    path: 'tb-summary',
                    component: TrialBalanceSummaryComponent
                },
                {
                    data: {
                        id: 106
                    },
                    canActivate: [AuthGuard],
                    path: 'inv-aging',
                    component: InvAgingComponent
                },
                {
                    data: {
                        id: 213
                    },
                    canActivate: [AuthGuard],
                    path: 'inv-aging-summary',
                    component: InvAgingSummaryComponent
                },
                {
                    data: {
                        id: 214
                    },
                    canActivate: [AuthGuard],
                    path: 'inv-aging-ar',
                    component: InvAgingArComponent
                },
                {
                    data: {
                        id: 215
                    },
                    canActivate: [AuthGuard],
                    path: 'inv-aging-ar-summary',
                    component: InvAgingArSummaryComponent
                },
                {
                    data: {
                        id: 110
                    },
                    canActivate: [AuthGuard],
                    path: 'list-p3',
                    component: ListP3Component
                },
                {
                    data: {
                        id: 126
                    },
                    canActivate: [AuthGuard],
                    path: 'balance_sheet',
                    component: BalanceSheetComponent
                },
                {
                    data: {
                        id: 127
                    },
                    canActivate: [AuthGuard],
                    path: 'profit_loss',
                    component: ProfitLossComponent
                },
                {
                    data: {
                        id: 136
                    },
                    canActivate: [AuthGuard],
                    path: 'list_je',
                    component: ListJeComponent
                },
                {
                    path: '**',
                    redirectTo: 'default'
                }
            ]
        },
        {
            data: {
                id: 57
            },
            canActivate: [AuthGuard],
            path: 'periode-end',
            component: PeriodeEndComponent
        },
        {
            data: {
                id: 109
            },
            canActivate: [AuthGuard],
            path: 'sp3',
            component: Sp3ManualComponent
        },
        {
            path: '**',
            redirectTo: '/error/404'
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountingRoutingModule { }

export const RoutableAccounting = [
    InvoiceComponent,
    InvoiceDPComponent,
    InvoiceMiscellaneousComponent,
    OsPostingGiComponent,
    JournalEntryComponent,
    GeneralLedgerComponent,
    AssetComponent,
    AssetTypeComponent,
    PeriodeEndComponent,
    Sp3ManualComponent,
    GlSummaryComponent,
    PaymentRequestComponent,
    SalesInvComponent,
    SalesInvDpComponent,
    TrialBalanceComponent,
    TrialBalanceSummaryComponent,
    InvAgingComponent,
    InvAgingSummaryComponent,
    InvAgingArComponent,
    InvAgingArSummaryComponent,
    ListP3Component,
    BankPaymentComponent,
    BankReceiveComponent,
    BalanceSheetComponent,
    ProfitLossComponent,
    ListJeComponent,
    SalesInvMiscComponent,
    DebitNoteComponent
];

export const EntryAccounting = [

    InvoiceFormDialogComponent,
    PrintFormDialogComponent,
    InvoiceDPFormDialogComponent,
    InvoiceDPPrintDialogComponent,
    InvoiceMiscellaneousFormDialogComponent,
    InvoiceMiscellaneousPrintDialogComponent,
    PostingGIFormDialogComponent,
    JournalFormDialogComponent,
    ImportJVDialogComponent,
    GLDetailDialogComponent,
    GLDetailPrintDialogComponent,
    AssetFormDialogComponent,
    AssetTypeFormDialogComponent,
    PeriodeEndFormDialogComponent,
    SP3FormDialogComponent,
    SP3JournalFormDialogComponent,
    GLSummaryDetailDialogComponent,
    PaymentRequestFormDialogComponent,
    PaymentRequestPrintDialogComponent,
    TBDetailDialogComponent,
    TBPrintDialogComponent,
    TBSummaryDialogComponent,
    TBSummaryPrintDialogComponent,
    BankPaymentDialogFormComponent,
    BankPaymentDialogPrintComponent,
    PengeluaranDialogPrintComponent,
    BankReceiveDialogFormComponent,
    BankReceiveDialogPrintComponent,
    PenerimaanDialogPrintComponent,
    SalesInvoiceFormDialogComponent,
    SalesDpDialogFormComponent,
    SalesDpDialogPrintComponent,
    SalesDialogPrintComponent,
    SalesMiscDialogPrintComponent,
    SalesMiscDialogFormComponent,
    PrintInvAgingDialogComponent,
    PrintInvAgingSummaryDialogComponent,
    DebitNoteFormDialogComponent,
    DNPrintFormDialogComponent
];
