const express = require("express");
const ec = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const { processed_file_path, event_image_file_size_limit, event_json_size_limit, root_path, tmp_upload_file_path } = require('../_variables_.js');
const upload = multer({
  dest: tmp_upload_file_path
});
const { create_new_event, update_happn_detail, replace_happn_detail_images } = require('../queries/event-control.js');
if (!fs.existsSync(processed_file_path)) fs.mkdirSync(processed_file_path);
///////////////////////////////////////////////////////
ec.get("/", async (req, res) => {
  await req.genenal_procedure(req, res, async () => {
    res.json({ payload: "" });
  })
});

ec.post('/new', upload.any(), async (req, res) => {
  await req.genenal_procedure(req, res, async () => {
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
      const ret = process_upload_images_hash(file);
      if (ret) imagesRet[ret.file_hash] = file;
    }

    //check the happn json's happnDetail's images with uploaded file
    happnJson.happnDetail.forEach((happn_detail, idx) => {
      console.log(happn_detail.images)
      happn_detail.images.forEach((image, sub_idx) => {
        if (imagesRet[image.hash] === undefined && (image.isUpload === false) || image.isUpload === undefined) {
          //if the frontend said the file is exist on our end, check filehash
          if (!check_images_exist_by_hash(image.hash)) {
            throw new Error("uploaded file hash isn't match with uploaded JSON object.");
          }
        } else if (imagesRet[image.hash]) {
          //if front end sent a file, move the file to images dir
          console.log(imagesRet[image.hash]);
          fs.renameSync(
            path.join(tmp_upload_file_path, path.basename(imagesRet[image.hash])),
            `${processed_file_path}${image.hash}`
          );
        } else {
          //else remove the temporary file
          throw new Error("uploaded file unhandle situation.");
        }

      })
    });
    happnJson.imagesRet = imagesRet;
    //insert into db
    const ret = await create_new_event(happnJson, req.session.userInfo.id);
    //return it to frondend
    res.json({ payload: ret });
  }, (error) => {
    // on error remove all uploaded file 
    if (req.files?.length > 0) for (let file of req.files) {
      if (file.path) fs.unlinkSync(path.join(tmp_upload_file_path, path.basename(file.path)));
    }
  })
  // try {
  //   //in this request, the header -> content-type should be "multipart/form-data;" 
  //   //json object
  //   const { happn } = req.body;
  //   if (happn.length > event_json_size_limit) {
  //     throw new Error(`JSON object over size.`);
  //   }
  //   const happnJson = JSON.parse(happn);

  //   happnJson['creator'] = req.session.userInfo.id;
  //   //files
  //   const imagesRet = {};
  //   if (req.files?.length > 0) for (let file of req.files) {
  //     const ret = process_upload_images_hash(file);
  //     if (ret) imagesRet[ret.file_hash] = file;
  //   }

  //   //check the happn json's happnDetail's images with uploaded file
  //   happnJson.happnDetail.forEach((happn_detail, idx) => {
  //     happn_detail.images.forEach((image, sub_idx) => {
  //       if (imagesRet[image.hash] === undefined && image.isUpload === false) {
  //         //if the frontend said the file is exist on our end, check filehash
  //         if (!check_images_exist_by_hash(image.hash)) {
  //           throw new Error("uploaded file hash isn't match with uploaded JSON object.");
  //         }
  //       } else if (imagesRet[image.hash]) {
  //         //if front end sent a file, move the file to images dir
  //         fs.renameSync(
  //           path.join(tmp_upload_file_path, path.parse(imagesRet[image.hash].path).base),
  //           `${processed_file_path}${image.hash}`
  //         );
  //       } else {
  //         //else remove the temporary file
  //         throw new Error("uploaded file unhandle situation.");
  //       }

  //     })
  //   });
  //   happnJson.imagesRet = imagesRet;
  //   //insert into db
  //   const ret = await create_new_event(happnJson, req.session.userInfo.id);
  //   //return it to frondend
  //   res.json({ payload: ret });
  // } catch (error) {
  //   req.log_error(error);
  //   res.status(500).json({ error: error.message });
  //   //remove all uploaded file if error
  //   if (req.files?.length > 0) for (let file of req.files) {
  //     if (file.path) fs.unlinkSync(path.join(tmp_upload_file_path, path.parse(file.path).base));
  //   }
  // }
});

ec.put('/update_detail/:happn_detail_id', async (req, res) => {
  try {
    const { happn_detail_id } = req.params;
    const { happn_detail } = req.body;

    const ret = await update_happn_detail(happn_detail_id, req.session.userInfo.id, happn_detail);
    req.log(ret);

    res.json({ payload: "" });
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
});

ec.put('/replace_detail_images/:happn_detail_id', upload.any(), async (req, res) => {
  try {
    const { happn_detail_id } = req.params;
    const detail_images_meta = JSON.parse(req.body.detail_images_meta);
    const imagesRet = {};

    //if the request attached files, it should appear in the imagesRet
    if (req.files?.length > 0) for (let file of req.files) {
      const ret = process_upload_images_hash(file);
      if (ret) imagesRet[ret.file_hash] = file;
    }
    const ready_to_insert_images = [];
    for (let meta of detail_images_meta) {
      //if this hash is not uploading,
      if (!imagesRet[meta["hash"]]) {
        //if this hash is not exist in happn-images folder
        if (!check_images_exist_by_hash(meta["hash"])) {
          //ignore
          continue;
        }
      }
      //add to insert
      ready_to_insert_images.push({
        file_hash: meta.hash,
        originalname: meta.name,
        size: meta.size,
        mimetype: meta.type
      });
    }
    const ret = await replace_happn_detail_images(happn_detail_id, req.session.userInfo.id, ready_to_insert_images);
    //if successfully update the happn detail we should move the attached files back to happn-images folder
    if (ret) for (let hash in imagesRet) {
      //if put the files to happn-images
      fs.renameSync(
        `${tmp_upload_file_path}${path.parse(imagesRet[hash].path).base}`,
        `${processed_file_path}${hash}`
      );
    } else throw new Error(`happn detail id ${happn_detail_id} replace failed.`);
    res.json({ payload: ret });
  } catch (error) {
    req.log_error(error);
    res.status(500).json({ error: error.message });
  }
});
///////////////////////////////////////////////////////
function remove_file_from_local() {

}
function check_images_exist_by_hash(hash) {
  return fs.existsSync(`${processed_file_path}${hash}`);
}
function read_file_content_from_request_file(file) {
  let file_content = undefined;
  let file_path = undefined;

  if (file.path) {
    //if file have a path
    file_path = path.join(tmp_upload_file_path, path.parse(file.path).base);
    file_content = fs.readFileSync(file_path);
  } else {
    file_content = file.buffer;
  }
  return { file_content, file_path };
}
///////////////////////////////////////////////////////
function process_upload_images_hash(file) {
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
    // const file_path = `${__dirname}/../${file.path}`;
    const { file_content, file_path } = read_file_content_from_request_file(file);
    //file size check point
    if (file.size !== file_content.length) {
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
    const file_hash = crypto.createHash('sha256').update(file_content).digest('hex');

    return { file_hash };
  } catch (error) {
    req.log_error(error);
    return false;
  }
}

///////////////////////////////////////////////////////
module.exports = ec;