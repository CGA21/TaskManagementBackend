const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    filename: { type: String, required: true },
    pid: { type: String, required: true },
    uid: { type: String, required: true },
    filepath: {type:String, required:true}
});

module.exports = mongoose.model('Files', schema);