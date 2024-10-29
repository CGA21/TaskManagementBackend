const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    pass: { type: String, required: true },
    email: { type: String, required: true },
    uid: { type: Number, required: true },
    age: { type: Number, required: true },
    plimit: { type: Number, required: true },
    tlimit: { type: Number, required: true },
    paid: { type: Boolean, required: true },
    role: { type: String, required: true }
});

module.exports = mongoose.model('User', schema);