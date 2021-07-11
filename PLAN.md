# Plan for the app

The app was created using Agile methodology. After each week the app was deployed and tested for feature and UI improvements. Each week in the group meetings the demo was shown to the mentors and other mentees and feedback was asked for further development.

## Objective 

A minimum of two participants should be able connect with each other using the product to have a video conversation.

## Designs created for the app

![Design](https://github.com/rochisha0/circle/blob/master/public/assets/design.jpeg)

## Timeline for the application

- Week 1 :

  - Chose to create a web application using NodeJS and Express, due to the familiarity.
  - Went on to create the design of the app.
  - Also, implemented the minimum functionality using PeerJs and Socket.io.

  - Bugs reported
    - PeerJS issue where the second person could not connect

- Week 2 :

  - Fixed the issue from week 1.
  - Deployed the app on Heroku
  - Tested it on various platforms, browsers, mobile devices.
  - Created the UI of the control buttons using Bootstrap
  - Implemented the chat feature with socket.io
  - Created the mute video/ audio and share screen buttons
  - Created the toggle feature for chat and user list

  - Bugs reported
    - Two people on different network could not connect (issue due to firewall and browser network settings)
    - The UI is not responsive
    - The first person could not share his/ her screen.

- Week 3 :

  - Implemented the user list with socket.io
  - Deployed the app on Heroku
  - Tested it on various platforms, browsers, mobile devices.
  - Fixed bugs related to screen sharing
  - Created raise hand feature with socket.io
  - Made some UI developments and also created the logo

- Week 4 :
  - Implemented the record screen feature with WebRTC
  - Changed layout of video screen
  - Added user authentication using Google
  - Added the user's images in chat and people in call section.
  - Made some UI improvements
  - Deployed the app on Heroku
  - Tested it on various platforms, browsers, mobile devices.
  - Recorded the final demo for the app.

## Issues remaining

- Video glitches after person leaves the call.
- Two people sometimes on different networks can't connect due to non existence of TURN servers. 