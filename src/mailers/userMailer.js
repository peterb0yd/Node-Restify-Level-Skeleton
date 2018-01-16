var config = require('../../config');
var mailer = require('./index');

// Account verification
exports.sendAccountActivationEmail = function(user) {
  var params = {
    Source: "EmailName <noreply@youremail.com>",
    Destination: {
     ToAddresses: [ user.email ]
    },
    Message: {
     Body: {
      Html: {
       Charset: "UTF-8",
       Data: `Welcome. Please click the link below to verify your email. <br><br> <a href=\"${config.CLIENT_URL}/account_activations?t=${user.activationToken}&e=${user.email}\">Click Me!</a>`
      }
     },
     Subject: {
      Charset: "UTF-8",
      Data: "Account Activation"
     }
    },
   };

   // Send email to user
   mailer.sendEmail(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else console.log(data);           // successful response
   });
}
