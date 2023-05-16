const express = require('express');
const persistence = require('../../lib/persistence');
const {errorHandler} = require('../../lib/error');
const {getAllUsers,createUser} = require('../../lib/persistence');

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

module.exports = router;
