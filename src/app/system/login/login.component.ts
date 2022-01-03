import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { LocalStorageService } from 'angular-2-local-storage';
import { fuseAnimations } from 'fuse/animations';
import { FuseConfigService } from 'fuse/services/config.service';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Core } from 'providers/core';
import { BroadcasterService } from 'ng-broadcaster';

@Component({
    selector   : 'login-2',
    templateUrl: './login.component.html',
    styleUrls  : ['./login.component.scss'],
    encapsulation : ViewEncapsulation.None,
    animations : fuseAnimations
})
export class LoginComponent implements OnInit
{
    loginForm: FormGroup;
    loginFormErrors: any;

    /****************************************************/
    //=> BEGIN Idle State
    idleState   = 'Not started';
    timedOut     = false;
    lastPing?: Date = null;
    //=> END Idle State
    /****************************************************/

    username;
    password;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private formBuilder: FormBuilder,
        private router: Router,
        private core: Core,
        private LS: LocalStorageService,
        private idle: Idle,
        private keepalive: Keepalive,
        private broadcast: BroadcasterService
    ){
        this.busy = false;

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar : {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer : {
                    hidden: true
                }
            }
        };

        this.loginFormErrors = {
            username   : {},
            password: {}
        };
    }

    ngOnInit(){
        var prev = this.LS.get('prev');
        if(!prev){
            prev = '/';
        }
        if(this.LS.get('state')){
            this.router.navigate([prev]);
            return false;
        }

        //=> Remove All Storages
        this.Remove();

        this.loginForm = this.formBuilder.group({
            username   : ['', Validators.required],
            password: ['', Validators.required]
        });

        this.loginForm.valueChanges.subscribe(() => {
            this.onLoginFormValuesChanged();
        });

        setTimeout(() => {
            $('input[name="username"]').focus();
        }, 1000);

        this.broadcast.broadcast('logout', {});
    }

    Remove(){
        this.LS.clearAll();
    }

    onLoginFormValuesChanged()
    {
        for ( const field in this.loginFormErrors )
        {
            if ( !this.loginFormErrors.hasOwnProperty(field) )
            {
                continue;
            }

            // Clear previous errors
            this.loginFormErrors[field] = {};

            // Get the control
            const control = this.loginForm.get(field);

            if ( control && control.dirty && !control.valid )
            {
                this.loginFormErrors[field] = control.errors;
            }
        }
    }

    busy;
    Login(){

        this.busy = true;

        var Params = {
            //username    :   this.loginForm.get('username').value,
            //password    :   this.loginForm.get('password').value
            username : this.username,
            password : this.password
        }

        var prev = this.LS.get('prev');
        if(!prev || prev == "/system/login"){
            prev = '/dashboard/default';
        }

        this.core.ShowLoader();

        this.core.Do('login', Params).subscribe(
            result => {

                if(result.status == 1){
                    
                    //=> Create State
                    this.LS.set('state', result.config);
                    this.LS.set('Profil', result.profil);
                    
                    /*if(prev == "/session/login"){
                        prev = "/beranda";
                    }*/

                    this.broadcast.broadcast('login', {});

                    this.router.navigate([prev]);
                    
                }else{

                    var Alert = {
                        type: 'error',
                        msg: result.error_msg
                    }
                    this.core.OpenAlert(Alert);

                    this.core.HideLoader();

                    this.busy = false;
                }

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

            },
            error => {
                console.log(error);
                this.busy = false;
            }
        );

    }
    
}
