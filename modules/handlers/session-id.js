'use strict'

const CFG = require('../../config')()

module.exports = { init, matchSlug }



// Initialize handler
function init() {}

// Check if provided slug is a valid session id
function matchSlug(req, res, next, slug) {
  if (slug.match(/^\w+\-\w+\-\w+$/)) {
    // Redirect to editor
    return res.redirect(`https://editor.clouduboy.org/${slug}`)
  }
}
