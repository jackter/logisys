import { Component, ViewEncapsulation } from '@angular/core';
import { Core } from 'providers/core';
import { SocketService } from 'providers/socket';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { BroadcasterService } from 'ng-broadcaster';
import { FuseSidebarService } from 'fuse/components/sidebar/sidebar.service';

@Component({
    selector     : 'quick-panel',
    templateUrl  : './quick-panel.component.html',
    styleUrls    : ['./quick-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuickPanelComponent {
    date: Date;
    events: any[];
    notes: any[];
    settings: any;

    /**
     * Constructor
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private core: Core,
        private socket: SocketService,
        private LS: LocalStorageService,
        private router: Router,
        private broadcast: BroadcasterService
    ){
        // Set the defaults
        this.date = new Date();
        this.settings = {
            notify: true,
            cloud : false,
            retro : true
        };

        /*socket.onGet().subscribe((data: any) => {
            this.onNotif();
        });*/

    }

    ngOnInit(){

        this.broadcast.on('notify').subscribe(
            result => {
                this.Notif = result;
            }
        );

        //this.LS.remove('NOTIF');

        //this.onNotif(); 
    }

    /**
     * Notif
     */
    Notif: any;
    /*onNotif(){

        setTimeout(() => {

            var Notif = JSON.parse(this.LS.get('NOTIF'));

            if(Notif){
                this.Notif = Notif;
            }else{
                this.core.Do('e/notification', { NoLoader: 1 }).subscribe(
                    result => {
                        if(result.notif){
                            this.Notif = result.notif;
                        }
                    },
                    error => {
                        console.error('QuickPanel Init Notif', error);
                    }
                );
            }

        }, 1000)

    }*/
    //=> / END : Notif

    /**
     * Open
     */
    Open(item){

        if(item.url){

            this._fuseSidebarService.getSidebar('quickPanel').toggleOpen();

            this.core.ShowLoader();

            /**
             * Set Read
             */
            if(item.seen == 0){
                var Read = {
                    id: item.id,
                    notif_action: 'read'
                }
                this.core.Do('e/notification', Read).subscribe(
                    result => {
                        //this.Notif = result.notif;
                        item.seen = 1;
                        this.Notif.unread = Number(this.Notif.unread) - 1;
                        this.broadcast.broadcast('updateNotif', result.notif);

                    }
                );
            }
            //=> / END : Set Read

            setTimeout(() => {

                if(item.url != this.router.url){
                    this.router.navigate([item.url]);
                    this.core.Sharing(item);
                }else{
                    this.broadcast.broadcast('open', item);
                }
            }, 250);

        }

        console.log(item);

    }
    //=> / END : Open
}
