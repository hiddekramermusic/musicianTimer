import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express'
import expressWs from 'express-ws'
import http from 'http'
import { Socket } from 'dgram';

// Our port
let port = 3000;

// App and server
let app = express();
let server = http.createServer(app).listen(port);    

// Apply expressWs
expressWs(app, server);

app.use(express.static(__dirname + '/views'));

class wsStore {
    wsArray = [];

    addWebSocket (ws) {
        this.wsArray.push(ws);
    }

    removeWebSocket (ws) {
        this.wsArray = this.wsArray.filter(socket => socket != ws);
    }

    getWebSockets() {
        return this.wsArray;
    }
}

let websockets = new wsStore();

// Get the route / 
app.get('/', (req, res) => {
    res.status(200).send("Welcome to our app");
});

// Get the /ws websocket route
app.ws('/ws', async function(ws, req) {
    console.log("New connection has opened! Total number of current connections: " + websockets.getWebSockets().length)
    websockets.addWebSocket(ws);

    ws.on('close', async function() {
        websockets.removeWebSocket(ws);
        console.log("A connection closed, total nr. of connections: " + websockets.getWebSockets().length)
    });

    ws.on('message', async function(msg) {
        console.log("Received message: " + msg);
        let parsedMessage = JSON.parse(msg);
        switch (parsedMessage.id) {
            case ('startTimers'):
                startTimers();
                break;
            case ('stopTimers'):
                stopTimers();
                break;
            case ('resetTimers'):
                resetTimers();
                break;
            case ('setNewTimerValues'):
                setNewTimerValues(parsedMessage.hours,parsedMessage.minutes,parsedMessage.seconds);
                break;
            default:
                ws.send(JSON.stringify({"id" : "error", "message" : "message not understood"}));
        };
    });
});

function startTimers() {
    websockets.getWebSockets().forEach(ws => {
        ws.send(JSON.stringify({"id" : "startTimer"}));
    });
};

function stopTimers() {
    websockets.getWebSockets().forEach(ws => {
        ws.send(JSON.stringify({"id" : "stopTimer"}));
    });
};

function resetTimers() {
    websockets.getWebSockets().forEach(ws => {
        ws.send(JSON.stringify({"id" : "resetTimer"}));
    })
}

function setNewTimerValues(hours, minutes, seconds) {
    websockets.getWebSockets().forEach(ws => {
        ws.send(JSON.stringify({"id": "setNewTimerValues", "hours" : hours, "minutes" : minutes, "seconds" : seconds}));
    });
};