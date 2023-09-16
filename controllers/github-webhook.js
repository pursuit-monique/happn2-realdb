const express = require("express");
const github = express.Router();

const { exec } = require('child_process');
const crypto = require('crypto');
const { log_error, log } = require('../logs_.js');

github.post('/', (req, res) => {
  // 拉取最新的代码
  try {
    console.log('Github webhook trigger', req.body);
    /* req.body example 
      Github webhook trigger { messages: [ { role: 'user', content: 'hello' } ], userID: ' ' }
    */
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
})


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


module.exports = github;