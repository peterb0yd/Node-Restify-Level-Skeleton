const _ = require('lodash');
const User = require('../models/user');
const Session = require('../models/session');
const sessionFields = ['email', 'password']

module.exports = {

  /** Log In **/
  // POST /login
  sessions_post: async function (req, res, next) {
    try {
      let body = _.pick(req.body, ...sessionFields)
      let user = await User.authenticate(body)
      let session = await Session.create(user)
      res.set('Auth', session.getToken()).json(user.toPublicJSON())
    } catch (err) {
      console.error(err)
      res.send(400, err)
    }
  },

  /** Check Auth **/
  // GET /auth
  sessions_get: async function (req, res, next) {
    res.send()
  }

}
