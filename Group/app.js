'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const PORT = 80;
const HOST = '0.0.0.0';

let app = express();

// MIDDLEWARES
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// ROUTES
let groupRouter = require("./src/routes/group")

app.use("/api/groups", groupRouter);

app.listen(PORT, HOST, () => {
	console.log(`Running on http://${HOST}:${PORT}`);
});
 