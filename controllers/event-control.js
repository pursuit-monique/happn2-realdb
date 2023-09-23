const express = require("express");
const ec = express.Router();
const { log_error, log } = require('../logs_.js');
const { create_new_event } = require('../queries/event-control.js');
///////////////////////////////////////////////////////
ec.get("/", async (req, res) => {
  try {
    res.json({ payload: "" });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
})

ec.post('/new', async (req, res) => {
  try {
    const { happnJson } = req.body;
    happnJson['creator'] = req.session.userInfo.userId;

    const ret = await create_new_event(happnJson);

    console.log(ret);

    res.json({ payload: "" });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
})
///////////////////////////////////////////////////////
module.exports = ec;