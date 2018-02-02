'use strict'

const fs = require('fs')
const CFG = require('../config')()
const LINKS_FILE = CFG.rootdir+'/data/links.ini'


module.exports = (req, res) => {
  // Save configuration
  if (req.body && req.body.action === 'SaveConfig') {
    // Create backup before overwriting config
    // (only one backup per day is retained)
    fs.copyFileSync(LINKS_FILE, `${LINKS_FILE}.${(new Date).toISOString().substr(0,10)}`)

    // Overwrite config file
    fs.writeFileSync(LINKS_FILE, req.body.contents)

    // Reinitialize link mappings
    require('./handlers/default').init()

    return res.sendStatus(200)
  }

  // Serve the editor for the current configuration
  let config = fs.readFileSync(LINKS_FILE).toString()

  res.send(`
  <!doctype html>
  <html>
  <head><meta charset="utf-8">
  <title>Edit links...</title>
  <link rel="stylesheet" href="/_assets/style.css">
  </head>
  <body>
  <textarea>${config}</textarea>
  <button title="Save config..."><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Save config"><title>Save</title><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg></button>
  <script src="/_assets/main.js"></script>
  </body>
  `)
}
