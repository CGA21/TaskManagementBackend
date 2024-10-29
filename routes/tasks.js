const express = require('express');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const User = require('../models/User');

const router = express.Router();

router.post('/create', async (req, res) => {

    var { msg, uid, tid, pid, datetime, checked , priority} = req.body;
    try {
        let op = await Task.findOne({ tid: tid });
        if (op) {
            return res.status(400).send('Task id exists');
        }
        let limit = await User.findOne({ uid: uid }, 'tlimit');
        if (limit.tlimit <= 0) {
            return res.status(300).send('Task creation limit exceeded');
        }
        var l = limit.tlimit - 1;
        await User.updateOne({ uid: uid }, { $set: { tlimit: l } });
        tsk = new Task({ msg, uid, tid, pid, datetime, checked, priority });
        await tsk.save();
        res.json({ msg: 'task created' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

router.post('/edit', async (req, res) => {

    var { msg, uid, tid, pid, datetime, checked, priority } = req.body;
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

router.post('/delete', async (req, res) => {

    var { tid, uid } = req.body;
    try {
        //fetch all related Projects and users
        let tsk = await Task.findOne({ tid: tid }, 'tid uid pid');
        let usr = await User.findOne({ uid: uid }, 'uid tlimit role');
        let pr = await Project.findOne({ pid: tsk.pid }, 'pid uid');

        //check for rights to delete task and delete
        if (usr.role == 'admin' || tsk.uid == uid || pr.uid == uid) {
            let tsk_usr = await User.findOne({ uid: tsk.uid }, 'tlimit');
            await User.updateOne({ uid: tsk_usr.uid }, { $set: { tlimit: tsk_usr.tlimit + 1 } });
            var r = await Task.deleteOne({ tid });
            return res.json({ deleted: r });
        }
        return res.status(300).send('user has no rights to delete task');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Deletion error');
    }
});

router.post('/fetchbyId', async (req, res) => {
    var { id } = req.body;
    try {
        let ob = await Task.findOne({ tid: id });
        res.json(ob);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('fetch error');
    }
});

router.post('/fetchByPU', async (req, res) => {
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