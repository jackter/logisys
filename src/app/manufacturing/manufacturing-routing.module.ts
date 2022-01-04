import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './../auth.guard';

import { BomComponent } from './bom/bom.component';
import { BomFormDialogComponent } from './bom/dialog/form';
import { TransferRequestComponent } from './transfer-request/transfer-request.component';
import { TransferRequestFormDialogComponent } from './transfer-request/dialog/form';
import { TransferDeliveryRequestComponent } from './transfer-request/deliver/list';
import { DeliverRequestFormDialogComponent } from './transfer-request/deliver/dialog/form';
import { FinishGoodsComponent } from './finish-goods/finish-goods.component';
import { ProduksiParamsComponent } from './produksi-params/produksi-params.component';
import { PPFormDialogComponent } from './produksi-params/dialog/form';
import { FinishGoodsFormDialogComponent2 } from './finish-goods/dialog/form';
import { OipComponent } from './oip/oip.component';
import { OipFormDialogComponent } from './oip/dialog/form';
import { JoControlComponent } from './report/jo-control/jo-control.component';
import { MaterialMoveComponent } from './report/material-move/material-move.component';
import { InvControlComponent } from './report/inv-control/inv-control.component';
import { AcComponent } from './report/ac/ac.component';
import { ReportACDetailDialogComponent } from './report/ac/dialog/detail';
import { ItemComponent } from './report/item/item.component';
import { MaterialReturnComponent } from './material-return/material-return.component';
import { MaterialReturnFormDialogComponent } from './material-return/dialog/form';
// import { ReportItemDetailDialogComponent } from 'app/stock/report/report-item/dialog/detail';

import { ActualProduction2Component } from './actual-production2/actual-production2.component';
import { AP2DetailFormDialogComponent } from './actual-production2/detail/dialog/form';
import { ActualProduction2DetailComponent } from './actual-production2/detail/detail';
import { MaterialReturnReceiveComponent } from './material-return-receive/material-return-receive.component';
import { MaterialReturnReceiveFormDialogComponent } from './material-return-receive/dialog/form';

import { JO2Component } from './jo2/jo2.component';
import { JO2FormDialogComponent } from './jo2/dialog/form';
import { JO2PrintDialogComponent } from './jo2/dialog/print';

import { TransferRequest2Component } from './transfer-request2/transfer-request2.component';
import { TransferRequest2DeliveryComponent } from './transfer-request2/dist/list';
// import { TransferRequest2DialogFormComponent } from './transfer-request2/dialog/form';
// import { DeliverRequest2DialogFormComponent } from './transfer-request2/deliver/dialog/form';
import { TrRequestComponent } from './transfer-request2/inc/inc.request';
import { TrDeliveryComponent } from './transfer-request2/inc/inc.delivery';
import { TrRequestFormComponent } from './transfer-request2/dialog/form.request';
import { TrIssuedFormComponent } from './transfer-request2/dialog/form.issued';
import { SummaryDialogComponent } from './actual-production2/detail/dialog/summary';

import { Fg2Component } from './fg2/fg2.component';
import { MRPDialogPrintComponent } from './transfer-request2/dialog/print.request';
import { GIPDialogPrintComponent } from './transfer-request2/dialog/print.issued';
import { FinishGoods2DetailComponent } from './fg2/detail/detail';
import { FinishGoods2FormDialogComponent } from './fg2/detail/dialog/form';

