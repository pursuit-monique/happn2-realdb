var debug_mode = true;
function log_error() {
  console.error(...arguments);
}

function log() {
  console.log(...arguments);
}

class performance_timer {
  constructor() {
    if (!debug_mode) return;
    this.start_time = process.uptime();
    this.checkpoint = [];
  }
  add_tick(tick_name) {
    if (!debug_mode) return;
    this.checkpoint.push({
      name: tick_name,
      time: (process.uptime() - this.start_time + " - seconds")
    })
  }
  done() {
    if (!debug_mode) return;
    this.add_tick("ending");
    console.log(this.checkpoint);
  }
}
function set_debug_mode(bool) {
  debug_mode = bool;
}
module.exports = { log_error, log, performance_timer, set_debug_mode };