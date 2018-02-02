'use strict'

// Dependencies
const express = require('express')
const CFG = require('./config')()

// Init returns an Express server module
module.exports = init


// Init server
const server = init()


// Serve on :3010
server.listen(CFG.server_port||3000)
console.log("Serving on :" + (CFG.server_port||3000))


// Create a virtual host that will redirect incoming requests to the editor
function init() {
  const slh = express()

  // Static content
  slh.use(express.static(CFG.rootdir+'/www'))

  // Session managemement
  require('./modules/sessions').handle(slh)

  // Authentication
  const auth = require('./modules/auth')
  auth.init()
  auth.handle(slh)

  // Administration
  require('./modules/admin').handle(slh)


  // Load & initialize request handlers
  const handlers = (CFG.handlers || ["default"]).map(h => require('./modules/handlers/'+h))
  handlers.forEach(h => h.init(slh))


  // Find session id if supplied
  slh.param('slug', function(req, res, next, slug) {
    // Run all handlers that handle slugs
    let h = 0
    while(h < handlers.length) {
      // If handlers is equpped to handle slugs, try it
      if (handlers[h].matchSlug) handlers[h].matchSlug(req, res, next, slug)

      // Successful match, end processing
      if (res.headersSent) return;

      ++h
    }

    // Unknown slug (not handled by any of the handlers)
    console.log('Unknown request target: ', slug)
    next()
  })


  // Redirect session id-requests to the editor (handled by param)
  slh.get('/:slug', () => {})

  // All other requests redirect to main page
  if (CFG.home_url) {
    slh.get('*', (req, res) => {
      res.redirect(CFG.home_url)
    })
  }


  // Create vhost
  return slh
}
