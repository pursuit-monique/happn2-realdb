const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const cors = require("cors");
const { log_error, log } = require('./logs_.js');
/////////////////////////////////////////////////
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
require('./session-config')(app);
//control routing////////////////////////////////////////////


//common request//////////////////////////////////////////////
app.post('/webhook', (req, res) => {
  // 拉取最新的代码
  try {
    exec('git pull', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        log_error(`exec error: ${error}`);
        return res.status(500).json({ error: `Error on git pull: ${stderr}` });
      }
      log(stdout);
      return res.status(200).json({ payload: 'Successfully pulled from GitHub.' });
    });
  } catch (error) {
    log_error(`exec error: ${error}`);
    return res.status(500).json({ error: `Error on git pull: ${error.message}` });
  }
});

function verifyGitHubSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).send('Missing X-Hub-Signature header');
  }
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
  if (signature !== digest) {
    return res.status(401).send('Invalid X-Hub-Signature header');
  }
  next();
}

app.get("*", (req, res) => {
  const file_path = `${__dirname}/public/index.html`;
  if (fs.existsSync(file_path)) {
    res.sendFile(file_path);
  } else res.status(404).send(`<h3>file not found.</h3><p style='position: absolute;bottom: 0;right: 0;margin-right: 3%'> by [Happn]. 2023 </p>`);
});
////////////////////////////////////////////////
module.exports = app;