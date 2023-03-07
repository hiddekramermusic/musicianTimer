<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {TimingObject} from "timing-object";
import { TimingProvider } from 'timing-provider';
import { tsIndexSignature, whileStatement } from "@babel/types";

let socket : WebSocket;
let timingProviderPort = ':4000';
let timingprovider : TimingProvider;
let ts : any;
let now: number;
let connectedStatus = 'Not Connected!';
let message = '';

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
                desiredHours.value = parseInt(parsedMessage.hours);
                desiredMinutes.value = parseInt(parsedMessage.minutes);
                desiredSeconds.value = parseInt(parsedMessage.seconds);
                skipToTimeCode();
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

function startTimerObject() : void {
    try {
        timer = new TimingObject(new TimingProvider('ws://' + window.location.hostname + timingProviderPort));
    } catch (err) { console.error(err) };
    timerObjectStarted.value = true;
    timer.update({ velocity: 0 });
    timer.update({ position: 0 });
}

startTimerObject();
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
    timer.update({ position: 0 });
};

function resetTimer(): void {
    stopTimer();
    seconds.value = 0;
    minutes.value = 0;
    hours.value = 0;
}

function skipToTimeCode () {
    if (desiredHours.value < 0 || desiredMinutes.value < 0 || desiredSeconds.value < 0) {
        return
    }
    hours.value = desiredHours.value;
    if (desiredMinutes.value >= 60) {
        minutes.value = desiredMinutes.value % 60;
        hours.value += Math.floor(desiredMinutes.value/60);
    } else {
        minutes.value = desiredMinutes.value;
    }
    if (desiredSeconds.value >= 60) {
        seconds.value = desiredSeconds.value % 60;
        minutes.value += Math.floor(desiredSeconds.value/60);
        if (minutes.value >= 60) {
            hours.value += Math.floor(minutes.value/60);
            minutes.value = minutes.value % 60;
        }
    } else {
        seconds.value = desiredSeconds.value;
    }
}

requestAnimationFrame(function incrementTimer() {
    if (timerStarted.value == true) {
        let timeVector = timer.query();
        // console.log(timeVector);
        let currentSeconds = Math.floor(timeVector.position)
        if (currentSeconds > lastTimerValue.value) {
            seconds.value++
            lastTimerValue.value = currentSeconds
        };
        seconds.value = seconds.value % 60;
        if (seconds.value % 60 == 0) {
            if (minutesLock.value == false){
                minutes.value++;
                minutesLock.value = true;
            } 
        } else {
            minutesLock.value = false;
        }
        if (minutes.value % 60 == 0) {
            if (hoursLock.value == false) {
                hours.value++
                hoursLock.value = true;
            }
        } else {
            hoursLock.value = false;
        }
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