import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import {
    Router,
    NavigationEnd,
    NavigationStart,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/filter';

import * as $ from 'jquery';

import * as moment from 'moment';
import 'moment-timezone';

import { default as swal } from 'sweetalert2';

import {
    MatSnackBar,
    MatSnackBarConfig
} from '@angular/material';

import { LocalStorageService } from 'angular-2-local-storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

import { environment } from 'environments/environment';
import { SocketService } from './socket';

import * as _ from 'lodash';
import { timeout } from 'rxjs/internal/operators/timeout';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs';
import { retry } from 'rxjs/internal/operators/retry';
import { SocketChatService } from 'providers/socket.chat';
import { BroadcasterService } from 'ng-broadcaster';

@Injectable()
export class Core {

    public ENV: any = environment;

    Response;

    constructor(
        private http: Http,
        public snackBar: MatSnackBar,
        private LS: LocalStorageService,
        private router: Router,
        private idle: Idle,
        private keepalive: Keepalive,
        private socket: SocketService,
        public socketChat: SocketChatService,
        private broadcast: BroadcasterService
    ) {

    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {

        return new Promise((resolve, reject) => {

            Promise.all([

            ]).then(
                ([events]: [any]) => {
                    resolve();
                },
                reject
            );

        });

    }

    _sharing: any = [];
    public Sharing(data, key: any = 'def') {
        this._sharing[key] = data;
    }
    public GetSharing(key: any = 'def'): Observable<any> {
        return of(this._sharing[key]);
    }

    public Config() {

        // => Development
        var HOST;
        if (this.ENV.production) {
            if (this.ENV.online) {
                HOST = this.a2b('aHR0cHM6Ly9hcHBzLmNpdHJhYm9ybmVvLmNvLmlkL2xvZ2lzeXMvQVBJ');
            } else {
                HOST = this.a2b('aHR0cDovLzEwLjEwLjEwLjExL2xvZ2lzeXMvQVBJ');
            }
        } else {
            HOST = 'http://' + window.location.hostname + '/cbi/app/logisys/API';
            if(window.location.hostname == '10.10.10.11'){
                HOST = 'http://' + window.location.hostname + '/_dev/logisys/API';
            }
        }

        var MAIN_HOST = '';

        var config = {
            host: HOST,
            host_main: MAIN_HOST,
            idle_time: 60 * 60,
            idle_timeout: 10,
            timeout: 60000,
            state: 1740,
            retry: 2,

            // => List Server to ping
            server: [
                'google.com'
            ]

        };

        return config;

    }

    /**
     * Socket
     */
    public InitSocket() {
        this.socket.initSocket();

        this.socket.onGet()
            .subscribe((data: any) => {
                // console.log(data);
            });

        this.socket.onEvent('connect')
            .subscribe(() => {
                // console.log('connected');
            });

        this.socket.onEvent('disconnect')
            .subscribe(() => {
                // console.log('disconnected');
            });
    }
    public send(data: any) {
        this.socket.send(data);

        if (!this.ENV.online) {
            this.Do('broadcast', { data: JSON.stringify(data) }).subscribe();
        }
    }
    // => / END : Socket

    /**
     * Socket Chat
     */
    public InitSocketChat() {
        this.socketChat.InitSocketChat(this);
    }
    // public SocketChat: any = this.socketChat.SocketChat();
    // => / END : Socket Chat

    /**
     * User Online
     */
    /*public UOL(page: any = null){

        var Params = {
            page: page
        }

        this.Do('e/useronline', Params).subscribe(
            result => {
                
            },
            error => {
                console.error("Useronline", error);
            }
        );

    }*/
    // => / END : User Online

    /*******************************/
    // => Check State
    public State() {

        /**
         * State
         */
        var D = this.Separator();

        // => State
        var State = '';
        if (this.LS.get('state')) {
            State = this.LS.get('state') + ';';
        }

        var headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;' + D + ';' + State,
        });

        if (State) {

            var KUNCI_ASLI = D;
            KUNCI_ASLI = KUNCI_ASLI.toString();
            var KUNCI = KUNCI_ASLI.substr(0, 8);
            KUNCI = KUNCI + KUNCI_ASLI.substr(-8);

            let options = new RequestOptions({ headers: headers });

            // => Clean URL
            var url = this.Config().host + '/config';

            var params = {
                page: this.router.url
            };

            return this.http.post(url, this.formData(params), options)
                .pipe(
                    timeout(this.Config().timeout),
                    retry(this.Config().retry),
                    catchError(e => {
                        // do something on a timeout
                        console.error('Check State', e);
                        this.OpenAlert({
                            type: 'error',
                            showConfirmButton: false,
                            title: 'Error ' + e.status + '!',
                            msg: 'Error: ' + e.statusText + ', Please Try Again!'
                        });
                        this.HideLoader();
                        return of(null);
                    })
                )
                .map(res => {
                    // If request fails, throw an Error that will be caught
                    if (res.status < 200 || res.status >= 300) {
                        // throw new Error('Server Not Responding ' + res.status);
                        console.error('Check State' + res.status);
                        return res.json();
                    }
                    // If everything went fine, return the response
                    else {
                        return res.json();
                    }
                })
                // .map(res => res.json())
                .map(
                    data => {

                        if (
                            data.cp == 1 &&
                            this.router.url != '/system/cpass'
                        ) {
                            this.router.navigate([
                                '/system/cpass'
                            ]);

                            return false;
                        }

                        this.Response = data;
                        this.HideLoader();

                        return this.Response;
                    },
                    error => {
                        this.Response = error;
                        this.HideLoader();
                        return this.Response;
                    }
                );

            /*return new Promise((resolve, reject) => {
                this.http.post(url, {}, options) 
                .subscribe(
                    (response: any) => {
                        var R = JSON.parse(JSON.stringify(response))
                        resolve(JSON.parse(R._body));
                    }, 
                    reject
                );
            });*/

        } else {
            this.Response = {
                status: 0
            };
            return this.Response;
        }
        // => / END : State */

    }
    // => END Check State
    /*******************************/

    public Do(url, params) {

        var Timeout = this.Config().timeout;
        if (params.notimeout == 1) {
            Timeout = 3600 * 1000;
        }

        /**
         * Get Current Time
         */
        moment.tz.add([
            'Asia/Jakarta|BMT JAVT WIB JST WIB WIB|-77.c -7k -7u -90 -80 -70|01232425|-1Q0Tk luM0 mPzO 8vWu 6kpu 4PXu xhcu|31e6',
        ]);

        var d = moment().tz('Asia/Jakarta').toString();
        // => / END : Get Current Time

        var LastState = this.LS.get('LastState');

        /**
         * Diff State
         */
        var DiffState = null;
        if (LastState) {
            var a = moment(this.a2b(LastState.toString()));
            var b = moment(d);
            // DiffState = moment.duration(b.diff(a)).as('minutes');
            DiffState = b.diff(a, 'seconds');
        }
        // => / END : Diff State */

        /**
         * Inject Params
         */
        params.sys_url = this.router.url;
        params.api_url = url;
        // => / END : Inject Params

        if (!params.NoLoader) {
            this.ShowLoader();
        }

        // => BEGIN Real DO
        var D = this.Separator();

        // => State
        var State = this.LS.get('state');
        var Continue = false;
        if (State) {
            State += ';';
            Continue = true;
        }

        var NoState = this.LS.get('nostate');

        if (State) {

            // this.HideLoader();

            if (DiffState && Number(DiffState) <= this.Config().state) {

                Continue = true;

            } else {

                // => Checking State
                this.State().subscribe(
                    // this.State().then(
                    state => {

                        if (state.status == 1) {

                            this.LS.set('state', state.config);

                            /**
                             * Set Last State
                             */
                            this.LS.set('LastState', this.b2a(d));
                            // => / END : Set Last State */

                            if (state.config) {
                                State = state.config;
                            }

                            var prev = this.LS.get('prev');

                            Continue = true;

                            this.router.events
                                .filter(event => event instanceof NavigationEnd)
                                .map((ev: any) => ev.url)
                                .subscribe(
                                    url => {
                                        if (
                                            prev != url &&
                                            url != '/system/login' &&
                                            url != '/system/cpass'
                                        ) {
                                            // console.log('prev:', prev);
                                            this.LS.set('prev', url);
                                            if (!params.NoLoader) {
                                                this.HideLoader();
                                            }
                                        }
                                    }
                                );

                        } else {

                            /*this.LS.remove('state');
                            this.router.navigate([
                                '/session/login'
                            ]);*/

                            // State = this.LS.get('state');

                            // if(!State){

                            Continue = false;

                            console.error('State Subscribe', state);

                            if (!params.NoLoader) {
                                this.HideLoader();
                            }

                            if (state.code) {
                                this.LS.remove('state');
                                this.router.navigate([
                                    '/session/login'
                                ]);
                            }

                            return false;

                            // }

                        }
                    },
                    error => {

                        if (DiffState && DiffState > this.Config().state) {

                            this.LS.remove('state');
                            this.router.navigate([
                                '/system/login'
                            ]);

                            if (!params.NoLoader) {
                                this.HideLoader();
                            }

                            return false;

                        }

                    }
                );
                // => END Checking State

            }

        } else {

            if (!NoState) {

                this.LS.remove('state');
                this.router.navigate([
                    '/system/login'
                ]);

                Continue = false;

                if (!params.NoLoader) {
                    this.HideLoader();
                }
            }

            // return;
        }

        if (
            this.router.url == '/system/login' ||
            NoState
        ) {
            Continue = true;
        }

        if (Continue) {

            var headers = new Headers({
                'Accept': 'application/json;charset=utf-8',
                'Content-Type': 'application/x-www-form-urlencoded;' + D + ';' + State,
            });

            // var KUNCI_ASLI = params.d;
            var KUNCI_ASLI = D;
            KUNCI_ASLI = KUNCI_ASLI.toString();
            var KUNCI = KUNCI_ASLI.substr(0, 8);
            KUNCI = KUNCI + KUNCI_ASLI.substr(-8);

            delete params['d'];

            params = JSON.parse(JSON.stringify(params));

            Object.keys(params).map((key) => {
                var VAL = encodeURIComponent(this.Base65Encode(params[key], KUNCI));

                // => Check No Encryption
                var Check = params[key];
                // console.log(key + " - " + Check);

                if (this.hasUnicode(params[key])) {
                    params[this.Base65Encode(key, KUNCI)] = 'NE---' + encodeURIComponent(params[key]);
                } else {
                    if (Check !== null && Check != '') {
                        if (Check.length > 5) {
                            Check = Check.toString();
                            if (Check.substr(0, 5) == 'NE---') {
                                VAL = encodeURIComponent(params[key]);
                            }
                        }

                        params[this.Base65Encode(key, KUNCI)] = VAL;
                    }
                }

                delete params[key];
            });

            let options = new RequestOptions({ headers: headers });

            // => Clean URL
            url = this.Config().host + '/' + url;

            return this.http.post(url, this.formData(params), options)
                .pipe(
                    timeout(Timeout),
                    retry(this.Config().retry),
                    catchError(e => {
                        // do something on a timeout
                        console.error('Server Not Responding', e);
                        this.OpenAlert({
                            type: 'error',
                            showConfirmButton: false,
                            title: 'Error ' + e.status + '!',
                            msg: 'Error: ' + e.statusText + ', Please Try Again!'
                        });
                        this.HideLoader();
                        return of(null);
                    })
                )
                .map(res => {
                    // var result = JSON.parse(JSON.stringify(res.json()), function(k, v) { 
                    //     return (typeof v === "object" || isNaN(v)) ? v : parseInt(v, 10); 
                    // });

                    // console.log(result);

                    // If request fails, throw an Error that will be caught
                    if (res.status < 200 || res.status >= 300) {
                        console.error('Server Not Responding ' + res.status);
                        return res.json();
                        // return result;
                    }
                    // If everything went fine, return the response
                    else {
                        return res.json();
                        // return result;
                    }

                })
                // .map(res => res.json())
                .map(
                    data => {

                        if (!params.NoLoader) {
                            this.HideLoader();
                        }

                        if(data.critical == 1){

                            var Msg = 'Wow, this is critical error. Please call the IT Developers';
                            if(data.error_msg){
                                Msg = data.error_msg;
                            }

                            this.OpenAlert({
                                type: 'error',
                                title: 'Critical Error!',
                                msg: Msg,
                                width: 800
                            });

                            // this.OpenNotif(Msg, 30000);
                        }

                        if (data.status == 99) {
                            this.Sharing({});
                            /*this.router.navigate([
                                '/error/404'
                            ]);
                            return false;*/
                            return true;
                        } else {

                            this.Response = data;

                            return this.Response;
                        }
                    },
                    error => {
                        this.Response = error;

                        if (!params.NoLoader) {
                            this.HideLoader();
                        }

                        return this.Response;
                    }
                );
            // => END Real DO

        } else {

            // create observable
            this.Response = new Observable((observer) => {

                // observable execution
                observer.next(0);
                observer.complete();
            });

            return this.Response;

        }

    }

    formData(myFormData) {
        return Object.keys(myFormData).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(myFormData[key]);
        }).join('&');

    }

    public Separator() {
        moment.tz.add([
            'Asia/Jakarta|BMT JAVT WIB JST WIB WIB|-77.c -7k -7u -90 -80 -70|01232425|-1Q0Tk luM0 mPzO 8vWu 6kpu 4PXu xhcu|31e6',
        ]);

        var d = moment().tz('Asia/Jakarta').toString();
        var n = Date.parse(d) / 1000;

        // console.log(moment().tz('Asia/Jakarta').format());

        return this.dxee(n);
    }

    // grs(len, charSet) {
    grs(len) {
        var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }
    grs2(min, max) {
        if (min < 0) {
            return min + Math.random() * (Math.abs(min) + max);
        } else {
            return min + Math.random() * max;
        }
    }
    dxe(hash) {
        // btoa(hash);
        this.b2a(hash);
    }
    dxee(hash) {
        var H = Math.round(this.grs2(25, 30));
        // var T = btoa(hash);
        var T = this.b2a(hash);
        T = T.replace(/=/gi, '');
        T = T.substr(5) + T.substr(0, 5);
        T = this.grs(H) + T;
        T = T.substr(0, 4) + '' + H + '' + T.substr(4);

        return T;
    }

    /*********************************************/
    // => Format Rupiah
    rupiah(angka, dec = 2, force = false) {

        var Decimal = parseFloat(angka).toFixed(dec);
        var Find = (Decimal + '').split('.');
        Decimal = Find[1];

        var rev = parseInt(angka, 10).toString().split('').reverse().join('');
        var rev2 = '';
        for (var i = 0; i < rev.length; i++) {
            rev2 += rev[i];
            if ((i + 1) % 3 === 0 && i !== (rev.length - 1)) {
                rev2 += '.';
            }
        }

        var Return = rev2.split('').reverse().join('');
        if (Number(Decimal) > 0) {
            Return = Return + ',' + Decimal;
        } else {
            if (force) {

                var forced = '';
                if (force && dec > 0) {
                    forced = ',';
                    for (let i = 0; i < dec; i++) {
                        forced += '0';
                    }
                }

                Return = Return + forced;
            }
        }

        if (Return.toString().substr(0, 2) === '-.') {
            var FinalResult = Return.toString().replace('-.', '-');
            Return = FinalResult;
        }

        return Return;

    }

    terbilang(bilangan) {

        bilangan = String(bilangan);
        var angka = new Array('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
        var kata = new Array('', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan');
        var tingkat = new Array('', 'ribu', 'juta', 'milyar', 'triliun');

        var panjang_bilangan = bilangan.length;

        /* pengujian panjang bilangan */
        if (panjang_bilangan > 15) {
            kaLimat = 'Diluar Batas';
            return kaLimat;
        }

        var i,
            j,
            subkaLimat,
            kata1,
            kata2,
            kata3;

        /* mengambil angka-angka yang ada dalam bilangan, dimasukkan ke dalam array */
        for (i = 1; i <= panjang_bilangan; i++) {
            angka[i] = bilangan.substr(-(i), 1);
        }

        i = 1;
        j = 0;
        var kaLimat = '';


        /* mulai proses iterasi terhadap array angka */
        while (i <= panjang_bilangan) {

            subkaLimat = '';
            kata1 = '';
            kata2 = '';
            kata3 = '';

            /* untuk Ratusan */
            if (angka[i + 2] != '0') {
                if (angka[i + 2] == '1') {
                    kata1 = 'seratus';
                } else {
                    kata1 = kata[angka[i + 2]] + ' ratus';
                }
            }

            /* untuk Puluhan atau Belasan */
            if (angka[i + 1] != '0') {
                if (angka[i + 1] == '1') {
                    if (angka[i] == '0') {
                        kata2 = 'sepuluh';
                    } else if (angka[i] == '1') {
                        kata2 = 'sebelas';
                    } else {
                        kata2 = kata[angka[i]] + ' belas';
                    }
                } else {
                    kata2 = kata[angka[i + 1]] + ' puluh';
                }
            }

            /* untuk Satuan */
            if (angka[i] != '0') {
                if (angka[i + 1] != '1') {
                    kata3 = kata[angka[i]];
                }
            }

            /* pengujian angka apakah tidak nol semua, lalu ditambahkan tingkat */
            if ((angka[i] != '0') || (angka[i + 1] != '0') || (angka[i + 2] != '0')) {
                subkaLimat = kata1 + ' ' + kata2 + ' ' + kata3 + ' ' + tingkat[j] + ' ';
            }

            /* gabungkan variabe sub kaLimat (untuk Satu blok 3 angka) ke variabel kaLimat */
            kaLimat = subkaLimat + kaLimat;
            i = i + 3;
            j = j + 1;

        }

        /* mengganti Satu Ribu jadi Seribu jika diperlukan */
        if ((angka[5] == '0') && (angka[6] == '0')) {
            kaLimat = kaLimat.replace('satu ribu', 'seribu');
        }

        return kaLimat;
    }
    terbilang_koma(bilangan, currency = 'IDR') {

        bilangan = String(bilangan);
        bilangan = bilangan.split('.');

        var mata = ' rupiah ';
        var mata2 = ' sen';
        if (currency == 'USD') {
            mata = ' US dollar ';
            mata2 = ' cent';
        }

        if (currency == 'AUD') {
            mata = ' Dolar Australia ';
            mata2 = ' cent';
        } else if (currency == 'BND') {
            mata = ' Dolar Brunei D. ';
            mata2 = ' cent';
        } else if (currency == 'CAD') {
            mata = ' Dolar Canada ';
            mata2 = ' cent';
        } else if (currency == 'CHF') {
            mata = ' Franc Swiss ';
            mata2 = ' cent';
        } else if (currency == 'CNH') {
            mata = ' Yuan Lepas Pantai ';
            mata2 = ' cent';
        } else if (currency == 'CNY') {
            mata = ' Yuan Renminbi ';
            mata2 = ' cent';
        } else if (currency == 'DKK') {
            mata = ' Kroner ';
            mata2 = ' cent';
        } else if (currency == 'EUR') {
            mata = ' EURO ';
            mata2 = ' cent';
        } else if (currency == 'GBP') {
            mata = ' Poundsterling ';
            mata2 = ' cent';
        } else if (currency == 'HKD') {
            mata = ' Dolar Hongkong ';
            mata2 = ' cent';
        } else if (currency == 'JPY') {
            mata = ' Yen ';
            mata2 = ' cent';
        } else if (currency == 'KRW') {
            mata = ' Won ';
            mata2 = ' cent';
        } else if (currency == 'KWD') {
            mata = ' Dinar Kuwait ';
            mata2 = ' cent';
        } else if (currency == 'LAK') {
            mata = ' Kips ';
            mata2 = ' cent';
        } else if (currency == 'MYR') {
            mata = ' Ringgit ';
            mata2 = ' cent';
        } else if (currency == 'NOK') {
            mata = ' Kroner ';
            mata2 = ' cent';
        } else if (currency == 'NZD') {
            mata = ' Dolar Selandia Baru ';
            mata2 = ' cent';
        } else if (currency == 'PGK') {
            mata = ' Kina ';
            mata2 = ' cent';
        } else if (currency == 'PHP') {
            mata = ' Peso ';
            mata2 = ' cent';
        } else if (currency == 'SAR') {
            mata = ' Riyal ';
            mata2 = ' cent';
        } else if (currency == 'SEK') {
            mata = ' Kroner ';
            mata2 = ' cent';
        } else if (currency == 'SGD') {
            mata = ' Dolar Singapura ';
            mata2 = ' cent';
        } else if (currency == 'THB') {
            mata = ' Baht ';
            mata2 = ' cent';
        } else if (currency == 'USD') {
            mata = ' Dolar Amerika Serikat ';
            mata2 = ' cent';
        } else if (currency == 'VND') {
            mata = ' Dong ';
            mata2 = ' cent';
        }

        var First = this.terbilang(bilangan[0]) + mata;
        var Second = '';
        if (Number(bilangan[1]) > 0) {
            Second = this.terbilang(bilangan[1]) + mata2;
        }

        return First + Second;

    }
    // => END Format Rupiah
    /*********************************************/

    /*********************************************/
    /** Format English */
    inWords(n) {
        
        var string = n.toString(), units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words, and = 'and';

        /* Remove spaces and commas */
        string = string.replace(/[, ]/g,"");

        /* Is number zero? */
        if( parseInt( string ) === 0 ) {
            return 'zero';
        }
        
        /* Array of units as words */
        units = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ];
        
        /* Array of tens as words */
        tens = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ];
        
        /* Array of scales as words */
        scales = [ '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion' ];
        
        /* Split user argument into 3 digit chunks from right to left */
        start = string.length;
        chunks = [];
        while( start > 0 ) {
            end = start;
            chunks.push( string.slice( ( start = Math.max( 0, start - 3 ) ), end ) );
        }
        
        /* Check if function has enough scale words to be able to stringify the user argument */
        chunksLen = chunks.length;
        if( chunksLen > scales.length ) {
            return '';
        }
        
        /* Stringify each integer in each chunk */
        words = [];
        for( i = 0; i < chunksLen; i++ ) {
            
            chunk = parseInt( chunks[i] );
            
            if( chunk ) {
                
                /* Split chunk into array of individual integers */
                ints = chunks[i].split( '' ).reverse().map( parseFloat );
            
                /* If tens integer is 1, i.e. 10, then add 10 to units integer */
                if( ints[1] === 1 ) {
                    ints[0] += 10;
                }
                
                /* Add scale word if chunk is not zero and array item exists */
                if( ( word = scales[i] ) ) {
                    words.push( word );
                }
                
                /* Add unit word if array item exists */
                if( ( word = units[ ints[0] ] ) ) {
                    words.push( word );
                }
                
                /* Add tens word if array item exists */
                if( ( word = tens[ ints[1] ] ) ) {
                    words.push( word );
                }
                
                /* Add 'and' string after units or tens integer if: */
                if( ints[0] || ints[1] ) {
                    
                    /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                    if( ints[2] || ! i && chunksLen ) {
                        words.push( and );
                    }
                
                }
                
                /* Add hundreds word if array item exists */
                if( ( word = units[ ints[2] ] ) ) {
                    words.push( word + ' hundred' );
                }
                
            }
            
        }
        
        return words.reverse().join( ' ' ) + ' US dollar';
        
    }
    // => END Format English
    /*********************************************/

    public hasUnicode(str) {
        // console.log(str);
        // console.log(Number.isInteger(parseInt(str)))
        if (str) {
            if (!Number.isInteger(parseInt(str))) {
                str = str.toString();
                for (var i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) > 127) return true;
                }
            }
        }
        return false;
    }

    /*********************************************/
    // => Base65
    PHPRand(min, max) {
        var argc = arguments.length;
        if (argc === 0) {
            min = 0;
            max = 2147483647;
        } else if (argc === 1) {
            throw new Error('Warning: rand() expects exactly 2 parameters, 1 given');
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    PHPChr(codePt) {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        } else {
            return String.fromCharCode(codePt);
        }
    }
    Base65Encode(str, key) {

        if (str != '' && str != null && key != '' && key != null) {

            var str = str.toString();
            var key = key.toString();

            var result = '',
                char,
                keychar;

            for (var i = 0; i < str.length; i++) {
                char = str.toString().substr(i, 1);
                keychar = key.substr((i % key.length) - 1, 1);
                char = Number(char.charCodeAt()) + Number(keychar.charCodeAt());
                char = this.PHPChr(char);
                result += char;
                // console.log(i + " - " + char);
            }

            var salt_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys0123456789~!@#$^&*()_+`-={}|:<>?[]\;\',./';
            var the_length = this.PHPRand(1, 15);
            var salt = '';

            for (var i = 0; i <= the_length; i++) {
                salt += salt_string.substr(this.PHPRand(0, salt_string.length), 1);
            }

            var salt_length = salt.length;
            var end_length = salt_length.toString().length;

            // result = btoa(result + salt + salt_length + end_length);
            result = this.b2a(result + salt + salt_length + end_length);
            // result = result + salt + salt_length + end_length;

            return result;

        }

    }
    Base65Decode(str, key) {

        var result = '',
            char,
            keychar;

        if (str != '' && str != null && key != '' && key != null) {

            var str = str.toString();
            var key = key.toString();

            str = str.replace(/-/gi, '+');
            str = str.replace(/\//gi, '_');

            var mod4 = str.length % 4;
            if (mod4) {
                str += '===='.substr(mod4);
            }

            // str = window.atob(str);
            str = this.a2b(str);

            var end_length = str.substr(-1, 1);
            end_length = end_length.toString();

            str = str.substr(0, -1);

            var salt_length = str.substr(Number(end_length) * -1, end_length);

            str = str.substr(0, Number(end_length) * -1 + salt_length * -1);

            for (var i = 0; i < str.length; i++) {
                char = str.substr(i, 1);
                keychar = key.substr((i % key.length) - 1, 1);
                char = Number(char.charCodeAt()) - Number(keychar.charCodeAt());
                char = this.PHPChr(char);

                result += char;
            }

        }

        return result;

    }

    safe_encode(input) {
        /*output = output.replace(/-/gi, '+');
        output = output.replace(/_/gi, '/');*/
        var output = input.replace(/-/g, '+').replace(/_/g, '/');

        return output;
    }
    safe_decode(input) {
        /*output = output.replace(/\+/gi, '-');
        output = output.replace(/\//gi, '_');
        output = output.replace(/=/gi, '');*/
        var output = input.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
        output = output.replace(/__/g, '//').replace(/\u0000/g, '');

        return output;
    }
    // => End Base65
    /*********************************************/

    /*********************************************/
    // => STRPAD
    /*str_pad(nr, n){
        return Array(n-String(nr).length+1).join('0')+nr;
    }*/
    // => STRPAD
    /*********************************************/


    /*********************************************/
    // => Open Notif
    public OpenNotif(msg, duration = 5000) {
        const config = new MatSnackBarConfig();

        config.duration = duration;

        this.snackBar.open(msg, '', config);
    }
    // => OPEN Notif
    /*********************************************/

    // =============== BEGIN OpenAlert ===============
    public OpenAlert(data) {

        if (!data.type) {
            data.type = 'error';
        }

        if (!data.title) {
            data.title = 'Error!';
        }

        if (!data.msg) {
            data.msg = '';
        }

        if (!data.showButton && data.showButton !== false) {
            data.showButton = true;
        }

        swal({
            title: data.title,
            // text: 'Are you sure want to continue?',
            html: data.msg,
            type: data.type,
            reverseButtons: true,
            focusCancel: true,
            // showCancelButton    : true,
            confirmButtonText: 'Close',
            showConfirmButton: data.showButton,
            width: data.width
            // cancelButtonText    : 'Cancel'
        });
    }
    // ================ END OpenAlert ================

    /*********************************************/
    // => ChangeStatus
    public ChangeStatus(params) {

        params.d = this.Separator();

        var R = 0;

        this.Do('e/aktif', params).subscribe(
            success => {

                if (success.status == 1) {
                    R = 1;
                } else {
                    this.OpenNotif(success.error_msg);
                }

            },
            error => {
                this.OpenNotif(error);
            }
        );

        return R;

    }
    // => END ChangeStatus
    /*********************************************/

    /*********************************************/
    // => Find JSON
    public FJSON(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.FJSON(obj[i], key, val));
            } else if (i == key && obj[key] == val) {
                objects.push(obj);
            }
        }
        return objects;
    }
    public FJSON2(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.FJSON(obj[i], key, val));
            } else if (i == key && obj[key].match(val)) {
                objects.push(obj);
            }
        }
        return objects;
    }
    // => END Find JSON
    /*********************************************/

    /*********************************************/
    // => RemoveEmptyJSON
    public RemoveEmptyJSON(obj) {
        const isNotObject = v => v === null || typeof v !== 'object';
        const isEmpty = o => Object.keys(o).length === 0;

        if (isNotObject(obj)) return obj;
        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; i += 1) {
                if (isNotObject(obj[i])) continue;
                if (isEmpty(obj[i])) obj.splice(i--, 1);
                else obj[i] = this.RemoveEmptyJSON(obj[i]);
            }
        } else {
            for (let p in obj) {
                if (isNotObject(obj[p])) continue;
                if (!isEmpty(obj[p])) obj[p] = this.RemoveEmptyJSON(obj[p]);
                if (isEmpty(obj[p])) delete obj[p];
            }
        }
        return obj;
    }
    // => END RemoveEmptyJSON
    /*********************************************/

    /****************************************************/
    // => CheckState
    CheckState() {

        // => Set Temporary Data
        // this.LS.set('state', 'CFux7zSPVloEk5bcc6VW3GrGMatEqDAhNNl5oT08O66Ib55AUcIux_h-K1YhDg2ukXZy6hbWnak7w7Wyuo6JAfeT5X4PfRRidJUIlfgosnIs4B-I746yCip_W-m2oZNzyRFFeFrIpCkKptBef7E4ixC5CEPkhO8VCiYH3VKXre2pcSU_T7f6lJJ-dVPCxdsq-9Kg0nObZ726xv50P4M_mnbfGlKmJLSfjR1u484-_ktqR6_B5u42ycx9bmca3ueTfMReF5iEmRbHMTzfBnqSZwld_a3OeR-x_lNPPWgJJgqEIZzMCyl408Ly12jZSIhNeg0BHo3--LuQPAY8LXjsbZPBHJ677B-VlpM5tvp_0O8JGE_3uvXk6E1Lcgk2sQvIg');
        // this.LS.remove('state');

        /*
        var Auth = this.LS.get('state');

        if(Auth){
            //alert(Auth);
            this.Do('config', {}).subscribe(
                result => {
                    //console.log(result);
                    if(result.status == 1){
                        this.LS.set('state', result.config);
                    }else{
                        this.LS.remove('state');
                        this.router.navigate([
                            '/session/login'
                        ]);
                    }
                },
                error => {
                    this.LS.remove('state');
                    this.router.navigate([
                        '/session/login'
                    ]);

                    //this.OpenNotif(error);
                }
            )
        }else{
            this.LS.remove('state');
            this.router.navigate([
                '/session/login'
            ]);
        }
        */
    }
    // => END CheckState
    /****************************************************/

    // ******************** BEGIN ping ********************
    Ping(ip) {

        /*$.Ping(ip).done(
            function (success, url, time, on) {
                console.log("ping done", JSON.stringify(arguments));
            }
        ).fail(
            function (failure, url, time, on) {
                console.log("ping fail", JSON.stringify(arguments));
            }
        );*/

    }
    // ********************* END ping *********************

    /****************************************************/
    // => Loader
    ShowLoader() {
        $('#apploader').show();
    }
    HideLoader() {
        setTimeout(() => {
            $('#apploader').fadeOut(1000);
        }, 250);
    }
    // => END Loader
    /****************************************************/

    // ======================== BEGIN BASE64 ========================
    private PADCHAR: string = '=';
    private ALPHA: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    private getByte(s: string, i: number): number {
        const x = s.charCodeAt(i);
        return x;
    }

    private getByte64(s: string, i: number): number {
        const idx = this.ALPHA.indexOf(s.charAt(i));
        return idx;
    }

    // Decode
    public a2b(s: string): string {
        let pads = 0,
            i, b10, imax = s.length,
            x = [];

        s = String(s);

        if (imax === 0) {
            return s;
        }

        if (s.charAt(imax - 1) === this.PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === this.PADCHAR) {
                pads = 2;
            }
            imax -= 4;
        }

        for (i = 0; i < imax; i += 4) {
            b10 = (this.getByte64(s, i) << 18) | (this.getByte64(s, i + 1) << 12) | (this.getByte64(s, i + 2) << 6) | this.getByte64(s, i + 3);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255, b10 & 255));
        }

        switch (pads) {
            case 1:
                b10 = (this.getByte64(s, i) << 18) | (this.getByte64(s, i + 1) << 12) | (this.getByte64(s, i + 2) << 6);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255));
                break;
            case 2:
                b10 = (this.getByte64(s, i) << 18) | (this.getByte64(s, i + 1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break;
        }

        return x.join('');
    }

    // Encode
    public b2a(s: string): string {
        s = String(s);

        let i, b10, x = [],
            imax = s.length - s.length % 3;

        if (s.length === 0) {
            return s;
        }

        for (i = 0; i < imax; i += 3) {
            b10 = (this.getByte(s, i) << 16) | (this.getByte(s, i + 1) << 8) | this.getByte(s, i + 2);
            x.push(this.ALPHA.charAt(b10 >> 18));
            x.push(this.ALPHA.charAt((b10 >> 12) & 63));
            x.push(this.ALPHA.charAt((b10 >> 6) & 63));
            x.push(this.ALPHA.charAt(b10 & 63));
        }

        switch (s.length - imax) {
            case 1:
                b10 = this.getByte(s, i) << 16;
                x.push(this.ALPHA.charAt(b10 >> 18) + this.ALPHA.charAt((b10 >> 12) & 63) + this.PADCHAR + this.PADCHAR);
                break;
            case 2:
                b10 = (this.getByte(s, i) << 16) | (this.getByte(s, i + 1) << 8);
                x.push(this.ALPHA.charAt(b10 >> 18) + this.ALPHA.charAt((b10 >> 12) & 63) + this.ALPHA.charAt((b10 >> 6) & 63) + this.PADCHAR);
                break;
        }

        return x.join('');
    }
    // ========================= END BASE64 =========================

    // ========================= STR_PAD =========================
    str_pad(n, p, c) {
        var pad_char = typeof c !== 'undefined' ? c : '0';
        var pad = new Array(1 + p).join(pad_char);
        return (pad + n).slice(-pad.length);
    }
    // ======================== / STR_PAD ========================

    // ===================== DEFAULT =====================
    LoadDefault() {
        var Params = {

        };
        this.Do('e/default', Params).subscribe(
            result => {

                if (result) {
                    this.LS.set('Default', result);
                }
            },
            error => {
                this.OpenNotif(error);
            }
        );
    }
    GetDefault() {

        var Default = this.LS.get('Default');
        if (Default) {
            return Default;
        }

    }
    // ==================== / DEFAULT ====================

    /**
     * Idle
     */
    idleState = 'Not started';
    timedOut = false;
    lastPing?: Date = null;
    WatchIdle() {
        let IdleTime = this.Config().idle_time;
        let IdleTimeout = this.Config().idle_timeout;
        let IdleInterval = IdleTime + IdleTimeout;

        // sets an idle timeout of 5 seconds, for testing purposes.
        this.idle.setIdle(IdleTime);
        // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
        this.idle.setTimeout(IdleTimeout);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => {
            this.idleState = 'No longer idle.';

            swal.close();
            // console.log(this.idleState);
        });
        this.idle.onTimeout.subscribe(() => {
            this.idleState = 'Timed out!';
            this.timedOut = true;

            this.broadcast.broadcast('logout', {});

            /*var Alert = {
                type: 'warning',
                title: 'Timeout Innactivity',
                msg: 'Silahkan Masukkan Password Anda untuk masuk kembali!'
            }
            this.OpenAlert(Alert);*/
            swal.close();

            // console.log(this.idleState);

            // => Go to login
            this.LS.remove('state');
            /*this.router.navigate([
                '/system/login'
            ]);*/
            this.LS.set('nostate', true);
            $('#lockscreen').fadeIn();

            return false;
            // => END Go to login
        });
        this.idle.onIdleStart.subscribe(() => {
            this.idleState = 'You\'ve gone idle!';

            // console.log(this.idleState);
        });
        this.idle.onTimeoutWarning.subscribe((countdown) => {
            this.idleState = 'You will time out in ' + countdown + ' seconds!';

            var Alert = {
                type: 'warning',
                title: 'Auto Logout ' + countdown,
                msg: 'System akan Auto Logout dalam ' + countdown + ' detik!',
                showButton: false
            };
            this.OpenAlert(Alert);

        });

        // sets the ping interval to 15 seconds
        this.keepalive.interval(IdleInterval);

        this.keepalive.onPing.subscribe(() => {
            this.lastPing = new Date();

            // console.log(this.idleState);
        });

        this.ResetIdle();
    }
    // => / END : Idle

    ResetIdle() {
        this.idleState = 'Started.';
        this.timedOut = false;
        this.idle.watch();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    b64toBlob(b64Data, contentType) {
        var sliceSize = 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    /**
     * Download Excel
     */
    DownloadExcel(params, content, fileName) {
        this.ShowLoader();

        var blobObject = this.b64toBlob(content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');


        if (window.navigator.msSaveOrOpenBlob) {
            // Internet Explorer
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        } else {
            // Chrome
            var downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blobObject);
            downloadLink.download = fileName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }

        this.HideLoader();
    }
    // => / END : Download Excel

    /**
     * Check Difference
     */
    DiffCompare(object, base) {
        return this.DiffChange(object, base);
    }
    DiffChange(object, base) {
        return _.transform(object, (result, value, key) => {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? this.DiffCompare(value, base[key]) : value;
            }
        });
    }
    // => / END : Check Difference

    /**
     * Moment Date
     */
    MomentDate(date) {
        return moment(date, 'YYYY-MM-DD');
    }
    // => / END : Momend Date

    public isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    /**
     * Search Using Like
     */
    Search(array, substr) {
        return _.filter(array, _.flow(
            _.identity,
            _.values,
            _.join,
            _.toLower,
            _.partialRight(_.includes, substr)
        ));
    }
    // => / END : Search Using Like

    sci(x) {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
            }
        } else {
            var e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += (new Array(e + 1)).join('0');
            }
        }
        return x;
    }

}

export const CoreDateFormat = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

// String.prototype.potong = function(sep){

//     var val = new String(this);
//     return val.split(sep);
// }
// Object.defineProperty( String.prototype, 'split', {
// 	value: function ( sep ){
//         // your code …

//         var val = new String(this);

// 		return val.split(sep);
// 	}
// });