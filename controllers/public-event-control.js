const express = require("express");
const pec = express.Router();
const fs = require('fs');
const { processed_file_path } = require('../_variables_.js');
const { user_input_letter_and_numbers_only, clean_up_uuid } = require('../_str_filter_.js');
const event_query = require('../queries/event-control.js');
///////////////////////////////////////////
pec.get('/get_happn_by_id/:happn_id', async (req, res) => {
  try {
    const happn_id = clean_up_uuid(req.params.happn_id);
    const { happn_ret, detail_ret, images_ret } = await event_query.get_happn_by_id(happn_id);
    if (happn_ret === undefined) throw new Error(`happen Id ${happn_id} not found.`);
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

pec.post('/get_happns_by_ids', async (req, res) => {
  try {
    const ids = req.body;
    const ret = await event_query.get_happn_details_by_ids(ids);
    res.json({ payload: ret });
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
})

pec.get('/latest_happen_detail', async (req, res) => {
  try {

  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
});

pec.get('/get_happn_image/:file_hash', async (req, res) => {
  try {
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
module.exports = pec;