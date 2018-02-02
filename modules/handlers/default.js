'use strict'

const CFG = require('../../config')()

module.exports = { init, matchSlug }



// Pre-configured redirects
let links

// Initialize handler
function init() {
  links = loadLinks()
}

// Check against loaded predefined shortlinks
function matchSlug(req, res, next, slug) {
  if (links.has(slug)) {
    // Redirect to predefined shortlink target
    return res.redirect(links.get(slug))
  }
}


function loadLinks() {
  const fs = require('fs'),
        path = require('path')

  let links = new Map()

  try {
    let inifile = fs.readFileSync(path.join(CFG.rootdir, '/data/links.ini')).toString()

    // Break up to lines
    inifile.split('\n')
      // Skip empty & comment lines
      .filter(l => l.trim() !== '' && l.trim()[0] !== '#')
      // Set up slug => URL mappings and store them as "links"
      .map(l => {
        let [,label, url] = l.match(/^([\w\-]+)\:?\s+(.+)$/, 2)

        // Path substitutions
        if (CFG.default_handler && CFG.default_handler.replacements) {
          CFG.default_handler.replacements.forEach(repl => url = url.replace(repl[0], repl[1]))
        }

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
