import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { environment } from 'environments/environment';
import { SocketIOAdapter } from './socket.chat.adapter';
import { ChatAdapter, ParticipantResponse } from 'ng-chat';
import { Http } from '@angular/http';
import { BroadcasterService } from 'ng-broadcaster';

const SERVER_URL = "localhost:9099";
const PROD_URL = "http://10.10.10.11:62599";
const ONLINE_URL = "https://apps.citraborneo.co.id:62544";

const USE_URL = PROD_URL;

@Injectable()
export class SocketChatService {
    public socket;
    private core;
    private ENV: any = environment;
    
    constructor(
        private broadcast: BroadcasterService,
        private http: Http
    ){}

    public InitSocketChat(core){
        // if(this.ENV.production){
        //     if(this.ENV.online){
        //         this.socket = socketIo(ONLINE_URL);
        //     }else{
        //         this.socket = socketIo(PROD_URL);
        //     }
        // }else{
        //     this.socket = socketIo(SERVER_URL);
        // }
        this.socket = socketIo(USE_URL);
        this.core = core;

        this.InitializeSocketListerners();
    }

    public emit(e, params){
        return this.socket.emit(e, params);
    }
    public on(e, cb){
        // return this.socket.on(e, cb);
        return this.socket.on(e, (data) => {
            cb(data);
        });
    }

    public adapter: ChatAdapter;
    public InitializeSocketListerners(): void {

    	this.socket.on("generatedUserId", (userId) => {
    		// Initializing the chat with the userId and the adapter with the socket instance
            this.adapter = new SocketIOAdapter(userId, this.socket, this.http, this.core);
            this.broadcast.broadcast('ChatAdapter', this.adapter);
        });
        
        this.socket.on("friendsListChanged", (usersCollection: Array <ParticipantResponse> ) => {
            this.broadcast.broadcast('friendsListChanged', usersCollection);
    	});
    }

}