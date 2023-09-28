const pgp = require("pg-promise")();
require("dotenv").config();

var connectionOptions = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  poolSize: 10,
  poolIdleTimeout: 10000
};
try {
  var db = pgp(connectionOptions);

} catch (error) {

}
// const conString = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`;

// const db = pgp(conString);

module.exports = db;