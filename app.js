const express = require('express');
const app = express();
const config = require('config').App;
const cors = require('cors');
const bodyParser = require('body-parser');


app.use(cors());
app.use(bodyParser.json());


let userInfo = require('./api/submit/submit.router');

app.get('/', function (req, res) {

    res.send("wi-register");
});
app.use('/', userInfo);


app.listen(config.port, function () {
    console.log("Register app listening on port : ", config.port);
});