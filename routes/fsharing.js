const express = require('express');
const path = require('path');
const Project = require('../models/Projects');
const fileUpload = require('express-fileupload');
const file = require('../models/files');
const fs = require('fs');

const router = express.Router();

if (!fs.existsSync(path.join(__dirname, '../Documents'))) {
    fs.mkdirSync(path.join(__dirname, '../Documents'));
}

router.use(fileUpload());

router.post('/upload', async function (req, res) {
    console.log("API request received for file upload");
    if (!req.files || !req.files.file) {
        return res.status(422).send('No files were uploaded');
    }
    var upfile = req.files.file;
    console.log(req.uid, req.pid);
    var { pid , uid } = req.body;
    var Path = path.join(__dirname,`../Documents/${pid}/${uid}_` + upfile.name);
    upfile.mv(Path, function (err) {
        if (err) { return res.status(500).send(err); }
        res.send('File Uploaded');
    });
    try {
        var f = new file({ pid: pid, filename: upfile.name, filepath: Path,uid:uid });
        await f.save();
    } catch (err) {
        console.error(err.message);
        es.status(400).send('File upload failed');
    }

});

router.post('/fetch_files', async (req, res) => {
    var { id } = req.body;
    let ffs = await file.find({ pid: id });
    return res.json(ffs);
});

router.get('/download', async (req, res) => {
    var id = req.query.id;
    console.log("API request received for download - " + id);
    try {
        let f = await file.findOne({ _id: id });
        const Path = path.join(__dirname, '..', f.filepath);
        let filename = `${f.uid}_${f.filename}`; 
        if (fs.existsSync(Path)) {
            res.download(Path, filename, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).send('Error downloading file.');
                }
            });
        } else {
            res.status(404).send('File not found.');
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send('cannot find filename in database');
    }
});

router.post('/delete', async (req, res) => {
    var { id } = req.body;
    console.log("API request received for file delete - " + id);
    try {
        let f = await file.findOne({ _id: id });
        const Path = path.join(__dirname, '..', f.filepath);
        fs.unlinkSync(Path);
        var r = await file.deleteOne({ _id: id });
        res.json({ msg: "deleted" });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('error occured internally');
    }
});
module.exports = router;