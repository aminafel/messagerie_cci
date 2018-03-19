"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(server, connection, db) {
        this.server = server;
        this.connection = connection;
        this.db = db;
        this.usernameRegex = /^[a-zA-Z0-9]*$/;
        this.username = null;
        connection.on('message', (message) => this.onMessage(message.utf8Data));
        connection.on('close', () => server.removeClient(this));
        connection.on('close', () => server.broadcastUsersList());
        connection.on('close', () => server.broadcastUserConnection('disconnection', this.username));
    }
    sendMessage(type, data) {
        const message = { type: type, data: data };
        this.connection.send(JSON.stringify(message));
    }
    sendUsersList(content) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }
    sendInstantMessage(content, author, date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
        console.log('addMessage succeded...');
        this.db.addMessage(content, author, date);
    }
    sendInvitation(dest, username) {
        const invitation = [dest, username];
        this.sendMessage('invitation', invitation);
        /*  const i = await this.db.checkIfContactExists(dest);
          const j = await this.db.checkIfUserExists(dest);
          if (i === 1 )return;
          if (j ==! 1 )return;
          else {
              this.sendMessage('invitation', invitation);
              this.db.addInvitation(dest, username);
          } */
    }
    sendRemoveInvitation(removeInvitation) {
        this.sendMessage('removeInvitation', removeInvitation);
        //this.db.remooveInvitation(invitation, this.username);
    }
    sendContact(dest, username) {
        const contact = [dest, username];
        this.sendMessage('contact', contact);
        /*  this.sendMessage('contact', contact)
            this.db.addcontact(dest, username);
            
         */
    }
    sendOkInviation(contact) {
        const okInvitation = contact;
        this.sendMessage('okInvitation', okInvitation);
        /*this.sendMessage( 'okInvitation', okInvitation);
            this.db.addcontact(dest, this.username);
            */
    }
    sendUserConnection(connection, username) {
        this.sendMessage(connection, username);
    }
    onInstantMessage(content, participants) {
        if (!(typeof 'content' === 'string'))
            return;
        if (this.username == null)
            return;
        this.server.broadcastInstantMessage(content, this.username, participants);
    }
    onInvitation(dest) {
        this.server.broadcastInvitation(dest, this.username);
    }
    removeInvitaion(invitation) {
        this.server.broadcastRemoveInviation(invitation, this.username);
    }
    onContact(dest) {
        this.server.broadcastContact(dest, this.username);
    }
    onOkInvitation(contact) {
        this.server.broadcastOkInvitation(contact, this.username);
    }
    onUserLogin(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.db.checkIfUserExists(username);
            if (i === 1) {
                const verifyPassword = yield this.db.verifyPasswordWithHashCode(username, password);
                if (!verifyPassword) {
                    this.sendMessage('login', 'Mot de passe incorrect');
                    return;
                }
                else {
                    this.username = username;
                    this.sendMessage('login', 'ok');
                    this.server.broadcastUsersList();
                    this.server.broadcastUserConnection('connection', username);
                }
            }
            else {
                this.sendMessage('login', 'Login non reconnu');
                return;
            }
        });
    }
    onUserSubscription(username, password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.db.checkIfMailExists(mail);
            const j = yield this.db.checkIfUserExists(username);
            if (i === 1) {
                this.sendMessage('subscription', 'Compte déjà existant');
                return;
            }
            else if (j === 1) {
                this.sendMessage('subscription', 'Pseudo déjà utilisé');
                return;
            }
            else {
                this.db.addUser(username, password, mail);
                this.sendMessage('subscription', 'ok');
            }
        });
    }
    onMessage(utf8Data) {
        const message = JSON.parse(utf8Data);
        switch (message.type) {
            case 'instant_message':
                this.onInstantMessage(message.data.content, message.data.participants);
                break;
            case 'userSubscription':
                this.onUserSubscription(message.data.username, message.data.password, message.data.mail);
                break;
            case 'userLogin':
                this.onUserLogin(message.data.username, message.data.password);
                break;
            case 'invitation':
                this.onInvitation(message.data);
                break;
            case 'contact':
                this.onContact(message.data);
                break;
            case 'okInvitation':
                this.onOkInvitation(message.data);
                break;
            case 'removeInvitation':
                this.removeInvitaion(message.data);
                break;
            case 'discussion':
                this.onFetchDiscussion(message.data);
                break;
            case 'createDiscussion':
                this.onCreateDiscussion(message.data);
                break;
        }
    }
    onFetchDiscussion(discussionId) {
        console.log('FetchDiscussion arrivé côté serveur');
        /*        this.sendMessage('discussion',
                    {discussionId, this.db.getParticipants(discussionId), this.db.getHistory(discussionId)};
          */
    }
    onCreateDiscussion(contact) {
        console.log('onCreate arrivé côté serveur');
        //        this.onFetchDiscussion(this.db.addDiscussion(this.username, contact));
    }
    getUserName() {
        return this.username;
    }
}
exports.Client = Client;
