const express = require('express');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const User = require('../models/User');
const Notifications = require('../models/Notifications');

const router = express.Router();

router.post('/create', async (req, res) => {
    console.log("API request received for task creation");
    var { message, creator, project, deadline, checked , priority} = req.body;
    try {
        tsk = new Task({ msg:message, uid:creator, pid:project, datetime:deadline, checked:checked, priority:priority });
        await tsk.save();
        //set notifications
        pr = await Project.findOne({ _id: project }, 'pname');
        n_msg = `new task assigned to you in project ${pr.pname}`;
        var n = Notifications({ uid: creator, datetime: new Date(), text: n_msg });
        await n.save();

        res.json({ msg: 'task created' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});


router.post('/edit', async (req, res) => {
    var { id, checked } = req.body;
    try {
        //update Task
        await Task.updateOne({ _id: id }, { checked: checked });
        //set notifications
        t = await Task.findOne({ _id: id }, 'pid');
        pr = await Project.findOne({ _id: t.pid }, 'pname members');
        n_msg = `project - ${pr.pname} progress was changed recently!`;
        for (let m of pr.members) {
            var n = Notifications({ uid: m, datetime: new Date(), text: n_msg });
            await n.save();
        }
        res.json({ msg: 'Changed Sucessfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Cannot edit task");
    }
});

router.post('/delete', async (req, res) => {
    console.log("API request received for task deletion");
    var { id} = req.body;
    try {
        var x = await Task.findOne({ _id: id }, 'msg');
        //set notifications
        n_msg = `The following task assigned to you was deleted by project admin recently - ${x.msg}`;
        var n = Notifications({ uid: id, datetime: new Date(), text: n_msg });
        await n.save();
        //delete task
        var r = await Task.deleteOne({ _id: id });
        res.json({ deleted: r });
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

//INPUT - UserID, ProjectID
//OUTPUT - Progress percentage
router.post('/progress', async (req, res) => {
    console.log("API request received for progress");
    var { uid, pid } = req.body;
    try {
        all_tasks = await Task.countDocuments({ uid: uid, pid: pid });
        completed = await Task.countDocuments({ uid: uid, pid: pid, checked: true });
        res.json({ progress: (completed / all_tasks) * 100 });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error')
    }
});

router.post('/task_count', async (req, res) => {
    console.log("API request received for progress");
    var { uid, pid } = req.body;
    try {
        all_tasks = await Task.countDocuments({ uid: uid, pid: pid });
        completed = await Task.countDocuments({ uid: uid, pid: pid, checked: true });
        res.json({all_tasks : all_tasks,completed:completed });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error')
    }
});

module.exports = router;