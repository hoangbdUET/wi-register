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

router.get('/api', (req, res) => {
    res.send("Register API");
});
router.post('/api/submit', function (req, res) {
    UserInfo.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        jobtitle: req.body.jobtitle,
        email: req.body.email,
        phone: req.body.phone
    }).then(user => {
        res.send(response(200, "Successfull", user));
        sendMail({
            toAddress: req.body.email,
            subject: 'Thank you for registering with i2G',
            text: 'Thank you for registering with i2G',
            html: '<p>Dear <b>' + req.body.firstName + ' ' + req.body.lastName + '</b></p></br> <p>Thank you for registering with i2G, a cloud-based well-bore data management, interpretation platform. Before you can be given access to the platform we need to verify your registration, which often takes up to 24 hours to process. An account activation email with username and password will be sent to you once this has been completed. If you have any question please contact us via email: <a href="mailto:support@i2g.cloud"> support@i2g.cloud></a></p></br><p>Best regards</p></br><p>The I2G team</p>'
        }, function (err, success) {
            if (err) {
                console.log("Send mail errr", err);
            } else {
                console.log("Send maul successful");
            }
        });
        sendMail({
            toAddress: "support@i2g.cloud",
            subject: "New user submitted " + req.body.firstName + " " + req.body.lastName,
            text: "New user submitted" + req.body.firstName + " " + req.body.lastName,
            html: 'Hi, Administrator! <br> New user ' + req.body.firstName + ' ' + req.body.lastName + ' already submited information to I2G, please approve this request at https://register.i2g.cloud <br> Best Regards <br> User Manager Service',
        }, function () {

        })
    }).catch(err => {
        console.log(err);
        res.send(response(512, "Error", err.message));
    });
});

router.get('/api/list', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.post('/api/create-user', (req, res) => {
    // console.log(req.body);
    let service = "https://users.i2g.cloud";
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

router.post('/api/list', function (req, res) {
    UserInfo.findAll().then(all => {
        res.send(all);
    });
});

router.post('/api/decline', function (req, res) {
    UserInfo.findById(req.body.idUserInfo).then(userInfo => {
        userInfo.destroy().then(() => {
            res.send(response(200, "Successfull", userInfo));
        }).catch(err => {
            res.send(response(500, "error", err));
        });
    });
});
router.post('/api/info-user-created', function (req, res) {
    UserInfo.findById(req.body.idUserInfo, {include: {model: UserCreated}}).then(user => {
        user = user.toJSON();
        user.user_created.email = user.email;
        user.user_created.fullName = user.firstName + " " + user.lastName;
        res.send(response(200, "Successfull", user.user_created));
    });
});

function sendMail(data, callback) {
    let options = {
        method: 'POST',
        url: 'http://127.0.0.1:3010/api/email/add',
        headers:
            {
                'Content-Type': 'application/json'
            },
        body: {
            toAddress: data.toAddress,
            subject: data.subject,
            text: data.text,
            html: data.html
        },
        json: true,
        strictSSL: false
    };
    request(options, function (error, response, body) {
        callback(error);
    });
}

router.post('/api/send-mail', function (req, res) {
    sendMail({
        toAddress: req.body.toAddress,
        subject: 'Get started with I2G',
        text: 'Get started with I2G',
        html: '<p>Dear <b>' + req.body.name + '</b></p></br> <p>Welcome to I2G, a cloud-based well-bore data management, interpretation platform.</p></br> <p>Your I2G account has just been activated!</p><ul><li>Username: <b>' + req.body.username + ' </b></li><li>Password: <b>' + req.body.password + '</b></li><li>URL: <b>https://wi.i2g.cloud</b></li></ul></br><p>Our app works best with Chrome web browser, so please make sure you use Chrome to avoid unexpected errors.</p></br><p>You can change your password by clicking on the "account tab" at the app\'s layout top right corner</p></br><a>Our support team will contact you shortly to guide you through all functionalities of our platform. If you have any question please contact us via email: <a href="mailto:support@i2g.cloud"> support@i2g.cloud></a></p><br><p>Best regards</p></br><p>The I2G team</p>'
    }, function (err, success) {
        if (err) {
            res.send(response(512, "Got error", err));
        } else {
            res.send(response(200, "Successfull", success));
        }
    });
});


module.exports = router;
