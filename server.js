const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cookieParser = require("cookie-parser");

//Authentication with Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '36522074585-bs3s7dt60b20l7na8pmp2r2dekh2smfo.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

//Import peerjs
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


//rendering the index first
app.get("/", (req, res) => {
  res.render("login");
});

app.post('/login', (req,res)=>{
  let token = req.body.token;
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
    }
    verify()
    .then(()=>{
        res.cookie('session-token', token);
        res.send('success')
    })
    .catch(console.error);

})

app.get("/index", (req, res) => {
  res.render("index");
});

//posting the values from index and redirecting to dashboard
app.post("/index", checkAuthenticated, (req, res) => {
  roomname = req.body.roomname;
  res.redirect(`/${roomname}`);
});

app.get("/:num", checkAuthenticated, (req, res) => {
  let user = req.user;
  res.render("dashboard", { dashID: req.params.num, user });
});

//Function to check if authenticated
function checkAuthenticated(req, res, next){

  let token = req.cookies['session-token'];

  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        res.redirect('/login')
    })
}

const users = {};
//Funtion to get users online in a room
function getUsers(arr) {
  onlineUsers = [];
  arr.forEach((onlineUser) => {
    onlineUsers.push(Object.values(onlineUser)[0]);
  });
  return onlineUsers;
}

module.exports = {getUsers}
io.on("connection", (socket) => {
  socket.on("join-room", (dashID, userID, userName, userImage) => {
    var user = {};

    //Joining the socket room
    socket.join(dashID);

    //storing users connected in a room
    user[socket.id] = [userName, userImage];
    if (users[dashID]) {
      users[dashID].push(user);
    } else {
      users[dashID] = [user];
    }

    //Emitting username to client
    socket.to(dashID).emit("user-connected", userID, userName);

    //Send online users array
    io.to(dashID).emit("online-users", getUsers(users[dashID]));

    //Emitting chat message
    socket.on("chat-message", (message, userName, userImage) => {
      io.to(dashID).emit("chat-message", { message: message, name: userName, image:userImage});
    });

    //Emit username when user raised hand
    socket.on("raiseHand", (userName) => {
      io.to(dashID).emit("handRaised", userName);
    });

    //Remove user from memory when they disconnect
    socket.on("disconnect", () => {
      socket.to(dashID).emit("user-disconnected", userID);
      users[dashID].forEach((user, index) => {
        if (user[socket.id]) {
          users[dashID].splice(index, 1);
        }
        //Send online users array
        io.to(dashID).emit("online-users", getUsers(users[dashID]));
      });
    });
  });
});

server.listen(port);
