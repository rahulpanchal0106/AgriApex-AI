require('dotenv').config();
const express = require('express');
const dataPost = require('./controllers/dataPost.controller');
const cors = require('cors')

const app = express();

app.use(cors())

app.use(express.json());
app.post('/data',dataPost);

app.listen(5555, () => {
    console.log("Listening at 5555");
});
