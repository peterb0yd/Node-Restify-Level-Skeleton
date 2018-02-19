const _ = require('lodash')
const uuid = require('uuid/v4')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cryptojs = require('crypto-js')
const schemas = require('./schemas')
const config = require('../../config')
const db = require('../../db')
const keys = config.keys


const Session = class {

  constructor(data) {
    this.data = data;
  }

  // Get attribute from Session
  // @returns {string} session attribute
  getToken() {
    return this.data.token
  }

  // Get User ID from Session
  // @returns {string} user id
  getUserId() {
    let decodedJWT = jwt.verify(this.getToken(), keys.jwt)
    let bytes = cryptojs.AES.decrypt(decodedJWT.token, keys.crypt)
    let sessionData = JSON.parse(bytes.toString(cryptojs.enc.Utf8))
    return sessionData.userId
  }

  // Save Session to DB
  async save() {
    let id = this.data.id
    return await db.put(`session:${id}`, this.data)
  }

  // Find Session by ID
  // @return Session
  static async find(id) {
    let sessionData = await db.get(`session:${id}`)
    return new Session(sessionData);
  }

  // Remove a Session from DB
  static async destroy(id) {
    db.del(`session:${id}`)
  }

  // Create session for User
  // @returns {object} Session
  static async create(user) {
    let userId = user.getAttribute('id')
    let token = Session.generateSessionToken(userId)
    let id = cryptojs.MD5(token).toString();
    let sessionData = { id, token }
    let session = new Session(sessionData)
    let lastSessionId = user.getAttribute('sessionId')
    await session.save()
    Session.destroy(lastSessionId)
    user.setAttribute('sessionId', id)
    return session
  }

  // Generate a new session token
  // @returns {string} session token
  static generateSessionToken(userId) {
    try {
      let stringData = JSON.stringify({ userId })
      let token = cryptojs.AES.encrypt(stringData, keys.crypt).toString()
      let sessionToken = jwt.sign({ token }, keys.jwt)
      return sessionToken
    } catch(e) {
      return undefined
    }
  };

}

module.exports = Session
