const express = require("express");
const pec = express.Router();
const { processed_file_path } = require('../variables_.js');
const { user_input_letter_and_numbers_only, clean_up_uuid } = require('../str_filter.js');
const fs = require('fs');
const event_query = require('../queries/event-control.js');
///////////////////////////////////////////
pec.get('/get_happn_by_id/:happn_id', async (req, res) => {
  try {
    const happn_id = clean_up_uuid(req.params.happn_id);
    const { happn_ret, detail_ret, images_ret } = await event_query.get_happn_by_id(happn_id);
    res.json({
      "payload": {
        "happn": happn_ret,
        "images": images_ret,
        "detail": detail_ret
      }
    });
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
});

pec.get('/get_happn_image/:file_hash', async (req, res) => {
  try {
    req.log("hello");
    let { file_hash } = req.params;
    const file_path = processed_file_path + user_input_letter_and_numbers_only(file_hash);
    if (fs.existsSync(file_path)) {
      //exist
      res.sendFile(file_path);
    } else {
      res.status(404).json({ payload: "file not found." });
    }
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
});
/////////////////////////////////////////////////
module.exports = pec