const _ = require('lodash')
const User = require('../models/user.js')
const Session = require('../models/session')
const newUserFields = ['firstName', 'lastName', 'email', 'password', 'passwordConfirmation']


module.exports = {

  /** Sign Up **/
  // POST /users
  async users_post(req, res, next) {
    try {
      let body = _.pick(req.body, ...newUserFields)
      let user = await User.create(body)
      let session = await Session.create(user)
      res.set('Auth', session.getToken()).json(user.toPublicJSON())
      return next()
    } catch (e) {
      console.error(e)
      res.send(500, e)
      return next(false)
    }
  },

  /** List All Users **/
  // GET /users
  async users_index(req, res, next) {
    try {
      let users = await User.findAll()
      res.json(users)
      return next()
    } catch (e) {
      console.error(e)
      res.send(500, e)
      return next(false)
    }
  }
}
