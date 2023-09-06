require("dotenv").config();
const session = require("express-session");
const genFunc = require("connect-pg-simple");
const PostgresqlStore = genFunc(session);
const sessionStore = new PostgresqlStore({
  conString : `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DB}`
});

function applySession (app){
  //init session
  app.use(session({
    secret: 'sessiohappn-#02343059',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 86400000 * 1, // 86400000 = 1 day
      secure: true,
      sameSite: "none" ,
    }, 
    store: sessionStore
  }));

  // app.use(function (req, res, next) {
  //   //session middleware adding language
  //   if (!req.session.language) {
  //     req.session.language = "english.json"
  //   }
  //   //adding ip address
  //   if (!req.session.ipAddress) {
  //     req.session.ipAddress = req.socket.remoteAddress;
  //   }
  //   next();
  // })
}

module.exports = applySession;

/* sql seeding
  CREATE TABLE session (sid varchar NOT NULL COLLATE "default", sess json NOT NULL, expire timestamp(6) NOT NULL  ) WITH (OIDS=FALSE);
  ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
  CREATE INDEX idx_session_expire ON session (expire);  
*/