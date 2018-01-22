const cryptojs = require('crypto-js');
const User = require('../models/user.js');
const Session = require('../models/session');

module.exports = {
  async requireAuth(req, res, next) {
    try {
      let authToken = req.header('Auth') || '';
      let sessionId = cryptojs.MD5(authToken).toString();
      let session = await Session.find(sessionId)
      if (!session) {
        throw new Error();
      }
      req.sessionToken = session.getToken();
      let userId = session.getUserId();
      let user = User.find(userId);
      req.user = user;
      next();
    } catch(e) {
      console.log(e)
      res.send(401);
    }
  }
};
