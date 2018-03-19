import {connection as WebSocketConnection} from 'websocket';
import { Server } from "./server";
import { DbModel } from "./dbModel";

export class Client {
    private usernameRegex = /^[a-zA-Z0-9]*$/;
    private username: string = null;

    public constructor(private server: Server, private connection: WebSocketConnection, private db: DbModel) {
        connection.on('message', (message)=>this.onMessage(message.utf8Data));
        connection.on('close', ()=>server.removeClient(this));
        connection.on('close', ()=>server.broadcastUsersList());
        connection.on('close', ()=>server.broadcastUserConnection('disconnection',this.username));
    }

    private sendMessage(type: string, data: any): void {
        const message = {type: type, data: data};
        this.connection.send(JSON.stringify(message));
    }
   
    public sendUsersList(content: string[]) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }

    public sendInstantMessage(content: string, author: string, date: Date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
        console.log('addMessage succeded...');   
        this.db.addMessage(content, author, date);   
    }

    public sendInvitation(dest : string, username: string){
        const invitation = [dest, username];
        this.sendMessage('invitation', invitation);
            
      /*  const i = await this.db.checkIfContactExists(dest);
        const j = await this.db.checkIfUserExists(dest); 
        if (i === 1 )return;
        if (j ==! 1 )return;
        if (dest===username)return;
        else {
            this.sendMessage('invitation', invitation);
            this.db.addInvitation(dest, username);
        } */
    }
    public sendRemoveInvitation(removeInvitation: string ){
        this.sendMessage('removeInvitation', removeInvitation);
            //this.db.remooveInvitation(invitation, this.username);

    }
    public sendContact(dest: string , username: string ) {
       const contact = [dest, username];
       this.sendMessage('contact', contact);
        /*  this.sendMessage('contact', contact)
            this.db.addcontact(dest, username);   
            
         */
    }
    public sendOkInviation(contact: string ){
        const okInvitation = contact;
        this.sendMessage( 'okInvitation', okInvitation);
        /*this.sendMessage( 'okInvitation', okInvitation);
            this.db.addcontact(dest, this.username);  
            */

    }
    
    public sendUserConnection(connection: string, username: string){
        this.sendMessage(connection, username);
    }

    private onInstantMessage(content: string, participants: string[]): void {
        if (!(typeof 'content' === 'string')) return;
        if (this.username==null) return;
        this.server.broadcastInstantMessage(content, this.username, participants);
    }

    private onInvitation(dest){
        this.server.broadcastInvitation(dest, this.username);
    }
    private removeInvitaion(invitation){
        this.server.broadcastRemoveInviation(invitation, this.username);
    }

    
    private onContact(dest) {
        this.server.broadcastContact(dest, this.username);
    }
    private onOkInvitation(contact){
        this.server.broadcastOkInvitation(contact, this.username);
    }


    async onUserLogin(username, password) {
        const i = await this.db.checkIfUserExists(username);
        if (i === 1 ){ 
            const verifyPassword = await this.db.verifyPasswordWithHashCode (username, password);  
            if (!verifyPassword){
                this.sendMessage('login', 'Mot de passe incorrect');
                return;
            } else {
            this.username = username;
            this.sendMessage('login', 'ok');
            this.server.broadcastUsersList();
            this.server.broadcastUserConnection('connection', username); 
            }
        } else {
            this.sendMessage('login', 'Login non reconnu');
            return;
        }     
        
    }

    async onUserSubscription(username, password, mail) {
        const i = await this.db.checkIfMailExists(mail);
        const j = await this.db.checkIfUserExists(username); 
        if (i === 1 ){ 
            this.sendMessage('subscription', 'Compte déjà existant');
            return;
        } else if (j === 1 ){
            this.sendMessage('subscription', 'Pseudo déjà utilisé');
            return;
        } else {
            this.db.addUser(username, password, mail);   
            this.sendMessage('subscription', 'ok');
        }
    }


    private onMessage(utf8Data: string): void {
        const message = JSON.parse(utf8Data);
        switch (message.type) {
            case 'instant_message': this.onInstantMessage(message.data.content, message.data.participants); break;
            case 'userSubscription': this.onUserSubscription(message.data.username, message.data.password, message.data.mail); break;
            case 'userLogin': this.onUserLogin(message.data.username, message.data.password); break;
            case 'invitation': this.onInvitation(message.data); break;
            case 'contact': this.onContact(message.data); break;
            case 'okInvitation': this.onOkInvitation(message.data); break;
            case 'removeInvitation': this.removeInvitaion(message.data); break;
            case 'discussion': this.onFetchDiscussion(message.data); break;
            case 'createDiscussion': this.onCreateDiscussion(message.data); break;  
       }
    }

    private onFetchDiscussion(discussionId: number){
        console.log('FetchDiscussion arrivé côté serveur');
/*        this.sendMessage('discussion', 
            {discussionId, this.db.getParticipants(discussionId), this.db.getHistory(discussionId)};
  */
   }

    private onCreateDiscussion(contact: string){
        console.log('onCreate arrivé côté serveur');
//        this.onFetchDiscussion(this.db.addDiscussion(this.username, contact));
    }

    public getUserName(){
        return this.username;
    }

}