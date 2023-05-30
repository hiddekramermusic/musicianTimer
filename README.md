Simple timer app to keep multiple timers in sync across devices. 
Main aim is to run this app during rehearsals or performances, on a locally created closed network. 

To use this app, you need a router to create the local network, and a computer to run the app. 
All musicians can use the app with any phone, tablet, or laptop using their web browser, if they're connected to the local network. 
The local network should ideally not be connected to the internet. This ensures the best performance, and the phones and computers will not receive so many interruptions from other apps over the network in this way. 

This app relies heavily on the web timing libraries by Christoph Guttandin: https://github.com/chrisguttandin?tab=repositories&q=timing&type=&language=&sort=

------------------------

STEPS TO GET SET UP (just for running the server, the musicians don't need these steps):

Before starting this app, make sure you have node js installed on your system: https://nodejs.org/en/ (or through 'brew install node' or other package managers).

Then download this full Github Repository.
#
Open a terminal or command window (or open the folder with a code editor like visual studio code, and open a terminal window in there) 

##
In the terminal window, cd into the 'TimerForMusicians' folder, and run this command:
```bash
npm install -d
```
This will download and install all plugins you need into the 'node-modules' folder. 

###
Open three more terminal windows from the same TimerForMusicians folder. 

####
In the first window, run this command: 
```bash
npm run timesync
```
This will set up the time synchronisation server built by Christoph.
This will read 'npx timing-provider-server --port 4000'. And should then display nothing. 
#####
In the second window, run this command: 
```bash
npm run websocket
```
This will set up a server for communication between the devices. 
It should read 'staring node index.mjs' and then nothing for a while. 

######
In the third window, run this command: 
```bash
npm run app
```
Finally, this will set up the server that will show you the web app.
You will see two links. One starting with localhost, and another with a full IP Adress.
The musicians can all type in that full link in their browser. This link should look something like: 
```bash
192.168.1.33:5475 
```
Both this computer that runs the servers and the musicians should be connected to the local network you set up for this to work. 

--------------
USING THE APP:

Anybody can start, stop, or reset all timers using the buttons displayed. 
Anybody can also enter a new timecode to start from. The first box is the hours, the second the minutes, the third the seconds you want. 

If a composer or conductor is leading the session, it's advised they use a laptop to log in to the app, and control the timers of the others from there. 

NOTES:

So far I only tested this app with about 6-7 people connecting. I'm not sure at what group size problems with synchronization might be introduced, so test carefully if you are working with larger groups. Let me know if you have succesfully worked with larger groups so I can update this text!

For phones or tablets - and also for computers actually, make sure to completely disable your screen sleep and auto lock in your settings. 
If the device goes to sleep or is locked, the connection to the communication server will be closed and the timer will not respond anymore until you reload. It will keep running however, so in case of a performance you will still have a reliable timer that continues. 

I am planning to add a method that will automatically sync the current state of your timer to the rest, if you join later, which should help if this closing of the connection happens.  


