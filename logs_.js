function log_error() {
  console.error(...arguments);
}

function log() {
  console.log(...arguments);
}

class performance_timer {
  constructor() {
    this.start_time = process.uptime();
    this.checkpoint = [];
  }
  add_tick(tick_name) {
    this.checkpoint.push({
      name: tick_name,
      time: (process.uptime() - this.start_time + " - seconds")
    })
  }
  result() {
    this.add_tick("ending");
    return this.checkpoint;
  }
}

module.exports = { log_error, log, performance_timer };