import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FuseDirectivesModule } from 'fuse/directives/directives';
import { FusePipesModule } from 'fuse/pipes/pipes.module';
import { MaterialModule } from './material.module';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { DpDatePickerModule } from 'ng2-date-picker';
import { QRCodeModule } from 'angular2-qrcode';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
    imports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        FuseDirectivesModule,
        FusePipesModule,

        MaterialModule,
        NgxDatatableModule,

        CurrencyMaskModule,
        DpDatePickerModule,

        QRCodeModule,

        DragDropModule,
        NgxMaskModule
    ],
    exports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        FuseDirectivesModule,
        FusePipesModule,

        MaterialModule,
        NgxDatatableModule,

        CurrencyMaskModule,
        DpDatePickerModule,

        QRCodeModule,

        DragDropModule,
        NgxMaskModule
    ]
})
export class SharedModule
{
}
