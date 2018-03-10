import { Server } from "./server";
import { Db } from "./db";
var db = new Db;
new Server(4201, db);

