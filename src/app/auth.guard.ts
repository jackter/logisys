import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Core } from 'providers/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpParams } from '@angular/common/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { BroadcasterService } from 'ng-broadcaster';
import { timeout } from 'rxjs/internal/operators/timeout';
import { catchError } from 'rxjs/internal/operators/catchError';
import { retry } from 'rxjs/internal/operators/retry';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    // add the service we need
    constructor(
        private core: Core,
        private router: Router,
        private http: Http,
        private LS: LocalStorageService,
        private broadcast: BroadcasterService
    ) {}

	canActivate(
		next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable <boolean> | Promise < boolean > | boolean {

        var NoPermissions = {
            type: 'error',
            showConfirmButton: false,
            title: 'Permissions Denied!',
            msg: 'You can not open the page, please contact Administrator!'
        }

        var ID = next.data.id;
        var State = null;
        if(this.LS.get('state')){
            State = this.LS.get('state') + ";";
        }

        var isOpen: boolean;
        this.core.GetSharing().subscribe(
            result => {

                isOpen = false;
                if(result){
                    if(result.data){
                        isOpen = true;
                    }
                }

            }
        );

        if(State){

            var D = this.core.Separator();

            //var KUNCI_ASLI = params.d;
            var KUNCI_ASLI = D;
            KUNCI_ASLI = KUNCI_ASLI.toString();
            var KUNCI = KUNCI_ASLI.substr(0, 8);
            KUNCI = KUNCI + KUNCI_ASLI.substr(-8);

            var Params = {
                ses: ID
            }
            var params = JSON.parse(JSON.stringify(Params));

            Object.keys(params).map((key) => {
                var VAL = encodeURIComponent(this.core.Base65Encode(params[key], KUNCI));

                //=> Check No Encryption
                var Check = params[key];
                //console.log(key + " - " + Check);
                if(Check !== null && Check != ''){
                    if(Check.length > 5){
                        Check = Check.toString();
                        if(Check.substr(0, 5) == "NE---"){
                            VAL = encodeURIComponent(params[key]);
                        }
                    }

                    params[this.core.Base65Encode(key, KUNCI)] = VAL;
                }

                delete params[key];
            });
    
            var headers = new Headers({
                "Accept"        : "application/json", 
                "Content-Type"  : "application/x-www-form-urlencoded;" + D + ";" + State
            });
            let options = new RequestOptions({
                headers: headers
            });
    
            var url = this.core.Config().host + "/server";
            this.core.ShowLoader();

            var prev = this.LS.get('prev');

            return this.http.post(url, this.core.formData(params), options)
            .pipe(
                timeout(this.core.Config().timeout),
                retry(this.core.Config().retry),
                catchError(e => {
                    // do something on a timeout
                    console.error("Check Server", e);
                    this.core.OpenAlert({
                        type: 'error',
                        showConfirmButton: false,
                        title: 'Connection Timeout!',
                        msg: 'Please Try Again!'
                    });
                    this.core.HideLoader();
                    return of(null);
                })
            )
            //.map(res => res.json())*/
            .map(res => {
                // If request fails, throw an Error that will be caught
                if(res.status < 200 || res.status >= 300) {
                    /*this.core.OpenAlert({
                        type: 'error',
                        showConfirmButton: false,
                        title: 'Error ' + res.status + '!',
                        msg: 'Connection Failed. Please try again!'
                    });
                    console.error('This request has failed ' + res.status);*/
                    console.error('Check State' + res.status);
                    return res.json();
                } 
                // If everything went fine, return the response
                else {
                    return res.json();
                }
            })
            .map(
                res => {
                    if(res){
                        if(res.status == "online"){
                            this.core.HideLoader();
                            return true;
                        }else{
                            this.core.HideLoader();

                            if(isOpen){
                                this.core.OpenAlert(NoPermissions);
                                this.core.Sharing({});
                                this.router.navigate([prev]);
                                return false;
                            }else{
                                this.router.navigate(['/error/404']);
                                return false;
                            }
                        }
                    }else{
                        this.core.HideLoader();

                        if(isOpen){
                            this.core.OpenAlert(NoPermissions);
                            this.core.Sharing({});
                            this.router.navigate([prev]);
                            return false;
                        }else{
                            this.router.navigate(['/error/404']);
                            return false;
                        }
                    }
                }
            );

        }else{

            this.router.navigate(['/system/login']);

            this.core.HideLoader();
            //this.core.OpenAlert(NoPermissions);
            return false;
        }

        //return Return;*/

        // handle any redirects if a user isn't authenticated
        /*if (!this.auth.isLoggedIn){
            // redirect the user
            this.router.navigate(['/dashboard']);
            return false;
        }*/

        //return true;
            
    }
    
}
