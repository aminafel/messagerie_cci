"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const db_1 = require("./db");
var db = new db_1.Db;
new server_1.Server(4201, db);
