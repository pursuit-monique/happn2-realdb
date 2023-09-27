const db = require("../db/db-config");

const create_new_event = async (happnJson) => {
  try {

    const ret = await db.tx(async t => {
      // re-organize data
      const happen_template = {
        'name': 50,
        'description': 1000,
        'create_time': 50,
        "creator": 50
      }
      happnJson.create_time = new Date().toUTCString();
      for (let key in happen_template) {
        happen_template[key] = filter_value(happnJson[key], happen_template[key]);
      }
      //insert happen
      const happn = await t.one(`INSERT INTO "happen" 
        (${Object.keys(happen_template).join(',')}) 
        VALUES(${Object.keys(happen_template).map(el => `$[${el}]`).join(",")}) 
      RETURNING *;`, happen_template);

      //re-organize data
      const happen_detail_template = {
        "happn_id": "number",
        "lat": "number",
        "lng": "number",
        "start_time": 50,
        "end_time": 50,
        "creator": 50
      }
      const detail_image_template = {
        "file_hash": 260,
        "timestamp": 50,
        "originalname": 100,
        "mimetype": 50,
        "size": "number"
      }
      //多个图像对多个事件细节
      const { happnDetail, imagesRet } = happnJson;
      const values = [];
      for (let item of happnDetail) {
        item.happn_id = happn.id;
        item.creator = happn.creator;
        const string_arr = [];
        for (let key in happen_detail_template) {
          string_arr.push("'" + filter_value(item[key], happen_detail_template[key]) + "'");
        }

        //re-organize and vaild the images data
        const images_arr = [];
        for (let image_hash in imagesRet) {
          imagesRet[image_hash].file_hash = image_hash;
          imagesRet[image_hash].timestamp = new Date().toUTCString();
          let image_arr = [];
          for (let key in detail_image_template) {
            image_arr.push("'" + filter_value(imagesRet[image_hash][key], detail_image_template[key]) + "'");
          }
          images_arr.push(`((SELECT id FROM happen_detail), ${image_arr.join(",")})`);

        }

        values.push({
          detail: "(" + string_arr.join(",") + ")",
          images: images_arr
        });
      }

      const happn_detail = [];
      for (let { detail, images } of values) {
        happn_detail.push(await t.one(`
        WITH happen_detail AS (
          INSERT INTO happen_detail (${Object.keys(happen_detail_template).join(',')})
          VALUES ${detail}
          RETURNING *
        ),
        happen_detail_images AS (
          INSERT INTO happen_detail_images (happen_detail_id, ${Object.keys(detail_image_template).join(',')})
          VALUES ${images.join(',')}
        )
        SELECT * FROM happen_detail;
        `, {}));
      }
      console.log("happn_detail", happn_detail);
      return { happn, happn_detail };
    });
    return ret;

  } catch (error) {
    console.error(error);
    return false;
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
      console.log("default", typeof filter);
      return val;

  }

}
module.exports = { create_new_event }