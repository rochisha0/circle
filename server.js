const express = require("express");

//Express instance
const app = express();

//Defining port
const port = process.env.PORT || 5000;

//http server
const server = require("http").Server(app);

//Import socket.io
const io = require("socket.io")(server);

//Import peerjs
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post('/room', (req, res) => {
  roomname = req.body.roomname;
  username = req.body.username;
  res.redirect(`/${roomname}?username=${username}`)
})

app.get('/:num', (req, res)=>{
  res.render('dashboard', { dashID: req.params.num })
})

const users = {};

function getUsers(arr){
  onlineUsers = []
  arr.forEach((onlineUser) => {
      onlineUsers.push(Object.values(onlineUser)[0])
  })
  return onlineUsers
}

io.on("connection", (socket) => {
  socket.on("join-room", (dashID, userID, userName) => {
    var user = {};

    //Joining the socket room
    socket.join(dashID);

    //storing users connected in a room
    user[socket.id] = userName;
    if(users[dashID]){
      users[dashID].push(user);
    }
    else{
      users[dashID] = [user];
    }

    //Emitting username to client
    socket.to(dashID).emit("user-connected", userID, userName);

    //Send online users array
    io.to(dashID).emit('online-users', getUsers(users[dashID]))

    socket.on("chat-message", (message, userName) => {
      io.to(dashID).emit("chat-message", { message: message, name: userName });
    });

    //Remove user from memory when they disconnect
    socket.on("disconnect", () => {
      socket.to(dashID).emit("user-disconnected", userID);
      delete users[socket.id];
      //Send online users array
      socket.to(roomname).emit('online-users', getUsers(users[roomname]))
  })
})
})

server.listen(port);