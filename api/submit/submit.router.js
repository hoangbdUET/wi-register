const express = require('express');
let router = express.Router();
let response = require('../response');
let UserInfo = require('../models').UserInfo;
let UserCreated = require('../models').UserCreated;
let path = require('path');
let request = require('request');
const nodemailer = require('nodemailer');

function randomString() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 15; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

router.post('/submit', function (req, res) {
    UserInfo.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        jobtitle: req.body.jobtitle,
        email: req.body.email,
        phone: req.body.phone
    }).then(user => {
        res.send(response(200, "Successfull", user));
    }).catch(err => {
        console.log(err);
        res.send(response(512, "Error", err.message));
    });
});

router.get('/list', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.post('/create-user', (req, res) => {
    // console.log(req.body);
    let service = req.body.service === 'i2g.cloud' ? 'https://users.i2g.cloud' : 'https://admin.dev.i2g.cloud';
    // service = 'http://localhost:2999';
    let password = req.body.password ? req.body.password : randomString();
    let options = {
        method: 'POST',
        url: service + '/register',
        headers:
            {
                'Content-Type': 'application/json'
            },
        body: {
            username: req.body.username,
            password: password,
            idCompany: req.body.idCompany,
            email: req.body.email,
            fullname: req.body.firstName + req.body.lastName
        },
        json: true,
        strictSSL: false

    };
    request(options, function (error, response, body) {
        if (error) {
            res.send(error);
        } else {
            UserCreated.create({
                username: req.body.username,
                password: password,
                idUserInfo: req.body.idUserInfo
            }).then(() => {
                if (body.code === 200) {
                    UserInfo.findById(req.body.idUserInfo).then(user => {
                        user.status = 1;
                        user.save();
                    });
                    res.send(body);
                } else {
                    res.send(response(512, body.reason, body.reason));
                }
            }).catch(err => {
                res.send(body);
            })
        }
    });
});

router.post('/list', function (req, res) {
    UserInfo.findAll().then(all => {
        res.send(all);
    });
});

router.post('/decline', function (req, res) {
    UserInfo.findById(req.body.idUserInfo).then(userInfo => {
        userInfo.destroy().then(() => {
            res.send(response(200, "Successfull", userInfo));
        }).catch(err => {
            res.send(response(500, "error", err));
        });
    });
});
router.post('/info-user-created', function (req, res) {
    UserInfo.findById(req.body.idUserInfo, {include: {model: UserCreated}}).then(user => {
        user = user.toJSON();
        user.user_created.email = user.email;
        res.send(response(200, "Successfull", user.user_created));
    });
});

router.post('/send-mail', function (req, res) {
    let transporter = nodemailer.createTransport({ // config mail server
        host: 'smtp.yandex.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "support@i2g.cloud", // generated ethereal user
            pass: "" // generated ethereal password
        }
    });
    let mainOptions = {
        from: 'support@i2g.cloud',
        to: req.body.toAddress,
        subject: 'I2G Support Team - Account Created',
        text: 'I2G Support Team - Account Created',
        html: '<p>Hi, this is your account infomation : </p><ul><li>Username: <b>' + req.body.username + '</b></li><li>Email: <b>' + req.body.toAddress + '</b></li><li>Password: <b>' + req.body.password + '</b></li></ul>Now you can use our services here: https://wi.i2g.cloud <hr/> --<br/> __ I2G Support Team __'
    }
    transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
            res.send(response(512, "Got error", err));
        } else {
            console.log('Message sent: ' + info.response);
            res.send(response(200, "Successful", info.response));
        }
    });
});


module.exports = router;
