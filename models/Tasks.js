const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    msg: { type: String, required: true },
    uid: { type: String, required: true },
    pid: { type: String, required: true },
    datetime: { type: Date, required: true },
    checked: { type: Boolean, default: false },
    priority: { type: Number }
});

module.exports = mongoose.model('Tasks', schema);