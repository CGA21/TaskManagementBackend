const express = require('express');
const Project = require('../models/Projects');
const User = require('../models/User');
const Comments = require('../models/Comments');


const router = express.Router();

router.post('/create', async (req, res) => {
    var { project, user, message, date ,cid} = req.body;
    try {
        let cmt = new Comments({ pid: project, uid: user, msg: message, datetime: date, cid: cid });
        await cmt.save()
        res.send('message saved');
    } catch (err) {
        console.error(err.message);
        re.status(500).send('error occured when saving message');
    }
});

router.post('/fetch_all', async (req, res) => {
    var { id } = req.body;
    let cmts = await Comments.find({ pid: id });
    return res.json(cmts);
});

router.post('/delete', async (req, res) => {
    var { id } = req.body;
    try {
        var r = await Comments.deleteOne({ cid: id });
        return res.json(r);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('error when deleteting message');
    }

});

module.exports = router;