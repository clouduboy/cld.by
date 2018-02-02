'use strict'

const CFG = require('../config')()
const SESSIONS_DIR = CFG.rootdir+'/data/sessions'

const expressSession = require('express-session')

const session = require('express-session')
const FileStore = require('session-file-store')(session)



module.exports = { init, handle }



function init() {}

function handle(app) {  
  app.use(expressSession({
    store: new FileStore({
      path: SESSIONS_DIR,
      // 1 wk validity (if unused)
      ttl: 7 * 24 * 3600,

    }),
    secret: CFG.auth.twitter.consumer_key,
    saveUninitialized: true,
    resave: true
  }))

}
