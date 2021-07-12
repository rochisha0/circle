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
- User Authentication using Google Auth
- Responsive UI

## How to call other users?

Enter the same roomname in the homepage to connect with other users.

## Getting started

### Prerequisites

Install [node](https://nodejs.org/en/) in your system.

### Run locally

- Fork and clone the repository.
- Navigate to the repository.
    ```
    cd circle
    ```

- Install nodemon 
    ```
    npm install -g nodemon
    ```

- For downloading the dependencies
    ```
    npm install
    ```

- Run 
    ```
    nodemon server.js
    ```

- The app is running on `localhost:5000`

## Tech stack used

- Backend - NodeJS & Express
- Frontend - Javascript and EJS

## How video call works?

I am using [PeerJS](https://peerjs.com/) an open source API that wraps WebRTC to create a peer-to-peer connection and helps to accomplish features like video call, share screen, record screen etc. WebRTC facilitates Real Time Communication (RTC) between browsers, mobile platfors and IOTs and allow then to communicate via common set of protocols. WebRTC mainly uses: signalling, ICE candidates, STUN server and TURN server for Real Time Communication.

## How web sockets work?

I am using [socket.io](https://socket.io/) an open source library that implements web sockets. Web socket provide a biderectional communication between web clients and servers. It came handy to implement features like text chat, user list and raise hand.

## Design Documentation

See [plan](PLAN.md)

## App Flow

![App Flow](https://github.com/rochisha0/circle/blob/master/public/assets/appflow.png)

## Demo of the application

[Click Here](https://youtu.be/mF-nfoyAMOY) to view the demo.

## Contact

_If you have any questions, reach out to me at rochisha.agarwal2302@gmail.com_
