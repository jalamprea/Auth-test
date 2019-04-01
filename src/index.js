const User = require('./models/User');
const LockoutPolicy = require('./policies/lockout');
const MongoDB = require('./db-connect');
const crypto = require('crypto');


(async () => {
  await MongoDB.connect();
})();

const loginUser = require('./auth/login');
const registerUser = require('./auth/register');

// Remove users from DB (useful to let continuos tests)
function deleteUser(email) {
  User.findOne({email}).exec(async(err, data) => {
    if (data) {
      await data.remove();
    }
  });
};

//
function loginFromRequest(request) {
  return new Promise((resolve, reject) => {

    const done = function(error) {
      if (error) {
        reject(error);
        return;
      }

      let email = request.body.email;
      let passwd = request.body.password;

      loginUser(email, passwd).then(user => {
        resolve(user);
      }).catch(async exception => {
        let policyResult = await LockoutPolicy.addInvalidRequest(request);
        if (policyResult) {
          reject(policyResult);
        } else {
          reject(exception);
        }
      });
    };

    // function call with callback, for middleware style
    LockoutPolicy.validateRequest(request, done);

  });

};

// Public functions:
module.exports = {
  loginFromRequest,
  deleteUser,
  registerUser
}
// EOF