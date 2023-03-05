<script setup lang="ts">
import { ref, watch } from "vue";
import {TimingObject} from "timing-object";
import { tsIndexSignature, whileStatement } from "@babel/types";

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
    timer = new TimingObject();
    timerObjectStarted.value = true;
    timer.update({ velocity: 0 });
    timer.update({ position: 0 });
}

startTimerObject();

function startTimer() : void {
    while (Date.now() % 3000 != 0) {
        continue
    }
    timerStarted.value = true;
    timer.update({ velocity: 1 });
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
        console.log(timeVector);
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
        <span><p>h/m/s</p><h1 style="font-size: xx-large;">{{ hours }}:{{ minutes }}:{{ seconds }}</h1></span>
        <button @click="startTimer">Start</button>
        <button @click="stopTimer">Stop</button>
        <button @click="resetTimer">Reset</button> 
        <br><br><hr><br><br>
        <h1><input type="number" v-model="desiredHours" placeholder="hours" />:<input type="number" v-model="desiredMinutes" placeholder="minutes"/>:<input type="number" v-model="desiredSeconds" placeholder="seconds"></h1>        
        <button @click="skipToTimeCode">Choose new time</button>
    </div>
    <div v-else>
        <h1>Loading..</h1>
    </div>
</template>