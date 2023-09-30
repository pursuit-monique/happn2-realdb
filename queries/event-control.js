const db = require("../db/db-config");
const { log_error, performance_timer } = require('../logs_.js');
const { clean_up_uuid } = require('../str_filter');
////////////////////////////////////////////////
function happen_template_to_save_() {
  return {
    'name': 50,
    'description': 1000,
    'create_time': 50,
    "creator": 50
  }
}
const happen_detail_template_to_save_ = () => ({
  "happn_id": 50,
  "lat": "number",
  "lng": "number",
  "start_time": 50,
  "end_time": 50,
  "creator": 50
})

const detail_image_template_to_save_ = () => ({
  "file_hash": 260,
  "timestamp": 50,
  "originalname": 100,
  "mimetype": 50,
  "size": "number"
})
const happen_template_to_show_ = () => ({
  "name": "",
  "description": "",
  "extra_info": "",
  "status": "",
  "create_time": "",
  "creator": ""
})
const happen_detail_template_to_show_ = () => ({
  "id": "",
  "lat": "",
  "lng": "",
  "extra_info": "",
  "creator": "",
  "start_time": "",
  "end_time": "",
})
const detail_image_template_to_show_ = () => ({
  "file_hash": 260,
  "timestamp": 50,
  "originalname": 100,
  "mimetype": 50,
  "size": "number"
})
/////////////////////////////////////////////////
const create_new_event = async (happnJson) => {
  const happen_t_to_save = happen_template_to_save_();
  const detail_t_to_save = happen_detail_template_to_save_();
  const image_t_to_save = detail_image_template_to_save_();
  const detail_t_to_show = happen_detail_template_to_show_();
  const image_t_to_show = detail_image_template_to_show_();
  //performance logger
  const pt = new performance_timer();
  //draw an connection from the pool
  const connection = await db.connect();
  try {
    const current_date = new Date().toUTCString();
    const ret = await connection.tx(async t => {
      pt.add_tick("transaction created");
      // re-organize data
      happnJson.create_time = current_date;
      for (let key in happen_t_to_save) {
        happen_t_to_save[key] = filter_value(happnJson[key], happen_t_to_save[key]);
      }
      pt.add_tick("inserting happn");
      //insert happen
      const happn = await t.one(`
        INSERT INTO "happen" 
        (${Object.keys(happen_t_to_save).join(',')}) 
        VALUES(${Object.keys(happen_t_to_save).map(el => `$[${el}]`).join(",")}) 
      RETURNING * ;`, happen_t_to_save);
      //re-organize data
      const { happnDetail, imagesRet } = happnJson;
      const values = [];
      for (let item of happnDetail) {
        item.happn_id = happn.id;
        item.creator = happn.creator;
        const string_arr = [];
        for (let key in detail_t_to_save) {
          string_arr.push("'" + filter_value(item[key], detail_t_to_save[key]) + "'");
        }
        //re-organize and vaild the images data
        const images_arr = [];
        for (let image_hash in imagesRet) {
          imagesRet[image_hash].file_hash = image_hash;
          imagesRet[image_hash].timestamp = current_date;
          let image_arr = [];
          for (let key in image_t_to_save) {
            image_arr.push("'" + filter_value(imagesRet[image_hash][key], image_t_to_save[key]) + "'");
          }
          images_arr.push(`($[detail_id], ${image_arr.join(",")})`);
        }
        values.push({
          detail: "(" + string_arr.join(",") + ")",
          images: images_arr
        });
      }
      pt.add_tick("adding detail");
      const happn_detail = [];
      //insert detail and images
      for (let { detail, images } of values) {
        const ret_happen_detail = await t.one(`
          INSERT INTO happen_detail (${Object.keys(detail_t_to_save).join(',')})
          VALUES ${detail}
          RETURNING ${Object.keys(detail_t_to_show).join(',')};
        `);
        pt.add_tick("adding images");
        if (images.length > 0) {
          ret_happen_detail.images = await t.many(`
          INSERT INTO happen_detail_images (happen_detail_id,${Object.keys(image_t_to_save).join(',')})
          VALUES ${images.join(',')} 
          RETURNING ${Object.keys(image_t_to_show).join(',')}`,
            { detail_id: ret_happen_detail.id });
          happn_detail.push(ret_happen_detail);
        }
      }
      return { happn, happn_detail };
    });
    return ret;
  } catch (error) {
    log_error(error);
    return false;
  } finally {
    pt.done();
    //release the connection back to the pool
    if (connection) connection.done();
  }
}

const get_happn_by_id = async (happn_id) => {
  //performance logger
  const pt = new performance_timer();
  //draw an connection from the pool
  const connection = await db.connect();
  try {
    const happn_ret = await get_happn_by_id_t(happn_id, connection);
    if (happn_ret.id === undefined) return happn_ret;
    const detail_ret = await get_happn_detail_by_happn_id_t(happn_ret.id, connection);
    const detail_ret_list = detail_ret.map(el => el.id);
    const images_ret = await get_happn_detail_images_by_happn_detail_id_t(detail_ret_list, connection);

    return { happn_ret, detail_ret, images_ret };

  } catch (error) {
    log_error(error);
    return {};
  } finally {
    pt.done();
    if (connection) connection.done();
  }
}

const get_happn_by_id_t = async (happn_id, transaction = db) => {
  try {
    const ret = await transaction.one(`SELECT * FROM happen WHERE id = $[happn_id]`, { happn_id });
    return ret;
  } catch (error) {
    log_error(error);
    return {};
  }
}
const get_happn_detail_by_happn_id_t = async (happn_id, transaction = db) => {
  try {
    const ret = await transaction.many(`SELECT * FROM happen_detail WHERE happn_id = $[happn_id]`, { happn_id });
    return ret;
  } catch (error) {
    log_error(error);
    return [];
  }
}
const get_happn_detail_by_id_t = (happn_detail_id, transaction = db) => {
  try {

  } catch (error) {

  }
}

const get_happn_detail_images_by_happn_detail_id_t = async (happn_detail_id_arr, transaction = db) => {
  try {
    const image_t_to_show = detail_image_template_to_show_();
    happn_detail_id_arr = happn_detail_id_arr.map(el => ("'" + clean_up_uuid(el) + "'"));
    const ret = await transaction.manyOrNone(`SELECT ${Object.keys(image_t_to_show).join(",")} FROM happen_detail_images WHERE happen_detail_id IN (${happn_detail_id_arr.join(",")})`);
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
      //remove \ and ' from string
      return val.slice(0, filter).replace('\\', "").replace("'", "\'");
    default:
      console.log("event-control-filter-value default", typeof filter);
      return val;
  }
}
module.exports = { create_new_event, get_happn_by_id }