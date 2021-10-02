const mongoose = require('mongoose');

const rssSchema = mongoose.Schema(
    {
    title: {type: String, unique: true, required: true},
    rssArray: [{type: String}]
    }, 
    {
        collection: 'rssdata'
    }
)

const model = mongoose.model('rssSchema', rssSchema);

module.exports = model;