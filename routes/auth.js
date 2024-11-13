const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = '121fe6a79ee33ee25cc1bed26489d3459e02114676026d24227d9a88fbcfccbfeb0fc4f9194e299878d4a207a862e8739c074a7a4ec18e34650ded87f1ddf84ddefb3e9242de27391dc6496c80c3a2ad51afdfebf519c98a3c8e225e527d386df5254f3330ad225100e78e27c39fc2842326423d02d80c96b17a185a6e87894188a0084720c5c0e3ef5282496c0a26c9c42788dc7a1134ea524ab5e5b7ec81bde7d1406ef02998bcb963c464fedec2f2fa89a23973cf0b80a6948759bb56f6642c21ea96282eb6017baade591716f99739c45e73ee353264a32591bdd98ad4ce6a454c470d26f8168f4bc66abf77825db5880bdee99e8186e766f618f73cac0d';

//console.log('auth.js setup complete..')

router.post('/register', async (req, res) => {
    var { name, pass, email } = req.body;
    console.log("API request received for register:" + email);
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'user already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const epass = await bcrypt.hash(pass, salt);
        user = new User({ name:name, pass:epass, email:email});
        await user.save();
        //const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ userId: user._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    var { email, pass } = req.body;
    console.log("API request received for login:" + email );
    try {
        // Check if the user exists
        const user =  await User.findOne({email});
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch =  await bcrypt.compare(pass, user.pass);
        if (!isMatch) {
        //if (pass != user.pass) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        //const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        
        return res.status(200).json({ userId: user._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/change_pass', async (req, res) => {
    var {id, email, old_pass, new_pass } = req.body;
    console.log("API request received for change password for email:" + email);
    try {
        let usr = await User.findOne({ _id: id });
        const isMatch = await bcrypt.compare(old_pass, usr.pass);
        if (usr.email === email && isMatch) {
            const salt = await bcrypt.genSalt(10);
            const epass = await bcrypt.hash(new_pass, salt);
            await User.updateOne({ _id: id }, { pass: epass });
            res.json({ msg: "Success" });
        }
        else {
            res.json({ msg: "Fail" });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }

});

router.post('/verify', async (req, res) => {
    var { email, name } = req.body;
    try {
        var u = await User.findOne({ email: email, name: name });
        if (u) { res.json({ msg: "Sucess" }); }
        else { res.json({ msg: "Fail" }); }
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Error');
    }
});

router.post('/forgot_pass', async (req, res) => {
    var { email, new_pass } = req.body;
    console.log("API request received for forgot password for email:" + email);
    try {
        let usr = await User.findOne({ email: email });
        const salt = await bcrypt.genSalt(10);
        const epass = await bcrypt.hash(new_pass, salt);
        await User.updateOne({ _id: usr._id }, { pass: epass });
        res.json({ msg: "Success" });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }

});

/*
router.post('/assign_role', async (req, res) => {
    var { uid, new_role } = req.body;
    try {
        let usr = await User.findOne({ uid: uid }, 'uid');
        if (!usr) { return res.status(300).send('role not updated'); }
        await User.updateOne({ uid: uid }, { $set: { role: new_role } });
        res.json({ msg: 'role updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
*/
module.exports = router;