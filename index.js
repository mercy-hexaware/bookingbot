'use strict'
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
app.post('/booking', (req, res) => {
	console.log('webhook');
    console.log(req.body);
});