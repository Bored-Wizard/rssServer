const mongoose = require("mongoose");

const Banner = mongoose.Schema(
    {
        imgUrl: {type: String, require: true},
        mainUrl: {type: String, require: true},
    },
    {
        collection: 'bannerInfo'
    }
)

const model = mongoose.model('banner', Banner);

module.exports = model;