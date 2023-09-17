const express = require("express");
const ec = express.Router();
const { log_error, log } = require('../logs_.js');

///////////////////////////////////////////////////////
ec.get("/", async (req, res) => {
  try {
    res.json({ payload: "" });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
})
///////////////////////////////////////////////////////
module.exports = ec;