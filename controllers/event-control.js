const express = require("express");
const ec = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const { processed_file_path, event_image_file_size_limit, event_json_size_limit } = require('../variables_.js');
const upload = multer({
  dest: "uploads/"
});
const { log_error, log } = require('../logs_.js');
const { create_new_event } = require('../queries/event-control.js');

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

ec.post('/new', upload.any(), async (req, res) => {
  try {
    //in this request, the header -> content-type should be "multipart/form-data;" 
    //json object
    const { happn } = req.body;
    if (happn.length > event_json_size_limit) {
      throw new Error(`JSON object over size.`);
    }
    const happnJson = JSON.parse(happn);

    happnJson['creator'] = req.session.userInfo.id;
    //files
    const imagesRet = {};
    if (req.files?.length > 0) for (let file of req.files) {
      const ret = process_upload_images(file);
      if (ret) imagesRet[ret.file_hash] = file;
    }
    //check the happn json's happnDetail's images with uploaded file
    happnJson.happnDetail.forEach((happn_detail, idx) => {
      happn_detail.images.forEach((image, sub_idx) => {
        if (imagesRet[image.hash] === undefined) {
          throw new Error("uploaded file hash isn't match with uploaded JSON object");
        }
      })
    })
    happnJson.imagesRet = imagesRet;
    //insert into db
    const ret = await create_new_event(happnJson);
    //return it to frondend
    res.json({ payload: ret });
  } catch (error) {
    log_error(error);
    res.status(500).json({ error: error.message });
    //remove all uploaded file if error
    if (req.files?.length > 0) for (let file of req.files) {
      fs.unlinkSync(`${__dirname}/../${file.path}`);
    }
  }
})

///////////////////////////////////////////////////////
function remove_file_from_local() {

}
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
    //file size check point
    const stats = fs.statSync(file_path);
    if (file.size !== stats.size) {
      throw new Error(`file size is not matched, real size (${stats.size}), but claiming (${file.size}).`);
    }

    if (file.size > event_image_file_size_limit) {
      throw new Error(`image file over size, max_limit = ${event_image_file_size_limit}`);
    }
    //file extension check point
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      throw new Error('Only images are allowed');
    }
    //create file hash
    const file_content = fs.readFileSync(file_path);
    const file_hash = crypto.createHash('sha256').update(file_content).digest('hex');
    //Processing file, if exists just delete the uploaded file
    if (fs.existsSync(`${processed_file_path}/${file_hash}`)) {
      fs.unlinkSync(file_path);
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