import { Injectable } from '@angular/core';
import { InstantMessage } from './instant-message';
import { RoutingService } from './routing.service';


@Injectable()
export class InstantMessagingService {
  private messages: InstantMessage[] = [];
  private users: string [] = [];
  private contacts: string []= [];
  private socket: WebSocket;
  private logged: boolean;
  private invitations: string[] = [];

  private onInstantMessage(message: InstantMessage) {
    this.messages.push(message);
    console.log('nouveau message');
  }

  private onUserStatusChange(userslist: string []) {
    this.users = userslist;
    console.log(this.users);
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
  private onDestContact(contact: string[]) {
    this.contacts.push(contact[1]);
    console.log(this.contacts);
  }



  private onMessage(data: string) {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'instant_message': this.onInstantMessage(message.data); break;
      case 'login': this.onLogin(); break;
      case 'loginAlreadyExists': this.routing.goError(); break;
      case 'users_list': this.onUserStatusChange(message.data); break;
      case 'connection': this.onConnection(message.data); break;
      case 'disconnection': this.onDisconnection(message.data); break;
      case 'invitation': this.onInvitation(message.data); break;
      case 'contact': this.onDestContact(message.data); break;
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

  public  onContact(contact: string  ) {
    this.contacts.push(contact);
    console.log(this.contacts);
  }

  public getUsers(): string[] {
    return this.users;
  }
  public getInvitations(): string[] {
    return this.invitations;
  }
  public getContacts(): string[] {
    return this.contacts;
  }

  public sendMessage(type: string, data: any) {
    const message = {type: type, data: data};
    this.socket.send(JSON.stringify(message));
  }
  public sendInvitation(invitation: string) {
    this.sendMessage('invitation', invitation);
  }
  public sendContact(contact: string) {
    this.sendMessage('contact', contact);
  }

  public sendInstantMessage(content: string) {
    this.sendMessage('instant_message', content);
  }

  private onLogin() {
    this.logged = true;
    this.routing.goChat();
   }

  public isLogged(): boolean {
    return (this.logged);
  }

  public sendUsername(username: string, password: string) {
    this.sendMessage('username', username);
  }
}