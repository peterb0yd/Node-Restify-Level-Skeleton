const _ = require('lodash');
const User = require('../models/user.js');

module.exports = {

  /** Activate account from email **/
  // POST /account_activations
  async account_activations_post(req, res,next) {
    let { email, token } = _.pick(req.body, 'email', 'token');

    try {
      let user = await User.findByEmail(email);
      console.log(user);
      if (user.getAttribute('activated')) {
        // already activated
      } else if (user.authenticated('activation', token)) {
        user.setActivated();
      } else {
        throw new Error();
      }
      res.send();
    } catch (e) {
      console.log(e);
      res.send(401);
    }
  }

}
