const { MongoClient } = require('mongodb');
const userRouter = require('express').Router();
const { registerValidation, loginValidation } = require('../model/Validation')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ax = require('axios');
const sha1 = require('js-sha1')


require('dotenv').config();


const url = process.env.DB_CONNECTION;
let users;
let currentUser = null;


MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
  users = database.db('Auth').collection('users');
});


userRouter.post('/register', async (req, res) => {

  //validate
  // console.log(req.body);
  const { error } = registerValidation(req.body);
  if (error) return res.json(error.message);

  //check if user already exist 
  const emailExist = await users.findOne({ email: req.body.email });

  if (emailExist) return res.json('User already exists. Please log in');



  //Check if password is in HIBP database

  let passwordUpperCase = sha1(req.body.password).toUpperCase();

  let prefix = passwordUpperCase.substring(0, 5);
  // console.log(prefix)
  let suffix = passwordUpperCase.substring(5, passwordUpperCase.length);
  let apiCall = "https://api.pwnedpasswords.com/range/" + prefix;
  // console.log(apiCall)

  async function getmyAPI() {
    try {
      const response = await ax.get(apiCall);
      // console.log(response.data);
      var hashes = (response.data).split('\r\n')
      // console.log(hashes.length);



      var breached = false;
      for (let i = 0; i < hashes.length; i++) {
        var hash = hashes[i];

        var splt = hash.split(':');

        if (splt[0] === suffix) {
          // console.log(splt[0])
          // console.log("This password has been breached " + splt[1] + " times. Please choose more secure password");
          res.json("This password has been breached " + splt[1] + " times. Please choose more secure password");
          breached = true;
          break;
        }
      }
      if (!breached) {
        // console.log("This password is not breached " + splt[0]);

        //Hash password

        const salt = await bcrypt.genSalt(10);
        const hasedPassword = await bcrypt.hash(req.body.password, salt);


        let body = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hasedPassword
        }

        //finally add the user
        users.insertOne(body, (err, result) => {
          res.json('User')
          console.log("user added");
        })
      }
    } catch (err) {
      //console.error(err);
    }
  }

  getmyAPI()
})


userRouter.post('/login', async (req, res) => {

  //validate 
  const { error } = loginValidation(req.body);
  if (error) return res.json(error.message);
  //console.log(error);

  const userExist = await users.findOne({ email: req.body.email });
  if (!userExist) {
    //console.log("incorrect email")
    res.json('Incorrect Email or password');
  }



  if (userExist) {


    const validPassword = await bcrypt.compare(req.body.password, userExist.password);
    if (validPassword) {

      // console.log("logged in")
      res.json('Logged');
      //const token = jwt.sign({ email: userExist.email }, process.env.TOKEN_SECRET);
      //res.header('auth-token', token).send(token);
      // console.log(userExist);
      currentUser = userExist;
    } else {
      res.json("Incorrect Email or Password");
    }


  }

})



module.exports = { userRouter, currentUser, users };