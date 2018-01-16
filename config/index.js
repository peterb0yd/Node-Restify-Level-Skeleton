const ENV = 'local';
var API_URL = null;
var CLIENT_URL = null;

module.exports = {
  ENV,
  API_URL,
  CLIENT_URL,
  keys: {
    jwt: '<insert_random_code_here>',
    crypt: '<insert_random_code_here>'
  },
  aws: {
    ses: {
      accessKeyId: '<insert_access_key_id_here>',
      secretAccessKey: '<insert_secret_access_key_here>',
      region: '<insert_region_here>'
    },
  }
}
