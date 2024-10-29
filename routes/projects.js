const express = require('express');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const User = require('../models/User');

const router = express.Router();


router.post('/create', async (req, res) => {

    var { pname, uid, members, pid, datetime } = req.body;
    try {
        let op = await Project.findOne({ pid: pid });
        if (op) {
            return res.status(400).send('Project id exists');
        }
        let limit = await User.findOne({ uid: uid }, 'plimit');
        l = limit.plimit
        if (l <= 0) {
            return res.status(300).send('Project creation limit exceeded');
        }
        l = l - 1;
        await User.updateOne({ uid }, { $set: { plimit: l } });
        proj = new Project({ pname, uid, members, pid, datetime });
        await proj.save();
        res.json({ msg: 'project created' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/edit', async (req, res) => {

    var { pname, uid, members, pid, datetime } = req.body;
    try {
        //fetch all related Projects and users
        let usr = await User.findOne({ uid: uid }, 'uid plimit role');
        let pr = await Project.findOne({ pid: pid }, 'pid uid');

        //check if user has rights
        if (usr.role == 'admin' || uid == pr.uid) {
            await Project.updateOne({ pid }, req.body);
            return res.json({ msg: 'successful' });
        }
        return res.status(300).send('user does not have rights to edit');
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
        if (usr.role == 'admin' || uid == pr.uid) {
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
module.exports = router;