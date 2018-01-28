var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var auth = require('./auth.js');

var app = express();
var User = require('./models/User.js');
var Post = require('./models/Post.js');
var Beer = require('./models/Beer.js');

mongoose.Promise = Promise;

app.use(cors());
app.use(bodyParser.json());

function checkAuthenticated(req, res, next) {
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

app.get('/beers', async (req, res) => {
    var beers = await Beer.find({});
    res.send(beers);
});

app.get('/beers/:id', async (req, res) => {
    var author = req.params.id;
    var userBeers = await User.findById(author, "-name -description -pwd -email -_id -__v", function (err, user) {
        if(err) { 
            return res.status(500).send({ message: 'something goes wrong'});
        }
    });
    res.send(userBeers.beers);
});

app.post('/beers', auth.checkAuthenticated, async (req, res) => {
    var postData = req.body;
    postData.author = req.userId;
    await User.findById(postData.author, function (err, user) {
        user.beers = postData.beers;
        var newUser = new User(user);
        newUser.save((err, result) => {
            if(err) { 
                return res.status(500).send({ message: 'saving user error'});
            }
            res.sendStatus(200);
        })
    });
});

app.get('/posts/:id', async (req, res) => {
    var author = req.params.id;
    var posts = await Post.find({author}, "-name");
    res.send(posts);
});

app.get('/posts', async (req, res) => {    
    var posts = await Post.find({});
    res.send(posts);
});


app.post('/post', auth.checkAuthenticated, async (req, res) => {
    var postData = req.body;
    postData.author = req.userId;

    await User.findById(postData.author, function (err, user) {
        postData.name = user.name;
    });
   
    var post = new Post(postData);    
    post.save((err, result) => {
        if(err) { 
            return res.status(500).send({ message: 'saving post error'});
        }
        res.sendStatus(200);
    })
});

app.get('/users', async (req, res) => {
    try {
        var users = await User.find({}, "-pwd -__v");
        res.send(users);
    }
    catch(error) {
        res.sendStatus(500);
    }
});

app.get('/profile/:id', async (req, res) => {
    try {
        var user = await User.findById(req.params.id, "-pwd -__v");
        res.send(user);
    }
    catch(error) {
        res.sendStatus(200);
    }
});

mongoose.connect('mongodb://test:test@ds251727.mlab.com:51727/angular2-pet-project', { useMongoClient: true }, (err) => {
    if(!err) {
        console.log('connected to mongo');
    }
});

app.use('/auth', auth.router);
app.listen(process.env.PORT || 3000);