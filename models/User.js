var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    email: String,
    pwd: String,
    name: String,
    description: String,
    beers: [
        {
            brand: String,
            name: String,
            alcohol: String,
            price: String,
            isLiked: Boolean
        }
    ] 
});

userSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('pwd')) {
        return next();
    }

    bcrypt.hash(user.pwd, null, null, (err, hash) => {
        console.log(hash);
        if(err) return next(err);

        user.pwd = hash;
        next();
    })
})

module.exports = mongoose.model("User", userSchema);