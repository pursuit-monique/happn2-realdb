const express = require("express");
const app = express();
const fs = require('fs');
const cors = require("cors");
const { log_error, log, set_debug_mode } = require('./_log_.js');
const verifyUserLogin = require('./controllers/user-control.js').verifyUserLogin;
set_debug_mode(true);
const { error_message } = require('./_error_code_.js');
/////////////////////////////////////////////////
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ type: "application/json", limit: "1mb" }));
app.use(express.static("./public"));
app.use((req, res, next) => {
  req.log = function () { log(req.route, ...arguments) };
  req.log_error = function () { log_error(req.route, ...arguments) };
  req.genenal_procedure = genenal_procedure;
  next();
})
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
  req.log_error("404", req.originalUrl);
  const file_path = `${__dirname}/public/index.html`;
  if (fs.existsSync(file_path)) {
    res.sendFile(file_path);
  } else res.status(404).send(`<div style="height:100%;width:100%;display: flex;"><h1 style='margin:auto;'>404 [File not found]</h1></div><p style='position: absolute;bottom: 0;right: 0;margin-right: 3%'> by [Happn]. 2023 </p>`);
});
///////////////////////////////////////////////////////
async function genenal_procedure(req, res, fn) {
  try {
    await fn();
  } catch (error) {
    req.log_error(error);
    const message = error_message(error.message);
    const code = message !== error.message ? error.message : 500;
    res.status(Number(code)).json({ error: message });
  } finally {

  }
}
////////////////////////////////////////////////
module.exports = app;