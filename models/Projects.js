const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    pname: { type: String, required: true },
    uid: { type: String, required: true },
    members: { type: [String], default:[] },
    datetime: { type: Date, required: true },
});

module.exports = mongoose.model('Projects', schema);