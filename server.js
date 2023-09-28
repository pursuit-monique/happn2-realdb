const app = require("./app.js");
const { log_error, log } = require("./logs_.js");
const http = require('http');
const https = require('https');
const fs = require('fs');
require("dotenv").config();
const { HTTPS_PORT, HTTP_PORT } = process.env;
const options = {
  key: fs.readFileSync('./ssl/localhost-key.pem'),
  cert: fs.readFileSync('./ssl/localhost-cert.pem')
};

// LISTEN
try {
  const https_server = https.createServer(options, app).listen(HTTPS_PORT || 8000, () => {
    log(`Https Listening on port ${HTTPS_PORT}`);
  });
  const http_server = http.createServer(app).listen(HTTP_PORT || 8001, () => {
    log(`Http Listening on port ${HTTP_PORT}`);
  });

  https_server.on('clientError', handle_client_error);
  http_server.on('clientError', handle_client_error);
} catch (error) {
  log_error(error);
}

function handle_client_error(error, socket) {
  // log_error('clientError:', error);
  socket.destroy();  // This will destroy the socket
}