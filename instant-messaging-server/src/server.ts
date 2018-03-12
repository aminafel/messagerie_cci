import {server as WebSocketServer, connection as WebSocketConnection} from 'websocket';
import * as http from 'http';
import { Client } from "./client";
import { Db } from "./db";

export class Server {
    private clients: Client[] = []
    
    public constructor(port: number, private db: Db) {
        const server = this.createAndRunHttpServer(port);
        this.addWebSocketServer(server);
    }
    public broadcastInvitation (dest: string, username: string){
        for(const client of this.clients){
            if(client.getUserName()===dest)
                client.sendInvitation(dest, username);
        }
    }
    public broadcastContact ( dest: string, username: string){
        for(const client of this.clients){
            if(client.getUserName()===dest)
                client.sendContact( dest, username);
        }
    }
    
    public broadcastInstantMessage(content: string, author: string): void {
        const date = new Date();
        for (const client of this.clients) {
          client.sendInstantMessage(content, author, date);
        }
      }
    
    public broadcastUsersList(): void {
        for (const client of this.clients) {
          client.sendUsersList(this.getClientsList());
        }
      }

    public broadcastUserConnection(connection: string, username: string): void {
        switch (connection) {
            case 'connection': for (const client of this.clients) {
                client.sendUserConnection('connection', username);
            }; break;
            case 'disconnection': for (const client of this.clients) {
                client.sendUserConnection('disconnection', username);
            }; break;
        }
    }

    private getClientsList(): string[]{
        var usersList: string[]=[];
        for (const client of this.clients){
            usersList.push(client.getUserName());
        }
        return usersList;
    }

    private createAndRunHttpServer(port: number): http.Server {
        const server = http.createServer(function(request, response) {
            response.writeHead(404);
            response.end();
        });
        server.listen(port, function() {
            console.log((new Date()) + ' Server is listening on port '+port);
        });
        return server;
    }

    private addWebSocketServer(httpServer: http.Server): void {
        const webSocketServer = new WebSocketServer({
            httpServer: httpServer,
            autoAcceptConnections: false
        });
        webSocketServer.on('request', request=>this.onWebSocketRequest(request));
    }

    private onWebSocketRequest(request): void {
        const connection = request.accept(null, request.origin);
        const client = new Client(this, connection, this.db);
        this.clients.push(client);
    }

    removeClient(client: Client) {
        this.clients.splice(this.clients.indexOf(client), 1);
    }

}
