const db = require("../db/db-config");
const { log_error, log } = require('../logs_.js');
const { clean_up_uuid } = require('../str_filter');
////////////////////////////////////////////////
const happen_template_to_save = {
  'name': 50,
  'description': 1000,
  'create_time': 50,
  "creator": 50
}
const happen_detail_template_to_save = {
  "happn_id": 50,
  "lat": "number",
  "lng": "number",
  "start_time": 50,
  "end_time": 50,
  "creator": 50
}
const detail_image_template_to_save = {
  "file_hash": 260,
  "timestamp": 50,
  "originalname": 100,
  "mimetype": 50,
  "size": "number"
}
const happen_template_to_show = {
  "name": "",
  "description": "",
  "extra_info": "",
  "status": "",
  "create_time": "",
  "creator": ""
}
const happen_detail_template_to_show = {
  "id": "",
  "lat": "",
  "lng": "",
  "extra_info": "",
  "creator": "",
  "start_time": "",
  "end_time": "",
}
const detail_image_template_to_show = {
  "file_hash": 260,
  "timestamp": 50,
  "originalname": 100,
  "mimetype": 50,
  "size": "number"
}
/////////////////////////////////////////////////
const create_new_event = async (happnJson) => {
  try {
    const current_date = new Date().toUTCString();
    // console.log(happnJson);
    const ret = await db.tx(async t => {
      // re-organize data
      happnJson.create_time = current_date;
      for (let key in happen_template_to_save) {
        happen_template_to_save[key] = filter_value(happnJson[key], happen_template_to_save[key]);
      }
      //insert happen
      const happn = await t.one(`INSERT INTO "happen" 
        (${Object.keys(happen_template_to_save).join(',')}) 
        VALUES(${Object.keys(happen_template_to_save).map(el => `$[${el}]`).join(",")}) 
      RETURNING *;`, happen_template_to_save);
      //re-organize data
      const { happnDetail, imagesRet } = happnJson;
      const values = [];
      for (let item of happnDetail) {
        item.happn_id = happn.id;
        item.creator = happn.creator;
        const string_arr = [];
        for (let key in happen_detail_template_to_save) {
          string_arr.push("'" + filter_value(item[key], happen_detail_template_to_save[key]) + "'");
        }
        //re-organize and vaild the images data
        const images_arr = [];
        for (let image_hash in imagesRet) {
          imagesRet[image_hash].file_hash = image_hash;
          imagesRet[image_hash].timestamp = current_date;
          let image_arr = [];
          for (let key in detail_image_template_to_save) {
            image_arr.push("'" + filter_value(imagesRet[image_hash][key], detail_image_template_to_save[key]) + "'");
          }
          images_arr.push(`($[detail_id], ${image_arr.join(",")})`);
        }
        values.push({
          detail: "(" + string_arr.join(",") + ")",
          images: images_arr
        });
      }
      const happn_detail = [];
      //insert detail and images
      for (let { detail, images } of values) {
        const ret_happen_detail = await t.one(`
          INSERT INTO happen_detail (${Object.keys(happen_detail_template_to_save).join(',')})
          VALUES ${detail}
          RETURNING ${Object.keys(happen_detail_template_to_show).join(',')};
        `);

        ret_happen_detail.images = await t.many(`
        INSERT INTO happen_detail_images (happen_detail_id,${Object.keys(detail_image_template_to_save).join(',')})
        VALUES ${images.join(',')} 
        RETURNING ${Object.keys(detail_image_template_to_show).join(',')}`,
          { detail_id: ret_happen_detail.id });
        happn_detail.push(ret_happen_detail);
      }
      return { happn, happn_detail };
    });
    return ret;
  } catch (error) {
    log_error(error);
    return false;
  }
}

const get_happn_by_id_t = (happn_id, t = db) => {

}

const get_happn_detail_by_id_t = (happn_detail_id, t = db) => {

}

const get_happn_detail_images_by_happn_detail_id_t = async (happn_detail_id, t = db) => {
  try {
    happn_detail_id = clean_up_uuid(happn_detail_id);
    const ret = await t.many(`SELECT ${Object.keys(detail_image_template_to_show).join(",")} FROM happen_detail_images WHERE happen_detail_id = $[happn_detail_id]`, { happn_detail_id });
    return ret;
  } catch (error) {
    log_error(error);
    return [];
  }
}

function filter_value(val, filter) {
  if (val === undefined) return "";
  switch (typeof filter) {
    case "string":
      return isNaN(Number(val)) ? 0 : val;
    case "number":
      return val.slice(0, filter).replace("'", "\'");
    default:
      console.log("event-control-filter-value default", typeof filter);
      return val;
  }
}
module.exports = { create_new_event }