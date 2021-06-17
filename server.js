const app = require('express')();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log('App listening on port');
})