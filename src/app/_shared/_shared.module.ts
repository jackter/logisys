import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyComponent } from './ac/company/company.component';
import { SharedModule } from '../../fuse/shared.module';

@NgModule({
	imports: [
        CommonModule,
        SharedModule
    ]
})
export class SharedCommModule {}

export const CommShared = [
    CompanyComponent
];
export const EntryShared = [

];