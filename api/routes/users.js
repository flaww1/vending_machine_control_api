const express = require('express');
const persistence = require('../../lib/persistence');
const {errorHandler} = require('../../lib/error');
const validator = require('../../lib/validation.js');
const authentication = require('../../lib/authentication');
const authorization = require('../../lib/authorization');
const {createUserValidator} = require("../../lib/validation");

const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        persistence.getAllUsers()
            .then((users) => {
                res.status(200)
                    .json(users);
            });

    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());

    }
});
// This route only requires an authorization.check when it comes to creating new administrators


router.get('/:userId',(req, res, next) => {
    try {
        persistence.getUserByuserId(Number(req.params.userId))
            .then((user) => {
                res.status(200)
                    .json(user);
            });

    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
    }
});


router.put('/:userId', (req, res, next) => {
    try {
        persistence.updateUser(Number(req.params.userId), req.body)
            .then((updatedUser) => {
                res.status(200)
                    .json(updatedUser);
            });

    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
    }
});

router.delete('/:userId', (req, res, next) => {
    try {
        persistence.deleteUser(Number(req.params.userId))
            .then((deletedUser) => {
                res.status(200)
                    .json(deletedUser);
            });

    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
    }
});


module.exports = router;
