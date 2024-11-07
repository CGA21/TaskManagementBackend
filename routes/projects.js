const express = require('express');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const User = require('../models/User');

const router = express.Router();


router.post('/create', async (req, res) => {

    var { name, creator, deadline, members } = req.body;
    try {
        proj = new Project({ pname:name, uid:creator, members:members, datetime:deadline });
        await proj.save();
        res.json({ msg: 'project created' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/edit', async (req, res) => {

    var { name, members, pid, deadline } = req.body;
    try {
        await Project.updateOne({ _id: pid }, {pname:name,members:members,datetime:deadline});
        return res.json({ msg: 'successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to update')
    }
});

router.post('/delete', async (req, res) => {

    var { uid, pid } = req.body;
    try {
        //fetch all related Projects and users
        let usr = await User.findOne({ uid: uid }, 'uid plimit role');
        let pr = await Project.findOne({ pid: pid }, 'pid uid');

        //check if user has rights
        if (usr.email == 'admin' || uid == pr.uid) {
            let pr_user = await User.findOne({ uid: pr.uid }, 'plimit');
            await User.updateOne({ uid: pr.uid }, { $set: { plimit: pr_user.plimit + 1 } });
            var r = await Project.deleteOne({ pid });
            return res.json({ deleted: r });
        }
        return res.status(300).send('user does not have rights to delete project');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Deletion error');
    }

});

router.post('/fetchById', async (req, res) => {
    var { id } = req.body;
    try {
        let ob = await Project.findOne({ pid: id });
        console.log(ob);
        res.json(ob);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('fetch error');
    }
});

//INPUT - UserID
//OUTPUT - 

router.post('/fetchByUser', async (req, res) => {
    var { id } = req.body;
    try {
        all_pr = await Projects.find({ members: id });
        return res.json(all_pr);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error')
    }
});

//input:  UserID , ProjectID
// output: Username
router.post('/user_info', async (req, res) => {
    
    var { uid,pid } = req.body;
    try {
        usr = await User.find({ _id: uid });
        all_tasks = await Task.countDocuments({ uid: uid, pid: pid });
        completed = await Task.countDocuments({ uid: uid, pid: pid, checked: true });
        return res.json({ name: usr.name, _id: user._id, progress: (completed / all_tasks) * 100 });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error');
    }
});

//INPUT - UserID, ProjectID
//OUTPUT - Progress percentage
router.post('/progress', async (req, res) => {
    var { uid,pid } = req.body;
    try {
        all_tasks = await Task.countDocuments({ uid: uid, pid: pid });
        completed = await Task.countDocuments({ uid: uid, pid: pid, checked: true });
        console.log(`all = ${all_tasks} || completed = ${completed} || progress = ${(completed / all_tasks) * 100}`)
        res.json({ progress: (completed / all_tasks) * 100 });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error')
    }
});
module.exports = router;