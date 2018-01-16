const _ = require('lodash');
const uuid = require('uuid/v4');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cryptojs = require('crypto-js');
const schemas = require('./schemas');
const config = require('../../config');
const db = require('../../db');
const keys = config.keys;


const Session = class {

  constructor(data) {
    this.data = data;
  }

  // Get attribute from Session
  // @returns {string} session attribute
  getToken() {
    return this.data.token;
  }

  // Get User ID from Session
  // @returns {string} user id
  getUserId() {
    let decodedJWT = jwt.verify(this.getToken(), keys.jwt);
    let bytes = cryptojs.AES.decrypt(decodedJWT.token, keys.crypt);
    let sessionData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
    return sessionData.userId;
  }

  // Save User to DB
  async save(data) {
    var hash = cryptojs.MD5(data).toString();
    return await db.put(`session:${hash}`, this.data);
  }

  // Find Session by ID
  // @return Session
  static async find(id) {
    let sessionData = await db.get(`session:${id}`)
    return new Session(sessionData);
  }

  // Generate a new session token
  // @returns {string} session token
  static generateSessionToken(userId) {
    try {
      let stringData = JSON.stringify({ userId });
      let token = cryptojs.AES.encrypt(stringData, keys.crypt).toString();
      let sessionToken = jwt.sign({ token }, keys.jwt);
      return sessionToken;
    } catch(e) {
      return undefined;
    }
  };

}

module.exports = Session;
