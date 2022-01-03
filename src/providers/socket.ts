import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { environment } from 'environments/environment';

const SERVER_URL = "localhost:9090";
//const SERVER_URL = "https://apps.citraborneo.co.id:62543";
const PROD_URL = "http://10.10.10.11:9090";
const ONLINE_URL = "https://apps.citraborneo.co.id:62543";

@Injectable()
export class SocketService {
    private socket;
    public ENV: any = environment;

    public initSocket() {
        if(this.ENV.production){
            if(this.ENV.online){
                this.socket = socketIo(ONLINE_URL);
            }else{
                this.socket = socketIo(PROD_URL);
            }
        }else{
            this.socket = socketIo(SERVER_URL);
        }
    }

    public send(data) {    //send
        this.socket.emit('get', data);
    }

    public onGet(): Observable<any> {   // onMessage
        return new Observable<any>(observer => {
            this.socket.on('get', (data: any) => observer.next(data));
        });
    }

    public onEvent(event): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }

}