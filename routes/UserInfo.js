const router = require('express').Router();
const verify = require('../model/verifyToken');
const { MongoClient } = require('mongodb');


let users;
const url = process.env.DB_CONNECTION;

MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
    users = database.db('Auth').collection('users');
});


router.get('/', verify, (req, res) => {

    users.findOne({ email: req.verifiedUser.email }).then(user => {
        res.json({
            UserInfo: {
                "firstName": user.firstName,
                "lastName": user.lastName,
                "description": 'random data bla bla bla'
            }
        });

    });
})

module.exports = router;
