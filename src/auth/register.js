const User = require('../models/User');
const PasswordPolicy = require('../models/PasswordPolicy');
const passwordRules = require('password-rules');
const instanceName = process.env.COUNTRY_INSTANCE || 'USA';

let passwordPolicyOptions = null;

(async () => {
  passwordPolicyOptions = await PasswordPolicy.findOne({instance: instanceName}).exec();
  if (passwordPolicyOptions===null) {
    const newPolicy = {
      instance: instanceName,
      minimumLength: 6,
      requireCapital: true,
      requireNumber: true
    };
    passwordPolicyOptions = await PasswordPolicy.create(newPolicy);
    // console.log('Created new default policy!', passwordPolicy);
  }
})();

module.exports = function(email, password) {
  return new Promise((resolve, reject) => {

    if (!email) {
      return resolve(new Error('Invalid email'));
    }

    if (!password) {
      return resolve(new Error('Invalid password'));
    }

    // console.log('Using policy:', defaultPolicy);
    const passwordIssues = passwordRules(password, passwordPolicyOptions);

    if (!passwordIssues) {
      let newUser = {
        email,
        password
      };
      User.create(newUser, (error, createdUser) => {
        if (error) {
          return reject(error);
        }

        resolve(createdUser);
      });
    } else {
      reject( passwordIssues.sentence );
    }

  });
};