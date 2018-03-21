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
        //this.db.addMessage(content, author, date);   
    }
    sendOwnUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield this.db.getUserId(username);
            const invitations = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('invitations', username);
            const con = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('contacts', username);
            const contacts = [];
            for (let i = 0; i < con.length; i++) {
                contacts[i] = con[i].idUser;
                console.log('contact = ' + contacts[i]);
            }
            const discussions = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('id_discussion', username);
            const dataUser = { userId, username,
                invitations, contacts, discussions };
            this.sendMessage('ownUser', dataUser);
        });
    }
    sendInvitation(dest, username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dest === username)
                return;
            const invitation = [dest, username];
            this.sendMessage('invitation', invitation);
            const usernameInvitations = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('invitations', this.username);
            const id_dest = yield this.db.getUserId(dest);
            const b = yield this.db.verifyIfExistInContact_Invitation('invitations', username, dest);
            if (b === 0) {
                yield this.db.addContactsOrInvitationsInUsersCollection("invitations", username, dest);
            }
        });
    }
    sendContact(dest, username) {
        const contact = [dest, username];
        this.sendMessage('contact', contact);
    }
    sendUserConnection(connection, username) {
        this.sendMessage(connection, username);
    }
    onInstantMessage(discussionId, content, participants) {
        if (!(typeof 'content' === 'string'))
            return;
        if (this.username == null)
            return;
        this.server.broadcastInstantMessage(discussionId, content, this.username, participants);
    }
    onInvitation(dest) {
        this.server.broadcastInvitation(dest, this.username);
    }
    removeInvitaion(invitation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendMessage('removeInvitation', invitation);
            yield this.db.deleteInvitationsOrContacts("invitation", invitation, this.username);
        });
    }
    onContact(dest) {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield this.db.verifyIfExistInContact_Invitation('contacts', this.username, dest);
            if (b === 0) {
                yield this.db.addContactsOrInvitationsInUsersCollection("contacts", this.username, dest);
                yield this.db.addContactsOrInvitationsInUsersCollection("contacts", dest, this.username);
            }
            this.server.broadcastContact(dest, this.username);
        });
    }
    onOkInvitation(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            const okInvitation = contact;
            this.sendMessage('okInvitation', okInvitation);
        });
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
                    this.sendOwnUser(username);
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
            //case 'instant_message': this.onInstantMessage(message.data.content, message.data.participants); break;
            case 'instant_message':
                this.onInstantMessage(message.data.discussionId, message.data.content, message.data.participants);
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
            case 'discussion':
                this.onFetchDiscussion(message.data);
                break;
            case 'createDiscussion':
                this.onCreateDiscussion(message.data);
                break;
            case 'removeInvitation':
                this.removeInvitaion(message.data);
                break;
            case 'addParticipant':
                this.onAddParticipant(message.data.discussionId, message.data.contactId);
                break;
            case 'quitDiscussion':
                this.onQuitDiscussion(message.data);
                break;
        }
    }
    onFetchDiscussion(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('on entre dans la fonction onFetchDiscussion ' + discussionId);
            const participants = yield this.db.getParticipants(discussionId);
            console.log('FetchDiscussion ' + discussionId + ' : trouve participants' + participants[0] + participants[1]);
            const history = yield this.db.getHistory(discussionId);
            console.log('FetchDiscussion ' + discussionId + ' : trouve historique');
            const discussion = { discussionId, participants, history };
            this.sendMessage('discussion', discussion);
        });
    }
    onCreateDiscussion(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('on entre dans la fonction onCreateDiscussion avec ' + this.username + '' + contact);
            const discussionId = yield this.db.createDiscussion(this.username, contact);
            console.log('a créé la disc et va la recharger ' + discussionId);
            this.onFetchDiscussion(discussionId);
            console.log('a chargé la disc ' + discussionId + '; onCreateDiscussion ' + contact + ' terminé');
            yield this.db.addDiscussionIdToUser(this.username, discussionId);
            yield this.db.addDiscussionIdToUser(contact, discussionId);
        });
    }
    onAddParticipant(discussionId, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('ajout participant a' + discussionId);
            yield this.db.addDiscussionIdToUser(contactId, discussionId);
            //        this.db.pushParticipant(discussionId, contactId)) doit trier les participants
            // l'envoyer coté serveur pour qu'il rafraichisse la discussion de tous les participants
            //        this.onFetchDiscussion(discussionId);
        });
    }
    onQuitDiscussion(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('quitte discussion' + discussionId);
            //        this.db.pullParticipant(discussionId, this.username)); 2 méthodes
            //        récupérer les infos liste des discussions
        });
    }
    getUserName() {
        return this.username;
    }
}
exports.Client = Client;
