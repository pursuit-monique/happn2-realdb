const db = require("../db/db-config");
const crypto = require('crypto');
/////////////////////////////////////////////////////////////////
const create_third_party_user = async (user_json) => {
  const [col_name, val_name] = [[], []];
  const templete = { "user_id": "text", "username": "text", "current_session": "text", "password": "text", "last_seen": "text", "status": "int", "ip_address": "text", "email": "text", "third_party_login": "int" };
  for (let key in templete) if (user_json[key]) {
    col_name.push(key);
    val_name.push(`$[${key}]`);
  }
  if (col_name.length === 0) return false;
  try {
    const ret = await db.one(`INSERT INTO "user" ("${col_name.join('", "')}") VALUES (${val_name.join(", ")}) ON CONFLICT (user_id) DO UPDATE SET last_seen = $[last_seen], ip_address = $[ip_address], current_session = $[current_session] RETURNING *`, user_json);
    return ret;
  } catch (error) {
    console.error(error);
    return false;
  }
}


module.exports = { create_third_party_user }