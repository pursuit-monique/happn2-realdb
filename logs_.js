var debug_mode = true;
function log_error() {
  if (debug_mode) console.error(new Date().toLocaleString(), ...arguments);
}

function log() {
  if (debug_mode) console.log(new Date().toLocaleString(), ...arguments);
}

class performance_timer {
  constructor(init_str) {
    if (!debug_mode) return;
    this.start_time = process.uptime();
    this.checkpoint = [init_str];
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