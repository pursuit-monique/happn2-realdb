const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require("cors");
const { log_error, log } = require('./logs_.js');
/////////////////////////////////////////////////
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.static("./public"));
//middle ware/////////
require('./session-config')(app);
require('./controllers/load-language').getTranslation(app);
//control routing entry////////////////////////////////////////////
const github = require('./controllers/github-webhook.js');
const user = require('./controllers/user-control.js');
//common routing//////////////////////////////////////////////////
app.use('/webhook', github);
app.use('/user', user);
//error routing//////////////////////////////////////////////////
app.get("*", (req, res) => {
  log_error("404");
  const file_path = `${__dirname}/public/index.html`;
  console.log(fs.existsSync(file_path));
  if (fs.existsSync(file_path)) {
    res.sendFile(file_path);
  } else res.status(404).send(`<div style="height:100%;width:100%;display: flex;"><h1 style='margin:auto;'>404 [File not found]</h1></div><p style='position: absolute;bottom: 0;right: 0;margin-right: 3%'> by [Happn]. 2023 </p>`);
});
////////////////////////////////////////////////
module.exports = app;