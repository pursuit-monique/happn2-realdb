const express = require("express");
const ec = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { log_error, log } = require('../logs_.js');
const { create_new_event } = require('../queries/event-control.js');
const { user_input_letter_and_numbers_only } = require('../str_filter.js');
const { processed_file_path, event_image_file_size_limit } = require('../variables_.js');
if (!fs.existsSync(processed_file_path)) fs.mkdirSync(processed_file_path);
///////////////////////////////////////////////////////
ec.get("/", async (req, res) => {
  try {
    res.json({ payload: "" });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
})

//this entry moved to public-access.js
// ec.get('/check_image_exist/:file_hash', async (req, res) => {
//   try {
//     const { file_hash } = req.params;
//     const ret = fs.existsSync(processed_file_path + user_input_letter_and_numbers_only(file_hash));
//     res.json({ payload: ret });
//   } catch (error) {
//     log_error(error);
//     res.status(500).json({ error: error.message });
//   }
// })

ec.post('/new', upload.any(), async (req, res) => {
  try {
    console.log(req.body);
    // const { happnJson } = req.body;
    // happnJson['creator'] = req.session.userInfo.userId;
    console.log("files", req.files)
    if (req.files?.length > 0) {
      for (let file of req.files) {
        const ret = process_upload_images(file);
        console.log(ret);
      }
    }
    // const ret = await create_new_event(happnJson);

    res.json({ payload: "" });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
  }
})

///////////////////////////////////////////////////////
function process_upload_images(file) {
  try {
    /** example of file
     * {
    fieldname: 'files',
    originalname: 'users.sql',
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    destination: 'uploads/',
    filename: '756535dd4b9bc81d0551dae1bad89faf',
    path: 'uploads/756535dd4b9bc81d0551dae1bad89faf',
    size: 5104
  }
     */
    const file_path = `${__dirname}/../${file.path}`
    //check size check point
    const stats = fs.statSync(file_path);
    if (file.size !== stats.size) {
      throw new Error(`file size is matched, real size (${stats.size}), but claiming (${file.size}).`);
    }
    if (file.size > event_image_file_size_limit) {
      throw new Error(`image file size over the limit, max_limit = ${event_image_file_size_limit}`);
    }
    //create file hash
    const file_content = fs.readFileSync(file_path);
    const file_hash = crypto.createHash('sha256').update(file_content).digest('hex');
    //Processing file, if exists just delete the upload file
    if (fs.existsSync(`${processed_file_path}/${file_hash}`)) {
      fs.unlinkSync(file_hash);
    } else {
      fs.renameSync(file_path, `${processed_file_path}/${file_hash}`);
    }
    return { result: "success", file_hash };
  } catch (error) {
    log_error(error);
    return false;
  }
}
///////////////////////////////////////////////////////
module.exports = ec;