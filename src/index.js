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
function loginUserRequest(request) {
  return new Promise((resolve, reject) => {

    const done = function(error) {
      if (error) {
        reject(error);
        return;
      }

      let email = request.body.email;
      let passwd = request.body.password;

      loginUser(email, passwd).then(token => {
        resolve(token);
      }).catch(async userException => {
        let policyResult = await LockoutPolicy.addInvalidRequest(request);
        if (policyResult) {
          reject(policyResult);
        } else {
          reject(userException);
        }
      });
    };

    // Policy call with callback, for middleware style
    LockoutPolicy.validateRequest(request, done);

  });

};

// Public functions:
module.exports = {
  loginUserRequest,
  deleteUser,
  registerUser
}
// EOF