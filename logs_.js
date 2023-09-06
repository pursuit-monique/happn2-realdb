function log_error(){
  console.error(...arguments);
}

function log(){
  console.log(...arguments);
}

module.exports = { log_error, log };