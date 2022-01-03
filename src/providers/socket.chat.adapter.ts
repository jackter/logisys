import { ChatAdapter, User, Message, ParticipantResponse } from 'ng-chat';
import { Observable, of } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Core } from './core'; 
import { SocketChatService } from './socket.chat';
import * as socketIo from 'socket.io-client';
import { BroadcasterService } from 'ng-broadcaster';
import * as moment from 'moment';
import * as _ from 'lodash';

const SERVER_URL = "http://localhost:9099";
const PROD_URL = "http://10.10.10.11:62599";
const ONLINE_URL = "https://apps.citraborneo.co.id:62544";

const USE_URL = PROD_URL;

export class SocketIOAdapter extends ChatAdapter {
    // private socket: this.core.SocketChat;
    private socket;
    private http: Http;
    private userId: string;
    private core: Core;

    Delay;

    constructor(
        userId: string, 
        socket: SocketChatService, 
        http: Http,
        core: Core
    ) {
        super();
        this.socket = socket;
        this.http = http;
        this.userId = userId;
        this.core = core;

        this.InitializeSocketListerners();  
    }

    listFriends(): Observable < ParticipantResponse[] > {
    	// List connected users to show in the friends list
        // Sending the userId from the request body as this is just a demo 

    	return this.http
    		.post(USE_URL + "/listFriends", {
    			userId: this.userId
    		})
    		.pipe(
    			map((res: Response) => res.json()),
    			catchError((error: any) => Observable.throw(error.json().error || 'Server error'))
    		);
    }

    // getMessageHistory(userId: any): Observable < Message[] > {
    // dataMsg: any = {};
    // getMessage(userId: any){
    //     let mockedHistory: Array<Message> = [];
    //     var Params = {
    //         NoLoader: 1,
    //         currentid: this.userId,
    //         userid: userId
    //     }
    //     this.core.Do('e/chat.get', Params).subscribe(
    //         result => {
    //             if(result && result.data){
    //                 // this.dataMsg[userId] = result.data;
    //                 mockedHistory = result.data;
    //                 var formatted: any = [];
    //                 for(let item of result.data){
    //                     formatted.push({
    //                         fromId: item.fromid,
    //                         toId: item.toid,
    //                         message: item.message,
    //                         dateSent: moment(item.datesent, 'YYYY-MM-DD HH:mm:ss')
    //                     })
    //                 }
    //                 this.dataMsg[userId] = formatted;

    //                 this.getMessageHistory(userId, 1);
    //             }else{
    //                 mockedHistory = [];
    //             }
    //         },
    //         error => {
    //             console.error('Chat History', error);
    //         }
    //     );
    //     console.log(Params);
    // }
    getMessageHistory(userId: any, called = 0) {
    	// This could be an API call to your NodeJS application that would go to the database
    	// and retrieve a N amount of history messages between the users.
        // return of([]);

        // console.log(userId);

        // let mockedHistory: Array<Message> = [];

        // console.log(this.dataMsg[userId]);
        // if(this.dataMsg[userId]){
        //     mockedHistory = this.dataMsg[userId];
        // }

        // if(called == 0){
        //     this.getMessage(userId);
        // }

        // return of(mockedHistory);

        var params = {
            NoLoader: 1,
            currentid: this.userId,
            userid: userId
        }

        var D = this.core.Separator();

        var headers = new Headers({
            "Accept"        : "application/json", 
            "Content-Type"  : "application/x-www-form-urlencoded;" + D + ";", 
        });
        let options = new RequestOptions({
            headers: headers
        });

        var KUNCI_ASLI = D;
            KUNCI_ASLI = KUNCI_ASLI.toString();
            var KUNCI = KUNCI_ASLI.substr(0, 8);
            KUNCI = KUNCI + KUNCI_ASLI.substr(-8);

            delete params['d'];

            params = JSON.parse(JSON.stringify(params));

            Object.keys(params).map((key) => {
                var VAL = encodeURIComponent(this.core.Base65Encode(params[key], KUNCI));

                //=> Check No Encryption
                var Check = params[key];
                //console.log(key + " - " + Check);

                if(this.core.hasUnicode(params[key])){
                    params[this.core.Base65Encode(key, KUNCI)] = "NE---" + encodeURIComponent(params[key]);
                }else{
                    if(Check !== null && Check != ''){
                        if(Check.length > 5){
                            Check = Check.toString();
                            if(Check.substr(0, 5) == "NE---"){
                                VAL = encodeURIComponent(params[key]);
                            }
                        }

                        params[this.core.Base65Encode(key, KUNCI)] = VAL;
                    }
                }

                delete params[key];
            });

        var url = this.core.Config().host + '/e/chat.get';
        return this.http.post(url, this.core.formData(params), options).map(
            res => {
                var Data = res.json();
                var R = [];
                if(Data.data){

                    var formatted = [];
                    for(let item of Data.data){
                        formatted.push({
                            fromId: item.fromid,
                            toId: item.toid,
                            message: item.message,
                            dateSent: moment(item.datesent, 'YYYY-MM-DD HH:mm:ss'),
                            dateSeen: moment(item.datesent, 'YYYY-MM-DD HH:mm:ss'),
                        })
                    }

                    formatted = _.orderBy(formatted, ['dateSent'], ['asc']);
                    R = formatted;
                }
                return R;
            }
        );
    }

    sendMessage(message: Message): void {
        this.socket.emit("sendMessage", message);
        // this.getMessage(this.userId);

        var Params = {
            fromid: message.fromId,
            toid: message.toId,
            message: message.message,
            datesent: moment(message.dateSent).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            NoLoader: 1
        }
        this.core.Do('e/chat', Params).subscribe(() => {
            // this.getMessage(this.userId);
        });
        console.log('sendMessage', Params);
    }

    public InitializeSocketListerners(): void {
    	this.socket.on("messageReceived", (messageWrapper) => {
    		// Handle the received message to ng-chat

            if(this.userId == messageWrapper.message.toId){
                console.log('Received', messageWrapper);
                this.onMessageReceived(messageWrapper.user, messageWrapper.message);
            }
    	});

    	this.socket.on("friendsListChanged", (usersCollection: Array < ParticipantResponse > ) => {
            // Handle the received message to ng-chat
    		this.onFriendsListChanged(usersCollection.filter(x => x.participant.id != this.userId));
    	});
    }
}
