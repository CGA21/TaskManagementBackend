const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    uid: { type: String ,required:true},
    datetime: { type: Date, required: true },
    text: { type: String ,required: true}
});

module.exports = mongoose.model('Notifications', schema);