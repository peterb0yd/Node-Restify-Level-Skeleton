const _ = require('lodash')
const uuid = require('uuid/v4')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const cryptojs = require('crypto-js')
const schemas = require('./schemas')
const userMailer = require('../mailers/userMailer')
const Session = require('./session')
const activationFields = ['email', 'activationToken']
const publicFields = ['firstName', 'lastName', 'email', 'activated', 'activatedAt']

const db = require('../../db')

const User = class {

    constructor(data) {
      this.data = this.sanitize(data)
    }

    // Remove disallowed fields from User data
    sanitize(data) {
      data = data || {}
      let schema = schemas.user
      return _.pick(_.defaults(data, schema), _.keys(schema))
    }

    // Get attribute from User
    // @returns {string} user attribute
    getAttribute(key) {
      return this.data[key]
    }

    // Get Publicly Safe User Attributes
    // @returns {object} user attributes
    toPublicJSON() {
      return _.pick(this.data, ...publicFields)
    }

    // Get Account Activation email data
    // @returns {object} activation data for user
    getActivationData() {
      return _.pick(this.data, ...activationFields)
    }

    // Create an Activation Digest for User
    createActivationDigest() {
      this.data.activationToken = newToken()
      this.data.activationDigest = getDigest(this.getAttribute('activationToken'), this.salt)
    }

    // Authenticate User
    // @returns {boolean} matching key?
    authenticated(attribute, token) {
      return bcrypt.compareSync(token, this.getAttribute(`${attribute}Digest`))
    }

    // Set User as Activated
    async setActivated() {
      this.data.activated = true
      this.data.activatedAt = new Date()
      await this.save()
    }

    // Set User Attribute
    async setAttribute(key, value) {
      let userId = this.getAttribute('id')
      this.data[key] = value
      await db.put(`user:${userId}`, this.data)
    }

    // Save User to DB
    async save() {
      let userId = this.data.id || uuid()
      this.data.id = userId
      await db.put(`email:${this.data.email}`, userId)
      await db.put(`user:${userId}`, this.data)
    }

    // Create a User
    // @return User
    static async create(data) {
      await assertUnique(data)
      validatePassword(data)
      setPassword(data)
      setEmail(data)
      let user = new User(data, db)
      user.createActivationDigest()
      let userData = user.getActivationData()
      userMailer.sendAccountActivationEmail(userData)
      await user.save()
      return user
    }

    // Find User by ID
    // @return User
    static async find(id) {
      let userData = await db.get(`user:${id}`)
      return new User(userData)
    }

    // Find User by Email
    // @return User
    static async findByEmail(email) {
      let userId = await db.get(`email:${email}`)
      return await this.find(userId)
    }

    // Find All Users
    // @return Users as JSON
    static findAll() {
      return new Promise((resolve, reject) => {
        let users = []
        let readStream = db.createReadStream()
        readStream.on('data', data => {
          if (_.includes(data.key, 'user'))
            users.push(_.pick(data.value, ...publicFields))
          // users.push({ key: data.key, value: data.value }) /* Temp code for seeing everything in DB */
        })
        readStream.on('error', err => {
          reject()
        })
        readStream.on('end', () => {
          resolve(users)
        })
      })
    }

    // Authenticate user
    static async authenticate(body) {
      if (!_.isString(body.email) || !_.isString(body.password)) {
        return false
      }
      let user
      try {
        user = await User.findByEmail(body.email)
      } catch (e) {
        throw {
          field: 'email',
          message: 'This email could not be found.'
        }
      }
      if (!user.authenticated('password', body.password)) {
        throw {
          field: 'password',
          message: 'This password doesn\'t match the one we have on file'
        }
      }

      return user
    }

}

module.exports = User

// ---------------------------
// ---- Private Functions ----
// ---------------------------

let assertUnique = async function(data) {
  // Try to find User by email
  let foundUser
  try {
    foundUser = await User.findByEmail(data.email)
  } catch (e) {
    return true
  }
  // User exists in DB
  if (foundUser) {
    throw {
      path: 'userAlreadyFound',
      message: 'This email is already in use.'
    }
  }
}

let validatePassword = function(data) {
  // Make sure password matches the confirmation
  if (data.password !== data.passwordConfirmation) {
    throw {
      path: 'passwordConfirmation',
      message: 'Password confirmation does not match password.'
    }
  }
}

let setEmail = function(data) {
  data.email = data.email.toLowerCase()
}

let setPassword = function(data) {
  let salt = bcrypt.genSaltSync(10)
  let hashedPassword = bcrypt.hashSync(data.password, salt)
  data.salt = salt
  data.passwordDigest = hashedPassword
}

let newToken = function() {
  return crypto.randomBytes(16).toString('hex')
}

let getDigest = function(string, salt) {
  return bcrypt.hashSync(string, salt)
}


let errorHandler = function(err) {
  console.error(err)
}
