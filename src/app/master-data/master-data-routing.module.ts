import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/auth.guard';

import { SupplierComponent } from './supplier/supplier.component';
import { SupplierFormDialogComponent } from './supplier/dialog/form';

import { TaxComponent } from './tax/tax.component';
import { TaxDialogFormComponent } from './tax/dialog/form';

import { CompanyComponent } from './company/company.component';
import { CompanyDialogFormComponent } from './company/dialog/form';

import { DeptComponent } from './dept/dept.component';
import { DeptDialogFormComponent } from './dept/dialog/form';

import { CostumerComponent } from './costumer/costumer.component';
import { CostumerFormDialogComponent } from './costumer/dialog/form';

import { BankComponent } from './bank/bank.component';
import { BankDialogFormComponent } from './bank/dialog/form';

import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { ExchangeRateDetailDialogComponent } from './exchange-rate/dialog/detail';
import { ExchangeRateDialogComponent } from './exchange-rate/dialog/form';

import { CoaComponent } from './coa/coa.component';
import { COAFormDialogComponent } from './coa/dialog/form';

import { TrxCoaBalComponent } from './trx-coa-bal/trx-coa-bal.component';
import { TrxBalFormDialogComponent } from './trx-coa-bal/dialog/form';

import { IgaComponent } from './iga/iga.component';
import { IGAFormDialogComponent } from './iga/dialog/form';

import { CostCenterComponent } from './cost-center/cost-center.component';
import { CostCenterDialogFormComponent } from './cost-center/dialog/form';

import { VehicleComponent } from './vehicle/vehicle.component';
import { VehicleFormDialogComponent } from './vehicle/dialog/form';

import { KontraktorComponent } from './kontraktor/kontraktor.component';
import { KontraktorFormDialogComponent } from './kontraktor/dialog/form';
import { SupplierFormAkunDialogComponent } from './supplier/dialog/form_akun';
import { KontraktorFormAkunDialogComponent } from './kontraktor/dialog/form_akun';

import { ActivityLocationComponent } from './activity-location/activity-location.component';
import { ActivityLocationDetailComponent } from './activity-location/detail/detail';
import { ActivityLocationDetailFormDialogComponent } from './activity-location/detail/dialog/form';
import { EquipmentComponent } from './equipment/equipment.component';
import { EquipmentFormDialogComponent } from './equipment/dialog/form';
import { JobAlocationComponent } from './job-alocation/job-alocation.component';
import { JobAlocationDetailComponent } from './job-alocation/detail/detail';
import { JobAlocationFormDialogComponent } from './job-alocation/detail/dialog/form';
import { AllJobAlocationDetailComponent } from './job-alocation/detail/print';
import { CustomerFormAkunDialogComponent } from './costumer/dialog/form_akun';
import { LokasiComponent } from './lokasi/lokasi.component';
import { LokasiDialogFormComponent } from './lokasi/dialog/form';
import { TransporterComponent } from './transporter/transporter.component';
import { TransporterFormDialogComponent } from './transporter/dialog/form';
import { TransporterFormAkunDialogComponent } from './transporter/dialog/form_akun';

const routes: Routes = [{
    path: '',
    children: [
        {
            data: {
                id: 42
            },
            canActivate: [AuthGuard],
            path: 'supplier',
            component: SupplierComponent
        },
        {
            data: {
                id: 206
            },
            canActivate: [AuthGuard],
            path: 'transporter',
            component: TransporterComponent
        },
        {
            data: {
                id: 49
            },
            canActivate: [AuthGuard],
            path: 'company',
            component: CompanyComponent
        },
        {
            data: {
                id: 84
            },
            canActivate: [AuthGuard],
            path: 'dept',
            component: DeptComponent
        },
        {
            data: {
                id: 48
            },
            canActivate: [AuthGuard],
            path: 'tax',
            component: TaxComponent
        },
        {
            data: {
                id: 71
            },
            canActivate: [AuthGuard],
            path: 'costumer',
            component: CostumerComponent
        },
        {
            data: {
                id: 80
            },
            canActivate: [AuthGuard],
            path: 'bank',
            component: BankComponent
        },
        {
            data: {
                id: 81
            },
            canActivate: [AuthGuard],
            path: 'exchangerate',
            component: ExchangeRateComponent
        },
        {
            data: {
                id: 86
            },
            canActivate: [AuthGuard],
            path: 'coa',
            component: CoaComponent
        },
        {
            data: {
                id: 111
            },
            canActivate: [AuthGuard],
            path: 'trx_coa_bal',
            component: TrxCoaBalComponent
        },
        {
            data: {
                id: 131
            },
            canActivate: [AuthGuard],
            path: 'iga',
            component: IgaComponent
        },
        {
            data: {
                id: 132
            },
            canActivate: [AuthGuard],
            path: 'alc',
            component: ActivityLocationComponent
        },
        {
            data: {
                id: 133
            },
            canActivate: [AuthGuard],
            path: 'cost_center',
            component: CostCenterComponent
        },
        {
            data: {
                id: 137
            },
            canActivate: [AuthGuard],
            path: 'vehicle',
            component: VehicleComponent
        },
        {
            data: {
                id: 185
            },
            canActivate: [AuthGuard],
            path: 'kontraktor',
            component: KontraktorComponent
        },
        {
            data: {
                id: 194
            },
            canActivate: [AuthGuard],
            path: 'equipment',
            component: EquipmentComponent
        },
        {
            data: {
                id: 196
            },
            canActivate: [AuthGuard],
            path: 'job_alocation',
            component: JobAlocationComponent
        },
        {
            data: {
                id: 202
            },
            canActivate: [AuthGuard],
            path: 'lokasi',
            component: LokasiComponent
        },
        {
            path: '**',
            redirectTo: 'supplier'
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MasterDataRoutingModule { }

export const RoutableMasterData = [
    SupplierComponent,
    KontraktorComponent,
    TaxComponent,
    CompanyComponent,
    DeptComponent,
    CostumerComponent,
    BankComponent,
    ExchangeRateComponent,
    CoaComponent,
    TrxCoaBalComponent,
    IgaComponent,
    CostCenterComponent,
    VehicleComponent,
    ActivityLocationComponent,
    ActivityLocationDetailComponent,
    EquipmentComponent,
    JobAlocationComponent,
    LokasiComponent,
    TransporterComponent
];

export const EntryMasterData = [
    SupplierFormDialogComponent,
    SupplierFormAkunDialogComponent,
    KontraktorFormDialogComponent,
    KontraktorFormAkunDialogComponent,
    TaxDialogFormComponent,
    BankDialogFormComponent,
    CompanyDialogFormComponent,
    DeptDialogFormComponent,
    CostumerFormDialogComponent,
    ExchangeRateDetailDialogComponent,
    ExchangeRateDialogComponent,
    COAFormDialogComponent,
    TrxBalFormDialogComponent,
    IGAFormDialogComponent,
    CostCenterDialogFormComponent,
    VehicleFormDialogComponent,
    ActivityLocationDetailFormDialogComponent,
    ActivityLocationDetailComponent,
    EquipmentFormDialogComponent,
    JobAlocationDetailComponent,
    JobAlocationFormDialogComponent,
    AllJobAlocationDetailComponent,
    CustomerFormAkunDialogComponent,
    LokasiDialogFormComponent,
    TransporterFormDialogComponent,
    TransporterFormAkunDialogComponent
];
