
const LockoutPolicy = require('../models/LockoutPolicy');
const instanceName = process.env.COUNTRY_INSTANCE || 'USA';

// in-memory/no-scalable cache storage for lockouts...
// it should be replaed with redis, or db, or something similar for production.
const requestAttemptsLocks = {};
const requestLocked = {};

let lockoutPolicyOptions = null;

async function getPolicyOptions() {
  if(lockoutPolicyOptions===null) {
    // load deault policy for the current Application Instance:
    lockoutPolicyOptions = await LockoutPolicy.findOne({instance: instanceName}).exec();
  }

  return lockoutPolicyOptions;
}



async function lockRequest(requestSignature) {
  requestLocked[requestSignature] = true;
  await getPolicyOptions();

  // lockout minutes to milliseconds
  const millisecondsTime = lockoutPolicyOptions.lockoutTime * 60000;

  // once a lock is generated, add a timeout to remove the lockout after a period time.
  setTimeout(function(){
    delete requestLocked[requestSignature];
  }, millisecondsTime);
}


function isRequestLocked(requestSignature) {
  return requestLocked[requestSignature] !== undefined;
}


// private function to get encoded request signature.
function getRequestSignature(request) {
  const userAgent = request.headers['user-agent'] || request.headers['User-Agent'];

  // User address will be detected depending on the source:
  const userIP = request.headers['x-forwarded-for'] || 
     request.connection.remoteAddress || 
     request.socket.remoteAddress ||
     request.connection.socket.remoteAddress;

  // since this library doesn't know the source of the cookies I hope to detect it on some way:
  const cookies = request.cookies || request.headers.cookies;

  const requestSignature = userAgent + ':' + userIP + ':' + JSON.stringify(cookies);

  // returned as encoded string to get a standard format
  return Buffer.from(requestSignature).toString('base64');
}


function validateRequest(request, next) {
  const requestSignature = getRequestSignature(request);

  if (isRequestLocked(requestSignature)) {
    next(new Error('Your request is Locked!'));
  } else {
    next();
  }
}


async function addInvalidRequest(request) {
  const requestSignature = getRequestSignature(request);

  if (!requestAttemptsLocks[requestSignature]) {
    requestAttemptsLocks[requestSignature] = [{
      attempt: 1,
      time: new Date()
    }];
  } else {
    let requestAttempts = requestAttemptsLocks[requestSignature];
    await getPolicyOptions();
    requestAttempts.push({
      attempt: requestAttempts.length+1,
      time: new Date()
    });

    // when we have more than maxRequestAttempts (13 by default...)
    if (requestAttempts.length >= lockoutPolicyOptions.maxRequestAttempts) {
      // get times to check the latest 13 attempts:
      const firstAttempt = requestAttempts[ lockoutPolicyOptions.maxRequestAttempts-1 ].time.getTime();
      const lastAttempt = requestAttempts[requestAttempts.length-1].time.getTime();
      
      const minutesDifference = (lastAttempt - firstAttempt) / 60000;
      if (minutesDifference < lockoutPolicyOptions.lockoutTime) {
        // Locked!
        lockRequest(requestSignature);
        return new Error('Your Request has been Locked! Please try again in '+lockoutPolicyOptions.lockoutTime+' minutes');
      }
    }    
    // requestAttemptsLocks[requestSignature] = requestAttempts;
  }

  return false;
}

// Public Functions
module.exports = {
  validateRequest,
  addInvalidRequest
};
