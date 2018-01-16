const level = require('level');
let db;

let dbConnect = function() {
  if (!db) {
    db = level('./data', { valueEncoding: 'json'});
  }
  return db;
}

module.exports = dbConnect();
