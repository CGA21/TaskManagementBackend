const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    msg: { type: String, required: true },
    uid: { type: Number, required: true },
    pid: { type: Number, required: true },
    cid: { type: Number, required: true },
    datetime: { type: Date, required: true },

});

module.exports = mongoose.model('Comments', schema);