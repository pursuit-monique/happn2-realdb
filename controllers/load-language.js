const express = require("express");
const ll = express.Router();

function getTranslation(app) {
  app.use(function (req, res, next) {
    try {
      //attach translate function to req
      req.trans = (str) => { return str };
      next();
    } catch (error) {
      console.error(error);
      next();
    }
  })
}

module.exports = {
  ll,
  getTranslation,
};

