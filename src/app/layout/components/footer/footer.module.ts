import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatIconModule, MatToolbarModule } from '@angular/material';

import { SharedModule } from 'fuse/shared.module';

import { FooterComponent } from 'app/layout/components/footer/footer.component';

@NgModule({
    declarations: [
        FooterComponent
    ],
    imports     : [
        RouterModule,

        MatButtonModule,
        MatIconModule,
        MatToolbarModule,

        SharedModule
    ],
    exports     : [
        FooterComponent
    ]
})
export class FooterModule
{
}
