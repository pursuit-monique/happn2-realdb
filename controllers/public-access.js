const express = require("express");
const pa = express.Router();
const { processed_file_path } = require('../_variables_.js');
const { user_input_letter_and_numbers_only } = require('../_str_filter_.js');
const fs = require('fs');
///////////////////////////////////////////////////////
pa.get("/", async (req, res) => {
  try {
    res.json({ payload: "" });
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
})

pa.get('/check_image_exist/:file_hash', async (req, res) => {
  try {
    const { file_hash } = req.params;
    const ret = fs.existsSync(`${processed_file_path}${user_input_letter_and_numbers_only(file_hash)}`);
    res.json({ payload: { exists: ret } });
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
});
///////////////////////////////////////////////////////
module.exports = pa;