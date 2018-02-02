'use strict'

const CFG = require('../config')()

const passport = require('passport')
const TwitterStrategy = require('passport-twitter')



module.exports = { init, handle }



function init() {
  passport.use(new TwitterStrategy({
      consumerKey: CFG.auth.twitter.consumer_key,
      consumerSecret: CFG.auth.twitter.consumer_secret,
      callbackURL: CFG.auth.twitter.callback_url
    },
    function(token, tokenSecret, profile, cb) {
      return cb(null, findUserInConfig(profile.username+'@twitter'))
    }
  ))

  // Serialize and deserialize based on user name and profile source
  passport.serializeUser(function(user, done) {
    done(null, `${user.id}@${user.type}`)
  })
  passport.deserializeUser(function(id, done) {
    done(null, findUserInConfig(id))
  })
}

function handle(app) {
  // Initialize passport auth and session handling
  app.use(passport.initialize())
  app.use(passport.session())

  // Authentication endpoint
  app.get('/auth', (req, res) => {
    res.send(`<html><body><form action="/auth/twitter"><button>Log in with Twitter</button></form></body></html>`)
  })

  // Start authentication with Twitter
  app.get('/auth/twitter',
    passport.authenticate('twitter'))

  // Handle oauth callback
  app.get('/auth/callback',
    passport.authenticate('twitter', { failureRedirect: '/auth' }),
    function(req, res) {
      res.redirect('/+admin')
    })

  // Require authentication for admin pages
  app.use('/\\+admin', (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth')
    }

    next()
  })

}

function findUserInConfig(user) {
  return CFG.admins.filter(r => `${r.id}@${r.type}` === user).pop() || false
}
