const express = require('express');
let router = express.Router();
let response = require('../response');
let UserInfo = require('../models').UserInfo;

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

module.exports = router;
