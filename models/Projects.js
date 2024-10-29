const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    pname: { type: String, required: true },
    uid: { type: Number, required: true },
    members: { type: String, required: true },
    pid: { type: Number, required: true },
    datetime: { type: Date, required: true },
    
});

module.exports = mongoose.model('Projects', schema);