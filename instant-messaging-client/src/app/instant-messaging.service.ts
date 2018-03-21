import { Injectable } from '@angular/core';
import { InstantMessage } from './instant-message';
import { RoutingService } from './routing.service';
import { Discussion } from './discussion'
import { DiscussionsListItem } from './discussions-list-item';
import { User } from './user'


@Injectable()
export class InstantMessagingService {
  private user: User;
  private users: string [] = [];
  private socket: WebSocket;
  private logged: boolean;
  private errorMessage: string;
  private invitations: string[] = [];
  private contacts: string [] = [];
  private discussions: string[]; // liste des numéros de discussion
  private discussionsComplete: DiscussionsListItem[];
  private currentDiscussion: Discussion;
  private messages: InstantMessage[] = [];

  public askDiscussion(contact: string) {
    /*for (const discussion of this.discussions) {
      if (discussion.participants.length === 2 && !(discussion.participants.indexOf(contact) === -1)) {
        console.log('discussion trouvee');
        this.sendFetchDiscussion(discussion.id); //  récupère la première discussion correspondante
        break;
      }
      if (discussion.id === this.discussions[this.discussions.length - 1].id) {
        console.log('createDiscussion avec ' + contact);*/
        this.sendCreateDiscussion(contact); // crée la discussion
     // }
   // }
  }

  private onFetchDiscussion(discussion: Discussion) {
    console.log('arrivé dans onFetchDiscussion du service' + discussion.discussionId);

    this.currentDiscussion = new Discussion (discussion.discussionId, discussion.participants, discussion.history);
    console.log('changé currentDiscussion.id' + this.currentDiscussion.discussionId);
    console.log('participants ' + this.currentDiscussion.participants);
    this.messages = this.currentDiscussion.history; // à supprimer après refactoring
  }

  private onInstantMessage(message: InstantMessage) {
    this.messages.push(message);
    console.log('nouveau message');
  }

  private onUserStatusChange(userslist: string []) {
    this.users = userslist;
    console.log(this.users);
  }

  private onOwnUser(user: User) {
    this.user = user;
    this.invitations = user.invitations;
    this.contacts = user.contacts;
    this.discussions = user.discussions;
    console.log(this.user);
  }

  private onConnection(username: string) {
    this.messages.push(new InstantMessage(username + ' vient de rejoindre la conversation', 'Message Automatique', new Date()));
  }

  private onDisconnection(username: string) {
    this.messages.push(new InstantMessage(username + ' vient de quitter la conversation', 'Message Automatique', new Date()));
  }

    private onInvitation(invitation: string[]) {
      this.invitations.push(invitation[1]);
      console.log(this.invitations);
    }
  
   private   onContact(contact: string[]) {
      this.contacts.push(contact[1]);
      console.log(this.contacts);
    }

    private onOkInvitation(contact: string  ) {
      this.contacts.push(contact);
      console.log(this.contacts);
      }
  private onMessage(data: string) {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'instant_message': this.onInstantMessage(message.data); break;
      case 'login': this.onLogin(message.data); break;
      case 'users_list': this.onUserStatusChange(message.data); break;
      case 'connection': this.onConnection(message.data); break;
      case 'disconnection': this.onDisconnection(message.data); break;
      case 'subscription': this.onSubscription(message.data); break;
      case 'invitation': this.onInvitation(message.data); break;
      case 'contact': this.onContact(message.data); break;
      case 'okInvitation': this.onOkInvitation(message.data); break;
      case 'removeInvitation': this.removeInvitation(message.data); break;
      case 'discussion' : this.onFetchDiscussion(message.data); break;
      case 'ownUser': this.onOwnUser(message.data); break;
    }
  }

  public constructor(private routing: RoutingService) {
    this.logged = false;
    this.socket = new WebSocket('ws:/localhost:4201');
    this.socket.onmessage = (event: MessageEvent) => this.onMessage(event.data);
  }

  public removeInvitation(invitation: string) {
    const index = this.invitations.indexOf(invitation);
    this.invitations.splice(index, 1);
  }

  

  public getMessages(): InstantMessage[] {
    return this.messages;
  }

  public getUsers(): string[] {
    return this.users;
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }

  public getInvitations(): string[] {
    return this.invitations;
  }

  public getContacts(): string[] {
    return this.contacts;
  }
  public getDiscussions(): string[] {
    return this.discussions;
  }
  /* public getDiscussions(): DiscussionsListItem[] {
    return this.discussions;
  }*/

  public sendMessage(type: string, data: any) {
    const message = {type: type, data: data};
    this.socket.send(JSON.stringify(message));
  }

  public sendInstantMessage(content: string) {
    console.log('discussionId : ' + this.currentDiscussion.discussionId 
      +'content : '+content+' participants : '+this.currentDiscussion.participants);
    const privateMessage = {discussionId : this.currentDiscussion.discussionId,
      content : content, participants : this.currentDiscussion.participants};
    this.sendMessage('instant_message', privateMessage);
  }

  public sendInvitation(invitation: string) {
    this.sendMessage('invitation', invitation);
  }

  public sendContact(contact: string) {
    this.sendMessage('contact', contact);
  }
  public sendRemoveInvitation(invitation: string) {
    this.sendMessage('removeInvitation', invitation);
  }
  public sendOkInvitation (okInvitation: string ) {
    this.sendMessage('okInvitation', okInvitation);
 }

  public sendFetchDiscussion(discussionId: string) {
    console.log('sendFetchDiscussion' + discussionId);
    this.sendMessage('discussion', discussionId);
  }

  private sendCreateDiscussion(contact: string) {
    this.sendMessage('createDiscussion', contact);
  }

  public sendAddParticipant(contact: string) {
    const addParticipant = {discussionId: this.currentDiscussion.discussionId, contact: contact};
    this.sendMessage('addParticipant', addParticipant);
  }

  public sendQuitDiscussion() {
    this.sendMessage('quitDiscussion', this.currentDiscussion.discussionId);
  }

  private onLogin(state: string) {
    if (state === 'ok') {
      this.logged = true;
      this.routing.goChat();
    } else {
      this.errorMessage = state;
      this.routing.goError();
    }
  }

  private onSubscription(state: string) {
    if ( state === 'ok') {
      this.routing.goLogin();
    } else if (state === 'Pseudo déjà utilisé') {
      this.errorMessage = state;
      this.routing.goError();
    } else if (state === 'Compte déjà existant') {
      this.errorMessage = state;
      this.routing.goError();
    } else {
      this.routing.goError();
    }
  }


  public isLogged(): boolean {
    return (this.logged);
  }

  public sendLogin(username: string, password: string) {
    this.sendMessage('userLogin', {username: username, password: password});
  }

  public sendSubscription(username: string, password: string, mail: string) {
    this.sendMessage('userSubscription', {username: username, password: password, mail: mail});
  }
}
