const express = require('express');
const persistence = require('../../lib/persistence');
const {errorHandler} = require('../../lib/error');


const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        persistence.getAllUsers()
            .then((userData) => {
                res.status(200)
                    .json(userData);
            });
    } catch (e) {
        console.log(e);
        res.status(500)
            .send(errorHandler());
    }
});
router.post('/createUser', (req, res, next) => {
    try {

        persistence.createUser(req.body)
            .then((createdUser) => {
                if (createdUser) {
                    res.status(200)
                        .json(createdUser);

                } else {
                    res.status(500)
                        .send(errorHandler());
                }
            });

    } catch (e) {
        console.log(e);
        res.status(400)
            .send({message: 'Invalid data. Make sure to include every field.'});
    }
});


router.get('/:userId', (req, res, next) => {
    try {
        persistence.getUserByNumber(Number(req.params.userId))
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

router.get('/:userEmail', (req, res, next) => {
    try {
        persistence.getUserByEmail(Number(req.params.email))
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