const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 59
            },
            canActivate: [AuthGuard],
            path: 'bom',
            component: BomComponent

        },
        {
            data: {
                id: 193
            },
            canActivate: [AuthGuard],
            path: 'jo2',
            component: JO2Component
        },
        {
            data: {
                id: 187
            },
            canActivate: [AuthGuard],
            path: 'actual_production2',
            children: [
                {
                    path: '',
                    component: ActualProduction2Component
                },
                {
                    path: 'detail/:id',
                    component: ActualProduction2DetailComponent
                }
            ]
        },
        {
            data: {
                id: 64
            },
            canActivate: [AuthGuard],
            path: 'transfer_request',
            children: [
                {
                    path: '',
                    component: TransferRequestComponent
                },
                {
                    path: 'deliver/:id',
                    component: TransferDeliveryRequestComponent
                }
            ]
        },
        {
            data: {
                id: 195
            },
            canActivate: [AuthGuard],
            path: 'transfer_request2',
            children: [
                {
                    path: '',
                    component: TransferRequest2Component
                },
                {
                    path: 'deliver/:id',
                    component: TransferRequest2DeliveryComponent
                }
            ]
        },
        // {
        //     data: {
        //         id: 65
        //     },
        //     canActivate: [AuthGuard],
        //     path: 'transfer_finish_goods',
        //     children: [
        //         {
        //             path: '',
        //             component: FinishGoodsComponent
        //         },
        //         {
        //             path: 'receive/:id',
        //             component : FGDetailComponent
        //         }
        //     ]

        // },
        {
            data: {
                id: 201
            },
            canActivate: [AuthGuard],
            path: 'transfer_finish_goods2',
            children: [
                {
                    path: '',
                    component: Fg2Component
                },
                {
                    path: 'transfer/:id',
                    component : FinishGoods2DetailComponent
                }
            ]

        },
        {
            data: {
                id: 108
            },
            canActivate: [AuthGuard],
            path: 'production_params',
            component: ProduksiParamsComponent

        },
        {
            data: {
                id: 112
            },
            canActivate: [AuthGuard],
            path: 'oip',
            component: OipComponent
        },
        {
            data: {
                id: 126
            },
            canActivate: [AuthGuard],
            path: 'material_return_deliver',
            component: MaterialReturnComponent
        },
        {
            data: {
                id: 191
            },
            canActivate: [AuthGuard],
            path: 'material_return_receive',
            component: MaterialReturnReceiveComponent
        },
        {
            path: 'report',
            children: [
                {
                    data: {
                        id: 113
                    },
                    canActivate: [AuthGuard],
                    path: 'jo-control',
                    component: JoControlComponent

                },
                {
                    data: {
                        id: 114
                    },
                    canActivate: [AuthGuard],
                    path: 'material-movement',
                    component: MaterialMoveComponent

                },
                {
                    data: {
                        id: 115
                    },
                    canActivate: [AuthGuard],
                    path: 'inventory-control',
                    component: InvControlComponent

                },
                {
                    data: {
                        id: 119
                    },
                    canActivate: [AuthGuard],
                    path: 'actual-consumtion',
                    component: AcComponent
                },
                {
                    data: {
                        id: 124
                    },
                    canActivate: [AuthGuard],
                    path: 'item',
                    component: ItemComponent
                }
            ]
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
export class ManufacturingRoutingModule { }

export const RoutableManufacturing = [
    BomComponent,
    TransferRequestComponent,
    TransferDeliveryRequestComponent,
    FinishGoodsComponent,
    ProduksiParamsComponent,
    Fg2Component,
    FinishGoods2DetailComponent,
    OipComponent,
    JoControlComponent,
    MaterialMoveComponent,
    InvControlComponent,
    AcComponent,
    ItemComponent,
    MaterialReturnComponent,
    MaterialReturnReceiveComponent,

    ActualProduction2Component,
    ActualProduction2DetailComponent,
    JO2Component,
    TransferRequest2Component,
    TransferRequest2DeliveryComponent
];

export const EntryManufacturing = [
    BomFormDialogComponent,
    TransferRequestFormDialogComponent,
    DeliverRequestFormDialogComponent,
    PPFormDialogComponent,
    FinishGoodsFormDialogComponent2,
    OipFormDialogComponent,
    ReportACDetailDialogComponent,
    MaterialReturnFormDialogComponent,
    MaterialReturnReceiveFormDialogComponent,
    AP2DetailFormDialogComponent,
    SummaryDialogComponent,

    JO2FormDialogComponent,
    JO2PrintDialogComponent,

    /**
     * Material Transfer Request
     */
    TrRequestComponent,
    TrDeliveryComponent,
    TrRequestFormComponent,
    TrIssuedFormComponent,
    MRPDialogPrintComponent,
    GIPDialogPrintComponent,
    // => / END : Material Transfer Request

    FinishGoods2FormDialogComponent
];
