const express = require('express');

//Express instance
const app = express();

//Defining port
const port = process.env.PORT || 5000;

//http server
const server = require('http').Server(app);

//UUID for specific rooms
const {v4: uuidv4 } = require('uuid');

//Import socket.io
const io = require('socket.io')(server);

//Import peerjs
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
  
app.get('/:num', (req, res) => {
    res.render('dashboard', { dashID: req.params.num })
})

const users = new Set();

io.on('connection', socket => {
    socket.on('join-room', (dashID, userID, userName) => {
      socket.join(dashID);
      users[socket.id] = userName
      socket.to(dashID).emit('user-connected', userID, userName);

      socket.on('chat-message', (message) => {
        io.to(dashID).emit('chat-message', { message: message, name: userName })
      })

      socket.on('disconnect', () => {
        socket.to(dashID).emit('user-disconnected', userID);
        delete users[socket.id]
      })
    })
})

server.listen(port);

