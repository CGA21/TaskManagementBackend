const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    filename: { type: String, required: true },
    pid: { type: Number, required: true },
    uid: { type: Number, required: true }
});

module.exports = mongoose.model('Files', schema);