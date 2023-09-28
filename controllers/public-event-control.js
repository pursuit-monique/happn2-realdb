const express = require("express");
const pec = express.Router();
const { log_error, log } = require('../logs_.js');
const { processed_file_path } = require('../variables_.js');
const { user_input_letter_and_numbers_only } = require('../str_filter.js');
const fs = require('fs');
///////////////////////////////////////////
pec.get('/get_happn_by_id', async (req, res) => {

});

pec.get('/get_happn_image/:file_hash', async (req, res) => {
  try {
    let { file_hash } = req.params;
    const file_path = processed_file_path + "/" + user_input_letter_and_numbers_only(file_hash);
    if (fs.existsSync(file_path)) {
      //exist
      res.sendFile(file_path);
    } else {
      res.status(404).json({ payload: "file not found." });
    }
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
});
/////////////////////////////////////////////////
module.exports = pec