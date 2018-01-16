var config = require('../../config');
var awsConfig = config.aws;

var ses = require('aws-sdk/clients/ses');

module.exports = new ses({
  apiVersion: '2017-03-09',
  accessKeyId: awsConfig.ses.accessKeyId,
  secretAccessKey: awsConfig.ses.secretAccessKey,
  region: awsConfig.ses.region
})
