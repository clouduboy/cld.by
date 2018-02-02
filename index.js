'use strict'

// Dependencies
const express = require('express')
const CFG = require('./config')()

// Init returns an Express server module
module.exports = init


// Load configuratopn
const links = setup()

// Init server
const server = init()


// Serve on :3010
server.listen(CFG.server_port||3000)



function setup() {
  const fs = require('fs'),
        path = require('path')

  let links = new Map()

  try {
    let inifile = fs.readFileSync(path.join(__dirname, '/data/links.ini')).toString()

    // Break up to lines
    inifile.split('\n')
      // Skip empty & comment lines
      .filter(l => l.trim() !== '' && l.trim()[0] !== '#')
      // Set up slug => URL mappings and store them as "links"
      .map(l => {
        let [,label, url] = l.match(/^([\w\-]+)\:?\s+(.+)$/, 2)

        // MicroCanvas examples root path
        // TODO: move to config file
        url = url.replace('<microcanvas-examples>', 'https://clouduboy.github.io/microcanvas/examples')
        links.set(label, url)
      })

      console.log(`Loaded ${links.size} link mappings`)
  }
  catch (e) {
    console.error(`No links.ini found. (${e.toString()})`)
    // No links.ini
  }

  // Make sure we generate a new Map (even if it's empty)
  return links
}

// Create a virtual host that will redirect incoming requests to the editor
function init() {
  const slh = express()

  // Find session id if supplied
  slh.param('slug', function(req, res, next, slug) {
    // Check against loaded predefined shortlinks
    if (links.has(slug)) {
      // Redirect to predefined shortlink target
      // console.log('redirecting to ', links.get(slug))
      return res.redirect(links.get(slug))
    }

    // Check if provided slug is a valid session id
    if (!slug.match(/^\w+\-\w+\-\w+$/)) {
      // Unknown slug (not pre-defined and not a session id)
      // We don't handle the request
      return next()
    }

    // Redirect to editor
    res.redirect(`https://editor.clouduboy.org/${slug}`)
    // console.log("Shortlink: ", slug)
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
