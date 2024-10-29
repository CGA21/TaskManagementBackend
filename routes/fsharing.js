const express = require('express');
const path = require('path');
const Project = require('../models/Projects');
const fileUpload = require('express-fileupload');
const file = require('../models/Files');

const router = express.Router();
const dir = '../Documents';

router.use(fileUpload());

router.post('/upload', async function (req, res, next) {
    if (!req.files || !req.files.file) {
        return res.status(422).send('No files were uploaded');
    }
    var upfile = req.files.file;
    var { pid , uid } = req.body;
    var path = dir + `/${pid}/${uid}_` + upfile.name;
    upfile.mv(path, function (err) {
        if (err) { return res.status(500).send(err); }
        res.send('File Uploaded');
    });
    try {
        var f = new file({ pid: pid, filename: upfile.name });
        await f.save();
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/fetch_files', async (req, res) => {
    var { id } = req.body;
    let ffs = file.find({ pid: id });
    return res.json(ffs);
});

router.get('/download', async (req, res) => {
    var { id } = req.body;
    try {
        let f = await file.findById(id);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('cannot find filename in database');
    }
    path = dir + `/${f.pid}/${f.uid}_` + f.name;
    res.download(path, (err) => {
        if (err) {
            if (!res.headersSent) { res.status(404).send('File not found'); }
            else {
                readStream.destroy();
                res.end();
            }
        }
    });
});

module.exports = router;