const express = require("express");
const crypto = require('crypto');
const uc = express.Router();
const str_filter = require('../str_filter');
const { verifyIdToken } = require("../firebase_");
///user/////////////////////////////////////////////////
uc.get("/login_available", async (req, res) => {
  try {
    res.json({ payload: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

uc.post('/login_by_third_party', async (req, res) => {
  try {
    let { idToken } = req.body;

    idToken = idToken.slice(0, 1145);
    const userInfo = await verifyIdToken(idToken);
    if (userInfo.uid !== undefined) {
      const { user_id, email, name } = userInfo;
      let newUserJson = {
        user_id: user_id,
        password: user_password_hash(generateUsername()),
        availability: true,
        current_session: req.sessionID,
        username: name,
        last_seen: new Date().toUTCString(),
        ip_address: req.socket.remoteAddress,
        email,
        third_party_login: 1
      }
      const ret = await create_third_party_user(newUserJson);

      if (ret !== false) {
        if (ret.availability) {
          //success
          const templete = login_returning_template();
          for (let x in templete) if (ret[x]) templete[x] = ret[x];

          res.json({ data: templete });
          //add user id back to session
          templete['userId'] = ret['user_id'];
          req.session.userInfo = templete;
          req.session.save();
        } else {
          //user is not available
          throw new Error("user currently not available.")
        }

      } else throw new Error("register an new third party user failed.");
    } else throw new Error("user info invalid");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

uc.get('/logout', async (req, res) => {
  try {
    req.session.userInfo = {};
    req.session.save();
    res.json({ data: req.trans("Successed logout.") });
  } catch (error) {
    console.error(error);
    res.status(500).json({ "error": "error" });
  }
});
///////////////////////////////////////////////////////
function verifyUserLogin(req, res, next) {
  try {
    // console.log("in verify user", req.session.userInfo)
    if (req.session.userInfo === undefined) {
      //new session, no login also
      throw new Error(req.trans("You need to login first."));
    } else if (req.session.userInfo.userId === undefined) {
      //was login, but logout already
      throw new Error(req.trans("You need to login first."));
    } else if (req.session.userInfo.userId) {
      //login user
      //if success
      next();
    }
  } catch (error) {
    res.json({ "error": error.message });
  }
}
function login_returning_template() {
  return { "username": "text", "last_seen": "text", "credit": "text", "profile_setting": "json" };
}
function generateUsername() {
  var adjectives = ['happy', 'sad', 'funny', 'serious', 'clever', 'smart', 'kind', 'brave', 'shiny', 'silly', 'energetic', 'graceful', 'playful', 'witty', 'gentle', 'curious', 'charming', 'vibrant', 'daring', 'fantastic'];
  var nouns = ['penguin', 'elephant', 'tiger', 'koala', 'dolphin', 'lion', 'monkey', 'giraffe', 'unicorn', 'octopus', 'kangaroo', 'panda', 'zebra', 'parrot', 'dinosaur', 'jaguar', 'butterfly', 'peacock', 'otter', 'hedgehog'];
  var adjectiveIndex = Math.floor(Math.random() * adjectives.length);
  var nounIndex = Math.floor(Math.random() * nouns.length);
  var username = adjectives[adjectiveIndex] + ' ' + nouns[nounIndex];
  return username;
}
const user_password_hash = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
}
///////////////////////////////////////////////////////

module.exports = uc;