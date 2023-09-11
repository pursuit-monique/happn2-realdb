const express = require("express");
const uc = express.Router();
const str_filter = require('../str_filter');

/////////////////////////////////////////////////////////////////
uc.get("/available", async (req, res) => {
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
    idToken = str_filter.user_input_letter_and_numbers_only(idToken);
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
          log_user_action(ret.user_id, "third party user login", JSON.stringify(ret));
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


module.exports = uc;