import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule, MatIconModule, MAT_DATE_LOCALE } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from 'fuse/fuse.module';
import { SharedModule } from 'fuse/shared.module';
import { FuseSidebarModule, FuseThemeOptionsModule, FuseProgressBarModule } from 'fuse/components';

import { fuseConfig } from 'app/config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { AppRoutes, RoutableComponents, EntryComponents } from './app.routing';
import { Core } from '../providers/core'; 
import { LocalStorageModule } from 'angular-2-local-storage';

//=> Set Global
import * as $ from 'jquery';
import { HotkeyModule } from 'angular2-hotkeys';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { HttpModule } from '@angular/http';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { FuseLockComponent } from './system/lock/lock.component';

import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { BroadcasterService } from 'ng-broadcaster';
import { SocketService } from 'providers/socket';

import { NgxMaskModule } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';

import 'froala-editor/js/plugins.pkgd.min.js';
import { ChartModule } from 'angular-highcharts';
import { SocketChatService } from 'providers/socket.chat';
import { NgChatModule } from 'ng-chat';
import { SharedCommModule } from './_shared/_shared.module';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_AUTOCOMPLETE_DEFAULT_OPTIONS } from '@angular/material/autocomplete';

@NgModule({
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        HttpClientModule,
        RouterModule.forRoot(AppRoutes),

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        SharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        LayoutModule,

        // My Modules
        HotkeyModule.forRoot(),
        CurrencyMaskModule,
        LocalStorageModule.forRoot({
            prefix: 'Logisys',
            storageType: 'localStorage'
        }),

        NgIdleKeepaliveModule.forRoot(),
        AgGridModule.withComponents([]),
        NgxMaskModule.forRoot({}),

        ToastrModule.forRoot({
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true,
        }),
        ChartModule,
        NgChatModule,

        SharedCommModule
    ],
    declarations: [
        AppComponent,
        RoutableComponents,
        EntryComponents,
        FuseLockComponent
    ],
    entryComponents: [
        EntryComponents
    ],
    bootstrap   : [
        AppComponent
    ],
    providers: [
        Core,
        SocketService,
        SocketChatService,
        BroadcasterService,
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'id-ID'
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: false,
                panelClass: 'event-form-dialog'
            }
        },
        {
            provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
            useValue: {
                autoActiveFirstOption: true
            }
        }
    ]
})
export class AppModule {
}
