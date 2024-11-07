'use strict';

//express environment
const express = require('express');
const cors = require('cors');
const app = express();
const port = 1337;

//const bodyparser = require('body-parser');


//database environment
const mongoose = require('mongoose');
require('dotenv').config();
const db = process.env.MONGO_URL;

//app.use(bodyparser.urlencoded({ extended: true }));
//app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/file', require('./routes/fsharing'));

//database connection
mongoose.connect(db, {
//    tls: true,
//    tlsAllowInvalidCertificates: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((err) => {
    console.error('Error connecting to DB: ', err);
});

/*
app.get('/', (req, res) => {
    res.send('Hello World!!');
});
*/
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});