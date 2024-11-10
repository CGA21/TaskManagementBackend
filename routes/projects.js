const express = require('express');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const User = require('../models/User');
const Notifications = require('../models/Notifications');
const createChannel = require('../discord/createChannel');
const deleteChannel = require('../discord/deleteChannel');
const fetchMessages = require('../discord/fetchMessages');
const sendMessage = require('../discord/sendMessage');

const router = express.Router();


router.post('/create', async (req, res) => {
    console.log("API request received for project creation");
    var { name, creator, deadline, members } = req.body;
    try {

        //create project
        proj = new Project({ pname:name, uid:creator, members:members, datetime:deadline });
        await proj.save();

        //create discord channel
        var channelId = await createChannel(name, proj._id);
        await Project.updateOne({ _id: proj._id }, { channelId: channelId });
        //send response
        res.json({ msg: 'project created' });

        //set notification
        n_msg = `new project - ${name} was created and you were added`;
        for (let m of proj.members) {
            console.log(m);
            var n = Notifications({uid: m, datetime: new Date(), text: n_msg });
            await n.save();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/edit', async (req, res) => {
    console.log("API request received for project edit");
    var { name, members, pid, deadline } = req.body;
    try {
        await Project.updateOne({ _id: pid }, {pname:name,members:members,datetime:deadline});
        res.json({ msg: 'successful' });
        //set notifications
        n_msg = `project - ${name} was edited recently`;
        proj = await Project.findOne({ _id: pid }, 'members');
        for (let m of proj.members) {
            var n = Notifications({ uid: m, datetime: new Date(), text: n_msg });
            await n.save();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Unable to update')
    }
});

router.post('/delete', async (req, res) => {
    console.log("API request received for project delete");
    var { uid, pid } = req.body;
    try {
        //fetch all related Projects and users
        let usr = await User.findOne({ _id: uid },'email');
        let pr = await Project.findOne({ _id: pid });

        //check if user has rights
        if (usr.email == 'admin' || uid == pr.uid) {
            //delete channel
            await deleteChannel(pr.channelId);
            //set notifications
            pr = await Project.findOne({ _id: pid }, 'pname members');
            n_msg = `project - ${pr.pname} was set for deletion`;
            for (let m of pr.members) {
                var n = Notifications({ uid: m, datetime: new Date(), text: n_msg });
                await n.save();
            }
            //delete project
            var r = await Project.deleteOne({ _id: pid });
            return res.json({ deleted: r });
        }
        return res.status(300).send('user does not have rights to delete project');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Deletion error');
    }

});

router.post('/fetchById', async (req, res) => {
    console.log("API request received for projects fetchbyID");
    var { id } = req.body;
    try {
        let ob = await Project.findOne({ _id: id });
        //console.log(ob);
        res.json(ob);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('fetch error');
    }
});

//INPUT - UserID
//OUTPUT - 
router.post('/fetchByUser', async (req, res) => {
    console.log("API request received for project fetchbyUser");
    var { id } = req.body;
    try {
        all_pr = await Project.find({ members: id });
        return res.json(all_pr);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error')
    }
});

//input:  UserID , ProjectID
// output: Username
router.post('/user_info', async (req, res) => {
    console.log("API request received for project user_info");
    var { uid,pid } = req.body;
    try {
        usr = await User.findOne({ _id: uid });
        all_tasks = await Task.countDocuments({ uid: uid, pid: pid });
        completed = await Task.countDocuments({ uid: uid, pid: pid, checked: true });
        return res.json({ name: usr.name, _id: usr._id, progress: (completed / all_tasks) * 100 });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error');
    }
});

router.post('/fetchUserName', async (req, res) => {
    console.log("API request received for fetch User");
    var { id } = req.body;
    try {
        usr = await User.findOne({ _id: id }, 'name');
        res.json({ name: usr.name });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error')
    }
});

//INPUT - UserID, ProjectID
//OUTPUT - Progress percentage
router.post('/progress', async (req, res) => {
    console.log("API request received for project progress");
    var { id } = req.body;
    try {
        let all_tasks = 0;
        let completed = 0;
        pr = await Project.findOne({ _id: id }, 'members');
        for (let uid of pr.members) {
            all_tasks += await Task.countDocuments({ uid: uid, pid: id });
            completed += await Task.countDocuments({ uid: uid, pid: id, checked: true });
            //console.log(`member = ${uid} t = ${all_tasks}`);
        }
        res.json({ progress: (completed / all_tasks) * 100 });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error');
    }
});

router.post('/get_users', async (req, res) => {
    console.log("API request received for fetch all Users");
    try {
        usrs = await User.find({},'_id email name');
        res.json(usrs);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Fetch error');
    }
});

router.post('/messages', async (req, res) => {
    console.log("API request received for fetch messages");
    var { id } = req.body;
    try {
        pr = await Project.findOne({ _id: id }, 'channelId');
        msgs = await fetchMessages(pr.channelId);
        res.json(msgs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Error');
    }
});

router.post('/send', async (req, res) => {
    console.log("API request received for send messages");
    var { id, msg } = req.body;
    try {
        pr = await Project.findOne({ _id: id }, 'channelId');
        if (await sendMessage(pr.channelId, msg)) { res.json({ success: true }); }
        else { res.status(400).json({ success: false }); }
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Error');
    }
});

router.post('/channel', async (req, res) => {
    console.log("API request received for fetch channel");
    var { id } = req.body;
    try {
        //pr = Project.findOne({ _id: id }, 'channelId');
        msgs = await fetchMessages(id);
        res.json(msgs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Error');
    }
});

router.post('/fetch_notice', async (req, res) => {
    console.log("API request received for fetch notifications");
    var { id } = req.body;
    try {
        msgs = await Notifications.find({ uid: id });
        res.json(msgs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Error')
    }
});
module.exports = router;