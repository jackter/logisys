import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from 'fuse/services/config.service';
import { FuseNavigationService } from 'fuse/components/navigation/navigation.service';
import { FuseSidebarService } from 'fuse/components/sidebar/sidebar.service';
import { FuseSplashScreenService } from 'fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from 'fuse/services/translation-loader.service';

import { navigation } from 'app/navigation/navigation';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationTurkish } from 'app/navigation/i18n/tr';
import { Core } from '../providers/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Router, NavigationEnd } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { BroadcasterService } from 'ng-broadcaster';
import { ChatAdapter } from 'ng-chat';
import { SocketIOAdapter } from '../providers/socket.chat.adapter';
import { SocketChatService } from 'providers/socket.chat';
import { Http } from '@angular/http';

@Component({
    selector   : 'app',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    navigation: any;
    fuseConfig: any;

    /****************************************************/
    //=> BEGIN Idle State
    idleState   = 'Not started';
    timedOut     = false;
    lastPing?: Date = null;
    //=> END Idle State
    /****************************************************/

    // Private
    private _unsubscribeAll: Subject<any>;

    Events: any = {};
    Delay;
    Profil: any = {};

    adapter;
    public TitleChat = 'NO USER ONLINE';
    // public adapter: ChatAdapter;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {FuseSplashScreenService} _fuseSplashScreenService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private core: Core,
        private idle: Idle,
        private keepalive: Keepalive,
        private LS: LocalStorageService,
        public router: Router,
        private broadcast: BroadcasterService,
        private socketChat: SocketChatService,
        private http: Http
    )
    {
        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['en', 'tr']);

        // Set the default language
        this._translateService.setDefaultLang('en');

        // Set the navigation translations
        this._fuseTranslationLoaderService.loadTranslations(navigationEnglish, navigationTurkish);

        // Use a language
        this._translateService.use('en');

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.LS.remove('nostate');

        /**
         * Subscribe Router Event
         */
       /* this.router.events.subscribe((route) => {

            if(route instanceof NavigationEnd){
                this.core.UOL(this.router.url);
            }

        });*/
        //=> / END : Subscribe Router Event

        /************************************************/
        //=> BEGIN Idle Statement
        //=> State
        var State = '';
        if(this.LS.get('state')){
            State = this.LS.get('state') + ";";
        }

        if(State){

            this.core.WatchIdle();

        }
        //=> END Idle Statement
        /************************************************/

        /**
         * Chat
         */
        var Profil: any = this.LS.get('Profil');
        this.Profil = Profil;
        this.core.InitSocketChat();
        // this.core.socketChat.InitializeSocketListerners();

        this.core.socketChat.on('connection', () => {
            var Profil: any = this.LS.get('Profil');
            if(Profil){
                this.Profil = Profil;

                this.core.socketChat.emit('join', Profil);    
            }
        });

        this.Events.onLogin = this.broadcast.on('login').subscribe(() => {
            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
                
                var Profil: any = this.LS.get('Profil');
                if(Profil){
                    this.Profil = Profil;

                    this.core.socketChat.emit('join', Profil);
                }

            }, 300);
        }); 

        this.Events.onLogout = this.broadcast.on('logout').subscribe(() => {
            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
                this.core.socketChat.emit('logout', this.Profil);
                console.log('logout');
                this.adapter = null;
            }, 300);
        }); 

        this.Events.friendsListChanged = this.broadcast.on('friendsListChanged').subscribe((usersCollection: any) => {
            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
                console.log('friendsListChanged', usersCollection.length);
                var Len = usersCollection.length-1;

                var Title = "NO USER ONLINE";
                if(Len > 0){
                    Title = 'USERS ONLINE (' + Len + ')';
                }
                $('#ng-chat-people .ng-chat-title span').html(Title);
                // this.TitleChat = 'NO USER ONLINE (' + usersCollection.length + ')';

            }, 300);
        }); 

        this.Events.ChatAdapter = this.broadcast.on('ChatAdapter').subscribe((adapter) => {
            clearTimeout(this.Delay);
            this.Delay = setTimeout(() => {
                if(this.LS.get('state')){
                    this.adapter = adapter;
                }
            }, 300);
        }); 

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        this.initIoConnection();

        this.Highchart();

        this.WatchUserOnline();
    }

    WatchUserOnline(){
        var Users = $('#ng-chat-users li');

        /**
         * Replace User Online
         */
        if($('#ng-chat-users').length > 0){
            var Title = "NO USER ONLINE";
            if(Users.length > 0){
                Title = 'USERS ONLINE (' + Users.length + ')';
            }

            $('#ng-chat-people .ng-chat-title span').html(Title);
        }
        //=> / END : Replace User Online
        setTimeout(() => {
            this.WatchUserOnline();
        }, 1000)
    }

    /**
     * Socket
     */
    initIoConnection(): void {
        this.core.InitSocket();
    }
    //=> / END : Socket

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        if(this.Events){
            for(let event of this.Events){
                event.unsubscribe();
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void
    {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Highchart
     */
    Highchart(){

        /**
         * Credit remover
         */
        var Ava = $('.highcharts-credits');
        if(Ava.length > 0){
            $(Ava).remove();
        }
        //=> / END : Credit remover

        setTimeout(() => {
            this.Highchart();
        }, 100);
    }
    //=> / END : Highchart
}
