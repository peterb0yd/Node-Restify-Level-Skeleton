var cryptojs = require('crypto-js');
var db = require('../models');

module.exports = {
  requireAuthentication(req, res, next) {
    try {
      let authToken = req.get('Auth') || '';
      let sessionId = cryptojs.MD5(authToken).toString();
      let session = Session.find(sessionId);
      if (!sessionToken) {
        throw new Error();
      }
      req.sessionToken = session.getAttribute('token');

      let userId = session.getUserId();
      let user = User.find(userId);

      req.user = user;
      next();
    } catch(e) {
      res.status(401).send();
    }
  }
};
