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
      const happn = await db.one(`INSERT INTO "happen" 
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
      const { happnDetail } = happnJson;
      const values = [];
      for (let item of happnDetail) {
        item.happn_id = happn.id;
        item.creator = happn.creator;
        const string_arr = [];
        for (let key in happen_detail_template) {
          string_arr.push("'" + filter_value(item[key], happen_detail_template[key]) + "'")
        }
        values.push("(" + string_arr.join(",") + ")");
      }

      const happn_detail = await db.one(`INSERT INTO "happen_detail" 
        (${Object.keys(happen_detail_template).join(',')}) 
        VALUES ${values.join(",")}
      RETURNING *;`);
      return { happn, happn_detail };
    });
    return ret;

  } catch (error) {
    console.error(error);
    return false;
  }
}

function filter_value(val, filter) {
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