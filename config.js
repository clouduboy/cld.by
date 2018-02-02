'use strict'

module.exports = function() {
  try {
    const cfg = require('fs').readFileSync('./data/config.json').toString()
    const config = JSON.parse(cfg)

    return config
  }
  catch(e) {
    return {}
  }
}
