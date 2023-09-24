const db = require("../db/db-config");

const create_new_event = async (happnJson) => {
  try {
    const happen_template = ['name', "description", "create_time", "creator"];
    const happen_detail_template = ["happn_id", "lat", "lng", "start_time", "end_time", "creator"];

    const ret = await db.tx(async t => {
      //insert happen
      const happn = await db.one(`INSERT INTO "happen" 
        (${happen_template.join(',')}) 
        VALUES(${happen_template.map(el => `$[${el}]`).join(",")}) 
      RETURNING *;`, { ...happnJson, create_time: new Date().toUTCString() });

      const { happnDetail } = happnJson;
      //insert happen_detail
      const values = happnDetail.map(el => {
        const { id: happn_id, creator } = happn;
        el.happn_id = happn_id;
        el.creator = creator;
        return "(" + happen_detail_template.map(sel => `'${el[sel]}'`).join(",") + `)`;
      }).join(",");
      const happn_detail = await db.one(`INSERT INTO "happen_detail" 
        (${happen_detail_template.join(',')}) 
        VALUES ${values} 
      RETURNING *;`);
      return { happn, happn_detail };
    });
    return ret;

  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { create_new_event }