var User = require('./models/User.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var express = require('express');
var router = express.Router();

router.post('/register',
    async (req, res) => {
        var userData = req.body;
    
        var userExist = await User.findOne({email: userData.email});
        
            if(userExist) {
                return res.status(401).send({message: 'Such User has already exist'});
            }
    
        var user = new User(userData);
        user.save((err, newUser) => {
            if(err) {
                return res.status(500).send({message: 'Error saving user'});
            }

            createSenToken(res, newUser);
        });
    });

    router.post('/social',
    async (req, res) => {
        var userData = req.body;
        var userExist = await User.findOne({email: userData.email});
            if(userExist) {
               return createSenToken(res, userExist);
            }
    
            return res.status(500).send({message: 'User doens\'t exist'});           
        });


    router.post('/login', async (req, res) => {
        var loginData = req.body;    
        var user = await User.findOne({email: loginData.email});    
        if(!user) {
            return res.status(401).send({message: 'User not found'});
        }    
        bcrypt.compare(loginData.pwd, user.pwd, (err, isMatch) => {
            if(!isMatch) return res.status(401).send({message: 'Email or Password invalid'});    
           createSenToken(res, user);
         
        })
    });

    function createSenToken(res, user) {
        var payload = { sub: user._id, name: user.name };
        var token = jwt.encode(payload, 'secret');
        res.status(200).send({ token });
    }

    var auth = {
        router,
        checkAuthenticated: function (req, res, next) {
            if(!req.header('authorization')) {
                return read.status(401).send({message: 'Unauthorized. Missing Auth Header'});
            }        
            var token = req.header('authorization').split(' ')[1];        
            var payload = jwt.decode(token, 'secret');        
            if(!payload) {
                return read.status(401).send({message: 'Unauthorized. Missing Auth Header invalid'});
            }        
            req.userId = payload.sub;        
            next();
        }
    }
    
    module.exports = auth;