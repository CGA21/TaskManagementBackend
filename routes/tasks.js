const express = require('express');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const User = require('../models/User');

const router = express.Router();

router.post('/create', async (req, res) => {
    console.log("API request received for task creation");
    var { message, creator, project, deadline, checked , priority} = req.body;
    try {
        tsk = new Task({ msg:message, uid:creator, pid:project, datetime:deadline, checked:checked, priority:priority });
        await tsk.save();
        res.json({ msg: 'task created' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

/*
router.post('/edit', async (req, res) => {

    var { tid, checked} = req.body;
    try {
        //fetch all related Projects and users
        let tsk = await Task.findOne({ tid: tid }, 'tid uid pid');
        let usr = await User.findOne({ uid: uid }, 'uid tlimit role');
        let pr = await Project.findOne({ pid: tsk.pid }, 'pid uid');

        //check for rights to edit task
        if (usr.role == 'admin' || tsk.uid == uid || pr.uid == uid) {
            await Task.updateOne({ tid }, req.body);
            return res.json({ msg: 'successful' });
        }
        return res.status(300).send('User has no rights to edit task')
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to update');
    }
});
*/

router.post('/edit', async (req, res) => {
    var { id, checked } = req.body;
    try {
        await Task.updateOne({ _id: id }, {checked:checked});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Cannot edit task");
    }
});

router.post('/delete', async (req, res) => {
    console.log("API request received for task deletion");
    var { id} = req.body;
    try {
        var r = await Task.deleteOne({ _id: id });
        return res.json({ deleted: r });
        } catch (err) {
        console.error(err.message);
        res.status(500).send('Deletion error');
    }
});

router.post('/fetchbyId', async (req, res) => {
    console.log("API request received for task fetchByID");
    var { id } = req.body;
    try {
        let ob = await Task.findOne({ _id: id });
        res.json(ob);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('fetch error');
    }
});

router.post('/fetchByPU', async (req, res) => {
    console.log("API request received for task fetch by project & user");
    var { project, user } = req.body;
    try {
        let tsks = await Task.find({ pid: project, uid: user });
        return res.json(tsks);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error');
    }
});

module.exports = router;