const _ = require('lodash');
const User = require('../models/user');
const Session = require('../models/session');
const sessionFields = ['email', 'password']

module.exports = {

  /** Log In **/
  // POST /login
  async sessions_post(req, res, next) {
    try {
      let body = _.pick(req.body, ...sessionFields);
      let user = await User.authenticate(body);
      let userId = user.getAttribute('id');
      let token = Session.generateSessionToken(userId);
      let sessionData = { token };
      let session = new Session(sessionData);
      await session.save();
      res.set('Auth', session.getToken()).json(user.toPublicJSON());
    } catch (err) {
      console.error(err);
      res.send(400, err);
    }
  }

  /** Log Out **/
  // DELETE /logout
  // TODO: add logout route

}
