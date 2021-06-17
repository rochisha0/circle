const express = require('express');
const app = express();

const port = 5000;
const server = require('http').Server(app);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('dashboard');
})
  

server.listen(5000);

