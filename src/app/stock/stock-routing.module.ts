import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemComponent } from './item/item.component';
import { ItemFormDialogComponent } from './item/dialog/form';

import { LocationComponent } from './location/location.component';
import { LocationFormDialogComponent } from './location/dialog/form';
import { InitialComponent } from './initial/initial.component';
import { InitialFormDialogComponent } from './initial/dialog/form';

import { ReportItemComponent } from './report/report-item/report-item.component';
import { AuthGuard } from 'app/auth.guard';
import { TakingComponent } from './taking/taking.component';
import { TakingFormDialogComponent } from './taking/dialog/form';
// import { ReportItemDetailDialogComponent } from './report/report-item/dialog/detail';
import { ItemFormAkunDialogComponent } from './item/dialog/form_akun';
import { AdjustmentComponent } from './adjustment/adjustment.component';
import { AdjustmentFormComponent } from './adjustment/dialog/form';
import { SuspendFormDialogComponent } from './item/dialog/suspend';
import { KartuStockComponent } from './report/kartu-stock/kartu-stock.component';
import { PengeluaranBarangComponent } from './report/pengeluaran-barang/pengeluaran-barang.component';
import { ReportInventoryTbComponent } from './report/report-inventory-tb/report-inventory-tb.component';
import { PengembalianBarangComponent } from './report/pengembalian-barang/pengembalian-barang.component';
import { StockSummaryComponent } from './report/stock-summary/stock-summary.component';
import { ItemAllComponent } from './report/item-all/item-all.component';
import { SoundingComponent } from './sounding/sounding.component';
import { SoundingFormDialogComponent } from './sounding/dialog/form';
import { OilMovementComponent } from './report/oil-movement/oil-movement.component';
import { ReportOilMovementDetailDialogComponent } from './report/oil-movement/dialog/form';
import { SoundingPrintFormDialogComponent } from './sounding/dialog/print';
import { NettoSummaryComponent } from './netto-summary/netto-summary.component';
import { NettoSummaryFormComponent } from './netto-summary/dialog/form';
import { ItemFormAkunSalesDialogComponent } from './item/dialog/form_akun_sales';
import { StockAdjustmentComponent } from './report/stock-adjustment/stock-adjustment.component';
import { StockAdjPrintDialogComponent } from './adjustment/dialog/print';

const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 24
            },
            canActivate: [AuthGuard],
            path: 'item',
            component: ItemComponent
        },
        {
            data: {
                id: 25
            },
            canActivate: [AuthGuard],
            path: 'location',
            component: LocationComponent
        },
        {
            data: {
                id: 26
            },
            canActivate: [AuthGuard],
            path: 'initial',
            component: InitialComponent
        },
        {
            data: {
                id: 38
            },
            canActivate: [AuthGuard],
            path: 'stock_taking',
            component: TakingComponent
        },
        {
            data: {
                id: 66
            },
            canActivate: [AuthGuard],
            path: 'adjustment',
            component: AdjustmentComponent
        },
        {
            data: {
                id: 123
            },
            canActivate: [AuthGuard],
            path: 'sounding',
            component: SoundingComponent
        },
        {
            data: {
                id: 189
            },
            canActivate: [AuthGuard],
            path: 'netto_summary',
            component: NettoSummaryComponent
        },
        {
            path: 'report',
            children: [
                {
                    data: {
                        id: 34
                    },
                    canActivate: [AuthGuard],
                    path: 'item',
                    component: ReportItemComponent
                },
                {
                    data: {
                        id: 34
                    },
                    canActivate: [AuthGuard],
                    path: 'item_all',
                    component: ItemAllComponent
                },
                {
                    data: {
                        id: 87
                    },
                    canActivate: [AuthGuard],
                    path: 'kartu_stok',
                    component: KartuStockComponent
                },
                {
                    data: {
                        id: 88
                    },
                    canActivate: [AuthGuard],
                    path: 'goods_issued_list',
                    component: PengeluaranBarangComponent
                },
                {
                    data: {
                        id: 89
                    },
                    canActivate: [AuthGuard],
                    path: 'inventory_tb',
                    component: ReportInventoryTbComponent
                },
                {
                    data: {
                        id: 90
                    },
                    canActivate: [AuthGuard],
                    path: 'return_gi',
                    component: PengembalianBarangComponent
                },
                {
                    data: {
                        id: 98
                    },
                    canActivate: [AuthGuard],
                    path: 'stock_summary',
                    component: StockSummaryComponent
                },
                {
                    data: {
                        id: 212
                    },
                    canActivate: [AuthGuard],
                    path: 'stock_adj',
                    component: StockAdjustmentComponent
                },
                {
                    data: {
                        id: 184
                    },
                    canActivate: [AuthGuard],
                    path: 'oil_movement',
                    component: OilMovementComponent
                }
            ]
        },
        {
            path: '**',
            redirectTo: 'item'
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StockRoutingModule { }

export const RoutableStock = [
    ItemComponent,
    LocationComponent,
    InitialComponent,
    TakingComponent,
    AdjustmentComponent,

    ReportItemComponent,

    KartuStockComponent,
    PengeluaranBarangComponent,
    ReportInventoryTbComponent,
    PengembalianBarangComponent,
    StockSummaryComponent,
    ItemAllComponent,
    SoundingComponent,
    OilMovementComponent,
    NettoSummaryComponent,
    StockAdjustmentComponent
];

export const DialogStock = [
    ItemFormDialogComponent,
    LocationFormDialogComponent,
    InitialFormDialogComponent,
    TakingFormDialogComponent,
    AdjustmentFormComponent,

    // ReportItemDetailDialogComponent,

    ItemFormAkunDialogComponent,
    ItemFormAkunSalesDialogComponent,

    SuspendFormDialogComponent,
    SoundingFormDialogComponent,
    SoundingPrintFormDialogComponent,
    ReportOilMovementDetailDialogComponent,
    NettoSummaryFormComponent,
    StockAdjPrintDialogComponent
];
