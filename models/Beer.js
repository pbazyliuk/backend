var mongoose = require('mongoose');

module.exports = mongoose.model("Beer", {
    brand: String,
    name: String,
    alcohol: String,
    price: String,
    isLiked: Boolean
});
