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
const mongodb_1 = require("mongodb");
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
class DbModel {
    constructor() {
        this.database = null;
        mongodb_1.MongoClient
            .connect("mongodb://localhost:27017")
            .then((db) => this.database = db.db('dbMessagerie'))
            .catch((reason) => console.log(reason));
    }
    addUser(username, password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.getCountersId();
            const hash = yield this.hashPassword(password);
            yield this.database.collection('users')
                .insertOne({ _id: i[0].sequence_value, username: username, password: hash, mail: mail });
        });
    }
    checkIfUserExists(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection('users').find({ username: username }).count();
        });
    }
    checkIfMailExists(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection('users').find({ mail: mail }).count();
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt.hash(password, SALT_WORK_FACTOR);
        });
    }
    checkIfPasswordMatches(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection('users').find({ username: username }).toArray();
        });
    }
    verifyPasswordWithHashCode(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.checkIfPasswordMatches(username);
            const hash = i[0].password;
            return yield bcrypt.compare(password, hash);
        });
    }
    counters() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('users').insertOne({ _id: "tid", sequence_value: 0 });
        });
    }
    getCountersId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.updateId();
                return yield this.database.collection('counters').find().toArray();
            }
            catch (e) {
                console.log('error: ' + e);
            }
        });
    }
    updateId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.database.collection('counters').updateOne({ _id: "tid" }, { $inc: { sequence_value: 1 } }, true);
            }
            catch (e) {
                console.log('error' + e);
            }
        });
    }
    addMessage(content, author, date) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('messages').insertOne({ content: content, author: author, date: date });
        });
    }
    message() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.database.collection('messages').find().toArray();
        });
    }
}
exports.DbModel = DbModel;
