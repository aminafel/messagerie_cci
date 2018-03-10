export class Db {
    
    private MongoClient = require('mongodb').MongoClient;
    private urlCreation = "mongodb://localhost:27017/dbMessagerie";
    private urlConnection = "mongodb://localhost:27017/";
        
    public constructor() {
       /*
        this.MongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            console.log("Connected to database!");
        });
        */
       /*
        this.MongoClient.connect(this.urlConnection, function(err, db) {
            if (err) throw err;
            var dbo = db.db("dbMessagerie");
            dbo.createCollection("users", function(err, res) {
              if (err) throw err;
              console.log("Collection created!");
              db.close();
            });
        });
        */
    }

    public addLogin(username: string){
        this.MongoClient.connect(this.urlConnection, function(err, db) {
            if (err) throw err;
            var dbo = db.db("dbMessagerie");
            var myobj = {name: username};
            dbo.collection("users").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });
        });
        this.getUsers();
    }

    public getUsers(){
        this.MongoClient.connect(this.urlConnection, function(err, db) {
            if (err) throw err;
            var dbo = db.db("dbMessagerie");
            dbo.collection("users").find({}).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                db.close();
            });
        });
    }



}

