const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    msg: { type: String, required: true },
    uid: { type: Number, required: true },
    tid: { type: Number, required: true },
    pid: { type: Number, required: true },
    datetime: { type: Date, required: true },
    checked: { type: Boolean, required: true },
    priority: { type: Number, required: true }
});

module.exports = mongoose.model('Tasks', schema);