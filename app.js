const express = require("express");
const app = express();
const fs = require('fs');
const cors = require("cors");
const { log_error, log, set_debug_mode } = require('./logs_.js');
const verifyUserLogin = require('./controllers/user-control.js').verifyUserLogin;
set_debug_mode(true);
/////////////////////////////////////////////////
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ type: "application/json", limit: "1mb" }));
app.use(express.static("./public"));
//middle ware/////////
require('./session-config')(app);
require('./controllers/load-language').getTranslation(app);
//control routing entry////////////////////////////////////////////
const github = require('./controllers/github-webhook.js');
const user = require('./controllers/user-control.js').uc;
const event = require('./controllers/event-control.js');
const public_access = require('./controllers/public-access.js');
const event_public_access = require('./controllers/public-event-control.js');
//common routing - login route//////////////////////////
app.use('/webhook', github);
app.use('/user', user);
app.use('/event', verifyUserLogin, event);
//common routing - guest route//////////////////////////
app.use('/public_access', public_access);
app.use('/event_public_access', event_public_access);
//error routing////////////////////////////////
app.get("*", (req, res) => {
  log_error("404", req.originalUrl);
  const file_path = `${__dirname}/public/index.html`;
  if (fs.existsSync(file_path)) {
    res.sendFile(file_path);
  } else res.status(404).send(`<div style="height:100%;width:100%;display: flex;"><h1 style='margin:auto;'>404 [File not found]</h1></div><p style='position: absolute;bottom: 0;right: 0;margin-right: 3%'> by [Happn]. 2023 </p>`);
});
////////////////////////////////////////////////
module.exports = app;