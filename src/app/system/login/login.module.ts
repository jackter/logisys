import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { LoginComponent } from './login.component';
import { SharedModule } from '../../../fuse/shared.module';

const routes = [
    {
        path     : 'pages/auth/login-2',
        component: LoginComponent
    }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        SharedModule,

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
    ]
})

export class LoginModule
{

}
