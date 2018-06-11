const express = require('express');
let router = express.Router();
let response = require('../response');
let UserInfo = require('../models').UserInfo;
let path = require('path');

router.post('/submit', function (req, res) {
    UserInfo.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        jobtitle: req.body.jobtitle,
        email: req.body.email
    }).then(user => {
        res.send(response(200, "Successfull", user));
    }).catch(err => {
        res.send(response(512, "Error", err.errors[0].message));
    });
});

router.get('/register.html', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.post('/list', function (req, res) {
    UserInfo.findAll().then(all => {
        res.send(all);
    });
});

module.exports = router;
