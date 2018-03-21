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
        //this.db.addMessage(content, author, date);   
    }

    async sendOwnUser(username: string){
        const userId = await this.db.getUserId(username);
        const invitations = 
        await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('invitations', username);
        const con = 
        await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('contacts', username);
        const contacts: string[] = [];
        for (let i = 0; i < con.length; i++){
            contacts[i] = con[i].idUser;
            console.log('contact = '+contacts[i])
        }
        const discussions = 
        await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('id_discussion', username);
        const dataUser = {userId, username,
        invitations, contacts, discussions};
        this.sendMessage('ownUser', dataUser);
    }

    async sendInvitation(dest : string, username: string){
        if (dest===username)return;
        const invitation = [dest, username];
        this.sendMessage('invitation', invitation);
        

        const usernameInvitations = await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection ('invitations', this.username);
        const id_dest = await this.db.getUserId(dest);

        const b = await this.db.verifyIfExistInContact_Invitation('invitations', username, dest);
        if (b ===0) {
            await this.db.addContactsOrInvitationsInUsersCollection ("invitations", username, dest);
        }
    }

    public  sendContact(dest: string , username: string ) {
       const contact = [dest, username];
       this.sendMessage('contact', contact);
    }
   
    public sendUserConnection(connection: string, username: string){
        this.sendMessage(connection, username);
    }

    private onInstantMessage(discussionId: string, content: string, participants: string[]): void {
        if (!(typeof 'content' === 'string')) return;
        if (this.username==null) return;
        this.server.broadcastInstantMessage(discussionId, content, this.username, participants);
    }

    private onInvitation(dest){
        this.server.broadcastInvitation(dest, this.username);
    }
    async removeInvitaion(invitation){
        this.sendMessage('removeInvitation', invitation);
        await this.db.deleteInvitationsOrContacts ("invitation",  invitation, this.username);
    }


    
    async onContact(dest) {
        const b = await this.db.verifyIfExistInContact_Invitation('contacts',this.username, dest);
        if (b === 0){
            await this.db.addContactsOrInvitationsInUsersCollection ("contacts", this.username, dest);
            await this.db.addContactsOrInvitationsInUsersCollection ("contacts", dest, this.username);
            
        }
        
        this.server.broadcastContact(dest, this.username);
    }
    async onOkInvitation(contact){
        const okInvitation = contact;
        this.sendMessage( 'okInvitation', okInvitation);
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
            this.sendOwnUser(username);
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
            //case 'instant_message': this.onInstantMessage(message.data.content, message.data.participants); break;
            case 'instant_message': this.onInstantMessage(message.data.discussionId, message.data.content, message.data.participants); break;
            case 'userSubscription': this.onUserSubscription(message.data.username, message.data.password, message.data.mail); break;
            case 'userLogin': this.onUserLogin(message.data.username, message.data.password); break;
            case 'invitation': this.onInvitation(message.data); break;
            case 'contact': this.onContact(message.data); break;
            case 'okInvitation': this.onOkInvitation(message.data); break;
            case 'discussion': this.onFetchDiscussion(message.data); break;
            case 'createDiscussion': this.onCreateDiscussion(message.data); break;
            case 'removeInvitation': this.removeInvitaion(message.data); break;
            case 'addParticipant': this.onAddParticipant(message.data.discussionId, message.data.contactId); break;  
            case 'quitDiscussion': this.onQuitDiscussion(message.data); break;  
       }
    }

    async onFetchDiscussion(discussionId) {
        console.log('on entre dans la fonction onFetchDiscussion ' + discussionId );
        const participants = await this.db.getParticipants(discussionId);
        console.log('FetchDiscussion ' + discussionId + ' : trouve participants' + participants[0] + participants[1]);
        const history = await this.db.getHistory(discussionId);        
        console.log('FetchDiscussion ' + discussionId + ' : trouve historique');
        const discussion = {discussionId, participants, history};
        this.sendMessage('discussion', discussion);

    }

    async onCreateDiscussion(contact: string) {
        console.log('on entre dans la fonction onCreateDiscussion avec ' + this.username + '' + contact);
        const discussionId = await this.db.createDiscussion(this.username, contact);
        console.log('a créé la disc et va la recharger ' + discussionId);
        this.onFetchDiscussion(discussionId);
        console.log('a chargé la disc ' + discussionId +'; onCreateDiscussion '+contact+' terminé' );
        await this.db.addDiscussionIdToUser(this.username, discussionId);
        await this.db.addDiscussionIdToUser(contact, discussionId);
    }

    async onAddParticipant(discussionId: string, contactId: string) {
        console.log('ajout participant a' + discussionId);
        await this.db.addDiscussionIdToUser(contactId, discussionId);
//        this.db.pushParticipant(discussionId, contactId)) doit trier les participants
// l'envoyer coté serveur pour qu'il rafraichisse la discussion de tous les participants
//        this.onFetchDiscussion(discussionId);
    }

    async onQuitDiscussion(discussionId: string) {
        console.log('quitte discussion' + discussionId);
//        this.db.pullParticipant(discussionId, this.username)); 2 méthodes
//        récupérer les infos liste des discussions
    }

    public getUserName(){
        return this.username;
    }


}

