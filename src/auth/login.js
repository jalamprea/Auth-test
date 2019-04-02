'use strict';
const fs     = require('fs');
const User   = require('../models/User');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const LockoutPolicy = require('../models/LockoutPolicy');
const instanceName  = process.env.COUNTRY_INSTANCE || 'USA';
const ISSUER = 'MyHealthPass';

// Private key for JWT
const JWTSecretKey = fs.readFileSync('./keys/private.key', 'utf8');

let lockoutPolicyOptions = null;

(async () => {

  lockoutPolicyOptions = await LockoutPolicy.findOne({instance: instanceName}).exec();
  if (lockoutPolicyOptions===null) {
    const newLockout = {
      instance: instanceName,
      lockoutTime: 20,
      maxUserAttempts: 3,
      maxRequestAttempts: 13,
      expireTimeMinutes: 15
    };
    lockoutPolicyOptions = await LockoutPolicy.create(newLockout);
  }

})();


module.exports = function(email, password) {
  return new Promise((resolve, reject) => {

    if (!email) {
      return reject(new Error('Invalid email'));
    }

    if (!password) {
      return reject(new Error('Invalid password'));
    }

    User.findOne({email}).exec(async(err, user) => {
      if (user) {
        const pwd = crypto.createHash('md5').update(password).digest("hex");
        if (user.password === pwd) {
          user.lastLogin = new Date();
          user.lastAttempt = null;
          user.lastLock = null;
          user.attempts = 0;
          await user.save();

          // Generate a JWT with expire session time
          const payload = {
            user: user.email
          };
          const signOptions = {
            issuer: ISSUER,
            subject: user.email,
            expiresIn: lockoutPolicyOptions.expireTimeMinutes * 60, // expire time defined in the lockout policies
            algorithm: "RS256"
          };
          const userToken = jwt.sign(payload, JWTSecretKey, signOptions);
          resolve(userToken);
        } else {
          
          user.lastAttempt = new Date();
          user.attempts++;

          if (user.attempts >= lockoutPolicyOptions.maxUserAttempts) {
            user.lastLock = new Date();
            await user.save();
            reject( new Error('Account Locked!') );
          } else {
            await user.save();
            reject( new Error('Invalid Password') );
          }
        }
      } else {
        reject(new Error('User not found!'));
      }
    });
    
  });
};
