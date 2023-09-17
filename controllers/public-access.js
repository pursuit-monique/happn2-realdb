const express = require("express");
const pa = express.Router();
const { log_error, log } = require('../logs_.js');
///////////////////////////////////////////////////////
pa.get("/", async (req, res) => {
  try {
    res.json({ payload: "" });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
})
///////////////////////////////////////////////////////
module.exports = pa;