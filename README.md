# Circle

![Logo](https://github.com/rochisha0/circle/blob/master/public/assets/circle.png)

A multifunctional video calling app (MS Teams Clone) created as a part of Microsoft Engage'21.

## Features

- There can be multiple rooms at one moment
- Multiple users in one room
- Ability to chat with other users
- Mute your video/ audio
- Ability to share your screen
- See the other participant's names
- Raise hand during the call
- Record your screen and audio

## How to call other users?

Enter the same roomname in the homepage to connect with other users.

## Steps to run the project

- Clone the repository.
- Install nodemon `npm install -g nodemon`
- Run `npm install` for downloading the dependencies
- Run `nodemon server.js`
- The app is running on `localhost:5000`

## How I planned this app?

See [plan](PLAN.md)

## Tech stack used

- Backend - NodeJS & Express
- Frontend - Javascript and EJS

## How video call works?

I am using PeerJS an open source API that wraps WebRTC to create a peer-to-peer connection. WebRTC facilitates Real Time Communication (RTC) between browsers, mobile platfors and IOTs and allow then to communicate via common set of protocols. WebRTC mainly uses: signalling, ICE candidates, STUN server and TURN server for Real Time Communication.

## How web sockets work?

## To do

- Leave meeting button
- Flip the video
- Azure Hosting
- Create ppt for agile

## References
