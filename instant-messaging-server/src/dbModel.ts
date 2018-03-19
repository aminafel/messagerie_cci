import { MongoClient, Db} from 'mongodb';
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

export class DbModel {
    
    database: Db = null;
    public constructor() {
        MongoClient
            .connect("mongodb://localhost:27017")
            .then( (db: Db) => this.database = db.db('dbMessagerie') )
            .catch( (reason) => console.log(reason) );
    }
    
    async addUser(username: string, password: string, mail: string): Promise<void> {
        const i = await this.getCountersId();
        const hash = await this.hashPassword(password);
        await this.database.collection('users')
        .insertOne({_id:i[0].sequence_value, username: username, password: hash, mail: mail });
    }

    async checkIfUserExists( username: string): Promise<any> {
        return await this.database.collection('users').find({username:username}).count();
    }

    async checkIfMailExists(mail: string): Promise<any> {
        return await this.database.collection('users').find({mail: mail}).count();
    }

    async hashPassword (password): Promise <any> {
        return await bcrypt.hash(password, SALT_WORK_FACTOR);
    }

    async checkIfPasswordMatches (username: string): Promise <any> {
        return await this.database.collection('users').find({username:username}).toArray();
    }
    
    async verifyPasswordWithHashCode (username, password): Promise <any> {
        const i = await this.checkIfPasswordMatches(username);
        const hash = i[0].password;
        return await bcrypt.compare(password, hash);
    }

    async counters(): Promise<void> {
        await this.database.collection('users').insertOne({_id:"tid",sequence_value:0});
    }

    async getCountersId(): Promise <any> {
        try{
            await this.updateId();
            return await this.database.collection('counters').find().toArray();
        }catch (e){
            console.log('error: '+e);
        }
    }
    async updateId(): Promise <void>{
        try{
        await this.database.collection('counters').updateOne(
            {_id: "tid"},
            { $inc: { sequence_value: 1 } },
            true
        );
        }catch (e){
            console.log('error'+e);
        }
    }

    async addMessage(content: string, author: string, date: Date): Promise<void> {
        await this.database.collection('messages').insertOne({ content: content, author: author, date: date });
    }
    async message(): Promise <string[]> {
      return this.database.collection('messages').find().toArray();
    }

    
}