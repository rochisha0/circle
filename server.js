const express = require('express');
const app = express();
const port = 5000;
const server = require('http').Server(app);

const {v4: uuidv4 } = require('uuid');

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
  
app.get('/:num', (req, res) =>{
    res.render('dashboard', { dashID: req.params.num })
})
server.listen(port);

