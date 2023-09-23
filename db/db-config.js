const pgp = require("pg-promise")();
require("dotenv").config();

const conString = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`;

const db = pgp(conString);

module.exports = db;