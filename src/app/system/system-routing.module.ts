import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginModule } from './login/login.module';
import { LoginComponent } from './login/login.component';
import { CpassComponent } from './cpass/cpass.component';
import { UserComponent } from './user/user.component';
import { PermComponent } from './perm/perm.component';
import { UserDialogComponent } from './user/dialog/form';
import { PermDialogComponent } from './perm/dialog/form';
import { PermListDialogComponent } from './perm/dialog/permissions';
import { AuthGuard } from 'app/auth.guard';

const routes: Routes = [{
    path: '',
    children: [
        {
            path: 'login',
            component: LoginComponent
        },
        {
            path: 'cpass',
            component: CpassComponent
        },
        {
            data: {
                id: 13
            },
            canActivate: [AuthGuard],
            path: 'user',
            component: UserComponent
        },
        {
            data: {
                id: 12
            },
            canActivate: [AuthGuard],
            path: 'permission',
            component: PermComponent
        },
        {
            path: '**',
            redirectTo: '/error/404'
        }
    ]
}];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        LoginModule
    ],
  exports: [RouterModule]
})
export class SystemRoutingModule { }

export const RoutableSystem = [
    CpassComponent,
    UserComponent,
    UserDialogComponent,
    
    PermComponent,
    PermDialogComponent,
    PermListDialogComponent
];
