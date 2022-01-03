import { Component, OnInit, HostListener } from '@angular/core';

import { FuseConfigService } from 'fuse/services/config.service';
import { fuseAnimations } from 'fuse/animations';
import { fuseConfig } from 'app/config';
import { LocalStorageService } from 'angular-2-local-storage';
import { Core } from '../../../providers/core';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector   : 'fuse-lock',
    templateUrl: './lock.component.html',
    styleUrls  : ['./lock.component.scss'],
    animations : fuseAnimations
})
export class FuseLockComponent implements OnInit
{

    readonly fuseConfig = fuseConfig;
    Profil: any;

    password;

    constructor(
        private LS: LocalStorageService,
        private core: Core,
        private broadcast: BroadcasterService
    )
    {
        /*this.fuseConfig.setConfig({
            layout: {
                navigation: 'none',
                toolbar   : 'none',
                footer    : 'none'
            }
        });*/

        this.Profil = this.LS.get('Profil');

    }

    ngOnInit(){
        
    }

    @HostListener('mousemove', ['$event']) 
    onMouseMove(e) {
        this.goFocus();
    }
    @HostListener('click', ['$event']) 
    onClick(e) {
        this.goFocus();
    }
    @HostListener('focus', ['$event']) 
    onFocus(e) {
        this.goFocus();
    }

    goFocus(){
        if(!$('#lock-password').is(':focus')){
            $('#lock-password').focus();
        }
    }

    /**
     * Login
     */
    Busy;
    Login(){

        var Params = {
            username: this.Profil.uname,
            password: this.password,
            NoLoader: 1
        }

        this.Busy = true;

        this.core.Do('login', Params).subscribe(
            result => {
                
                if(result.status == 1){
                    //=> Create State
                    this.LS.set('state', result.config);
                    this.LS.set('Profil', result.profil);

                    this.LS.remove('nostate');

                    this.password = '';

                    $('#lockscreen').fadeOut();

                    this.broadcast.broadcast('login', {});

                    this.core.WatchIdle();
                }else{

                    var Alert = {
                        type: 'error',
                        msg: result.error_msg
                    }
                    this.core.OpenAlert(Alert);

                }

                this.Busy = false;

            },
            error => {
                console.error(error);
                this.core.OpenNotif(error);

                this.Busy = false;
            }
        );

    }
    //=> / END : Login

}
