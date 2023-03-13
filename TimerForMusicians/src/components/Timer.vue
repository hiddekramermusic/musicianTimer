<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {TimingObject} from "timing-object";
import { TimingProvider } from 'timing-provider';
import { tsIndexSignature, whileStatement } from "@babel/types";

let socket : WebSocket;
let timingProviderPort = ':4000';
let timingprovider : typeof TimingProvider;
let ts : any;
let now: number;
let connectedStatus = 'Not Connected!';
let message = '';

let timer: any;
let timerObjectStarted = ref(false);
let timerStarted = ref(false);
let lastTimerValue = ref(0);

let seconds = ref(0);
let minutes = ref(0);
let hours = ref(0);

let hoursLock = ref(true);
let minutesLock = ref(true);

let desiredSeconds = ref(0);
let desiredMinutes = ref(0);
let desiredHours = ref(0);


function setupWebSocket() {
    const socketProtocol = (window.location.protocol === 'https:' ? 'wss' : 'ws:');
    const socketport = ':3000';
    const echoSocketurl = socketProtocol + '//' + window.location.hostname + socketport + '/ws';

    socket = new WebSocket(echoSocketurl);

    socket.onopen = () => {
        console.log('Websocket connected.');
        connectedStatus = 'Connected';
    };

    socket.onmessage = (msg) => {
        let parsedMessage = JSON.parse(msg.data);
        console.log(parsedMessage);
        switch(parsedMessage.id) {
            case ('startTimer'):
                startTimer();
                break;
            case ('stopTimer'):
                stopTimer();
                break;
            case('resetTimer'):
                resetTimer();
                break;
            case ('setNewTimerValues'):
                let hours = parseFloat(parsedMessage.hours);
                let minutes = parseFloat(parsedMessage.minutes);
                let seconds = parseFloat(parsedMessage.seconds);
                stopAllTimers();
                skipToTimeCode(hours, minutes, seconds);
                break;
            case ('supplyYourTimes'):
                socket.send(JSON.stringify({
                    "id" : "suppliedTimes",
                    "running" : timerStarted.value
                }));
                break;
            case ('updateTimesOnLoad'):
                if (parsedMessage.running === true) {
                    startTimer();
                };
                break;

        }
    }
};

setupWebSocket();

function waitForOpenConnection() {
    return new Promise((resolve, reject) => {
        const maxAttempts = 10;
        const intervalTime = 200;

        let currentAttempt = 0;
        const interval = setInterval(() => {
            if (currentAttempt > maxAttempts - 1) {
                clearInterval(interval);
                reject(new Error('Max nr. of ws connection attempts reached'));
            } else if (socket.readyState === socket.OPEN) {
                clearInterval(interval);
                resolve(0);
            }
            currentAttempt++
        }, intervalTime);
    });
}

async function sendMessage(message: any) {
    if (socket.readyState !== socket.OPEN) {
        try {
            await waitForOpenConnection();
        } catch (err) { console.error(err) }
    } else {
        socket.send(message);
    }
}

async function startTimerObject() : Promise<unknown> {
    await waitForOpenConnection();
    return new Promise((resolve, reject) => {
        try {
            timer = new TimingObject(new TimingProvider('ws://' + window.location.hostname + timingProviderPort));
            resolve(0)
        } catch (err) { reject(new Error("Could not set up Timing Object!")) };
    });
}

startTimerObject().then((promise) => {
    if (promise == 0) {
        timerObjectStarted.value = true;
        timer.update({ velocity: 0 });
        timer.update({ position: 0 });
        socket.send(JSON.stringify({"id" : "getTimerValuesOnLoad"}));
    } else {
        console.error(promise);
        window.alert(promise);
    }
});
//Global (via server) timer functions:

function startAllTimers() : void {
    sendMessage(JSON.stringify({
        "id" : "startTimers"
    }));
};

function stopAllTimers() : void {
    sendMessage(JSON.stringify({
        "id" : "stopTimers"
    }));
}

function resetAllTimers() : void {
    sendMessage(JSON.stringify({
        "id" : "resetTimers"
    }));
}

function skipToTimeCodeAll() : void {
    sendMessage(JSON.stringify({
        "id" : "setNewTimerValues",
        "hours" : desiredHours.value,
        "minutes" : desiredMinutes.value,
        "seconds" : desiredSeconds.value
    }))
}


//Local timer functions:

function startTimer() : void {
    timer.update({ velocity: 1 });
    timerStarted.value = true;
    hoursLock.value = true;
    minutesLock.value = true;
};

function stopTimer() : void {
    timerStarted.value = false;
    lastTimerValue.value = 0;
    timer.update({ velocity: 0 });
};

function resetTimer(): void {
    stopTimer();
    timer.update({ position: 0 });
}

function skipToTimeCode (hours: number, minutes: number, seconds: number) {
    if (hours < 0 || minutes < 0 || seconds < 0) {
        return
    }
    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
        return
    }
    let newPos = (hours * 3600) + (minutes * 60) + seconds;
    timer.update({position: newPos} );
}

requestAnimationFrame(function incrementTimer() {
    let timeVector = null;
    try {
        timeVector = timer.query();
    } catch (err) {
        console.error(err)
    }
    if (timeVector != null) {
        console.log(timeVector);
        seconds.value = Math.floor(timeVector.position % 60);
        minutes.value = Math.floor(timeVector.position / 60) % 60;
        hours.value = Math.floor(timeVector.position / 3600);
    }
    requestAnimationFrame(incrementTimer);
});
</script>

<template>
    <div v-if="timerObjectStarted == true">
        <span><p>h/m/s</p><h1 style="font-size: 10em; max-width: 90vw;">{{ hours }}:{{ minutes }}:{{ seconds }}</h1></span>
        <button @click="startAllTimers">Start</button>
        <button @click="stopAllTimers">Stop</button>
        <button @click="resetAllTimers">Reset</button> 
        <br><br><hr><br><br>
        <h1><input type="number" v-model="desiredHours" placeholder="hours" />:<input type="number" v-model="desiredMinutes" placeholder="minutes"/>:<input type="number" v-model="desiredSeconds" placeholder="seconds"></h1>        
        <button @click="skipToTimeCodeAll">Choose new time</button>
    </div>
    <div v-else>
        <h1>Loading..</h1>
    </div>
</template>