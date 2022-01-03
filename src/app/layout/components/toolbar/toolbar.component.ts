import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseConfigService } from 'fuse/services/config.service';
import { FuseSidebarService } from 'fuse/components/sidebar/sidebar.service';

import { navigation } from 'app/navigation/navigation';
import { FuseLoadingBarService } from 'fuse/services/loading-bar.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { Core } from '../../../../providers/core';

import { environment } from 'environments/environment';
import { SocketService } from 'providers/socket';
import { Howl } from 'howler';
import { ToastrService } from 'ngx-toastr';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector   : 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls  : ['./toolbar.component.scss'],
})

export class ToolbarComponent implements OnInit, OnDestroy
{

    Default: any;
    fuseConfig: any;

    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    showLoadingBar: boolean;
    userStatusOptions: any[];
    chatPanelLockedOpen: string;

    public versionDate: string = environment.VERSIONDATE;
    public version: string = environment.VERSION;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseLoadingBarService} _fuseLoadingBarService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseLoadingBarService: FuseLoadingBarService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private core: Core,
        private LS: LocalStorageService,
        private router: Router,
        private socket: SocketService,
        private toastr: ToastrService,
        private broadcast: BroadcasterService
    )
    {
        // Set the defaults
        this.userStatusOptions = [
            {
                'title': 'Online',
                'icon' : 'icon-checkbox-marked-circle',
                'color': '#4CAF50'
            },
            {
                'title': 'Away',
                'icon' : 'icon-clock',
                'color': '#FFC107'
            },
            {
                'title': 'Do not Disturb',
                'icon' : 'icon-minus-circle',
                'color': '#F44336'
            },
            {
                'title': 'Invisible',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#BDBDBD'
            },
            {
                'title': 'Offline',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#616161'
            }
        ];

        this.languages = [
            {
                id   : 'en',
                title: 'English',
                flag : 'us'
            },
            {
                id   : 'tr',
                title: 'Turkish',
                flag : 'tr'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    WindowFocus = 1;
    ngOnInit(): void
    {
        // Subscribe to the Fuse loading bar service
        this._fuseLoadingBarService.visible
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((visible) => {
                this.showLoadingBar = visible;
            });

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;

                this.fuseConfig = settings;
            });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, {'id': this._translateService.currentLang});

        /**
         * Socket
         */
        this.socket.onGet()
        	.subscribe((data: any) => {
        		this.Notification();
        	});
        //=> / END : Socket

        //=> CHECK WINDOW / TAB
        $(window)
        .focus(() => {
            this.WindowFocus = 1;
        })
        .blur(() => {
            this.WindowFocus = 0;
        });

        setTimeout(() => {
            if(!this.WindowFocus){
                this.WindowFocus = 0;
            }
        }, 5000);
        //=> / CHECK WINDOW / TAB

    }

    ngAfterViewInit() {
        this.LoadDefault();

        this.broadcast.on('updateNotif').subscribe(
            result => {
                this.Notif = result;
            }
        );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

    toggleChatPanel(): void
    {
        // Get the chat panel sidebar
        const chatPanelSidebar = this._fuseSidebarService.getSidebar('chatPanel');

        // Store the original value
        if ( chatPanelSidebar.lockedOpen !== '' )
        {
            this.chatPanelLockedOpen = chatPanelSidebar.lockedOpen;
        }

        // Toggle
        if ( chatPanelSidebar.lockedOpen === this.chatPanelLockedOpen )
        {
            chatPanelSidebar.lockedOpen = '';
        }
        else
        {
            chatPanelSidebar.lockedOpen = this.chatPanelLockedOpen;
        }
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void
    {
        // Do your search here...
        console.log(value);
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void
    {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    Logout(){

        this.broadcast.broadcast('logout', {});

        this.LS.remove('prev');

        this.LS.remove('state');
        this.router.navigate(['/system/login']);
    }

    GoCpass(){
        this.router.navigate(['/system/cpass']);
    }

    LoadDefault(){
        //=> Get From Server
        var Params = {

        }
        this.core.Do('e/default', Params).subscribe(
            result => {
                if(result){
                    this.Default = result;
                    this.Notification();
                }
            },
            error => {
                console.error('Toolbar Load Default', error);
            }
        );
    }

    /**
     * Notification
     */
    Notif: any;
    Notification(){
        var Params = { 
            NoLoader: 1
        }
        this.core.Do('e/notification', Params).subscribe(
            result => {
                if(result.notif){
                    this.Notif = result.notif;

                    var CheckNotif = this.core.FJSON2(this.Notif, 'pushed', 0);

                    var IDs = [];
                    if(Object.keys(CheckNotif).length > 0){

                        var Sound = new Howl({
                            src: [
                                '~/assets/sounds/arpeggio.mp3'
                            ],
                            autoplay: true,
                            loop: false,
                            html5 :true
                        });
                        Sound.play();

                        /**
                         * Show Loop
                         */
                        for(let item of CheckNotif){
                            this.toastr.info(
                                item.content,
                                item.title,
                                {
                                    enableHtml: true,
                                    progressBar: true
                                }
                            );

                            IDs.push(item.id);
                        }
                        //=> / END : Show Loop

                        /**
                         * Set Pushed
                         */
                        var Pushing = {
                            id: JSON.stringify(IDs),
                            notif_action: 'push'
                        }
                        this.core.Do('e/notification', Pushing).subscribe(
                            result => {
                                this.Notif = result.notif;
                            }
                        );
                        //=> / END : Set Pushed

                        //=> Window Not Focus using alert
                        if(this.WindowFocus != 1){
                            setTimeout(() => {
                                alert("New Notification Arrived!");
                            }, 1000);
                        }
                        //=> / Window Not Focus using alert

                    }

                    //this.core.Sharing(result.notif);
                    //this.LS.set('NOTIF', JSON.stringify(this.Notif));
                    //this.broadcast.Data(this.Notif, 'notif');
                    this.broadcast.broadcast('notify', this.Notif);

                }

            },
            error => {
                console.error('Notif Toolbar Load Default', error);
            }
        );
    }
    //=> / END : Notification
}
