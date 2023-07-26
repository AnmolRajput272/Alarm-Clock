const timePicker = document.getElementById('timePicker');
const setAlarmBtn = document.getElementById('setAlarmBtn');
const clearAlarmBtn = document.getElementById('clearAlarmBtn');
const alarmSound = document.getElementById('alarmSound');
const clockCanvas = document.getElementById('clockCanvas');
const countdownTimer = document.getElementById('countdownTimer');
const snoozeBtn = document.getElementById('snoozeBtn');
const alarmsList = document.getElementById('alarmsList');
const digitalClock = document.getElementById('digitalClock');

let alarms = []; // Array to store alarms

const snoozeDuration = 1 * 60 * 1000; // 5 minutes in milliseconds

const ctx = clockCanvas.getContext('2d');
let radius = clockCanvas.height / 2;

ctx.translate(radius, radius);
radius = radius * 0.9;

function drawClock() {
    ctx.clearRect(-radius, -radius, 2 * radius, 2 * radius);

    // Draw the clock face
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw the hour markers
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(radius * 0.85 * Math.cos(angle), radius * 0.85 * Math.sin(angle));
        ctx.lineTo(radius * 0.95 * Math.cos(angle), radius * 0.95 * Math.sin(angle));
        ctx.stroke();
    }

    // Get the current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Draw the hour hand
    const hourAngle = (hours % 12 + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
    const hourLength = radius * 0.5;
    const hourX = hourLength * Math.cos(hourAngle);
    const hourY = hourLength * Math.sin(hourAngle);
    drawHand(hourX, hourY, 0.07 * radius, '#333');

    // Draw the minute hand
    const minuteAngle = (minutes + seconds / 60) * (Math.PI / 30) - Math.PI / 2;
    const minuteLength = radius * 0.8;
    const minuteX = minuteLength * Math.cos(minuteAngle);
    const minuteY = minuteLength * Math.sin(minuteAngle);
    drawHand(minuteX, minuteY, 0.07 * radius, '#333');

    // Draw the second hand
    const secondAngle = seconds * (Math.PI / 30) - Math.PI / 2;
    const secondLength = radius * 0.9;
    const secondX = secondLength * Math.cos(secondAngle);
    const secondY = secondLength * Math.sin(secondAngle);
    drawHand(secondX, secondY, 0.02 * radius, 'red');
}

function drawHand(x, y, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
}


function renderAlarmsList() {
    alarmsList.innerHTML = ''; // Clear the existing list
    if (alarms.length > 0) {
        const heading = document.createElement('h2');
        heading.textContent = 'Alarms List';
        alarmsList.appendChild(heading);
    }
    alarms.forEach((alarm, index) => {
        const alarmTimeStr = alarm ? getDateTimeString(alarm) : '';
        const listItem = document.createElement('li');
        const alarmTimeText = document.createElement('p');
        alarmTimeText.style.fontSize = "23px";
        alarmTimeText.textContent = alarm ? ` ${alarmTimeStr}` : ''; // Show alarm time if set, otherwise empty
        listItem.appendChild(alarmTimeText);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteAlarm(index));
        listItem.appendChild(deleteBtn);

        if (alarm <= new Date()) {
    	    // Add snooze button for each ringing alarm
			const snoozeBtn = document.createElement('button');
			snoozeBtn.textContent = 'Snooze';
			snoozeBtn.addEventListener('click', () => {
				const now = new Date();
				const snoozeTime = new Date(now.getTime() + snoozeDuration);
				alarms[index] = snoozeTime;
				alarmTimeText.textContent = `${getDateTimeString(snoozeTime)}`;
				snoozeBtn.style.display = 'none';
				//listItem.appendChild(deleteBtn);
				snoozeAlarm(index);
			});
			listItem.appendChild(snoozeBtn);
    	}

        alarmsList.appendChild(listItem);
    });
}

// get time in string format
function getDateTimeString(selectedTime){
	return selectedTime.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

// function to add alarm
function addAlarm(alarmTime) {
    alarms.push(alarmTime);
    renderAlarmsList();
}


// function to delete an alarm
function deleteAlarm(index) {
    alarms.splice(index, 1);
    renderAlarmsList();
    stopAlarmSound();
}

// function to set Alarm
function setAlarm() {
    const now = new Date();
    const selectedTimeStr = timePicker.value;
    const selectedTime = new Date(selectedTimeStr);

    if (isNaN(selectedTime) || selectedTime <= now) {
        alert("Please select a future time for the alarm!");
        return;
    }

    addAlarm(selectedTime);
    alert(`Alarm set for ${getDateTimeString(selectedTime)}`);
}

// function to check if time is up for any alarm
function checkAlarm() {
    const now = new Date();
    alarms.forEach((alarmTime, index) => {
        if (alarmTime && now >= alarmTime && now - alarmTime <= 1000) {
            triggerAlarm(index);
        }
    });
}

// function to trigger alarm
function triggerAlarm(index) {
    alarmSound.play();
    alert(`Alarm ${index + 1} triggered! Click 'Delete' or 'Snooze' to turn off the alarm.`);
    renderAlarmsList(); // Re-render the alarms list without the snooze button
}

// function to stop the alarm sound
function stopAlarmSound(){
	const anyActiveAlarms = alarms.some(alarm => alarm !== null && alarm <= new Date());
	if(!anyActiveAlarms){
		alarmSound.pause();
		alarmSound.currentTime = 0;
    }
}

// function to snooze the alarm
function snoozeAlarm(index) {
	stopAlarmSound();
    // Set the new alarm time after snoozing
    const now = new Date();
    const snoozeTime = new Date(now.getTime() + snoozeDuration);
    alert(`Alarm ${index + 1} snoozed for ${snoozeDuration/60000} minutes. The alarm will ring at ${getDateTimeString(snoozeTime)}`);
 }

// function to update the time in digital clock
function updateDigitalClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert to 12-hour format
    digitalClock.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
    
    // Update Today's Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    todaysDate.textContent = dateString;
}

// function to clear all alarms
function clearAlarm(){
	alarms.splice(0);
	renderAlarmsList();
	stopAlarmSound();
}

// Set up event listeners

// Update the clock every second
setInterval(drawClock, 1000);

// Update the digital clock every second
setInterval(updateDigitalClock, 1000);

// render alarm list
renderAlarmsList();

setAlarmBtn.addEventListener('click', setAlarm);
clearAlarmBtn.addEventListener('click', clearAlarm);

// check if time is up for any of the alarms
setInterval(checkAlarm, 1000);

