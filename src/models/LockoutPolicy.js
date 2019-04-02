'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const LockoutPolicySchema = new Schema({

  // time in minutes
  lockoutTime: {
    type: Number,
    default: 20
  },

  // max attempts for the same username
  maxUserAttempts: {
    type: Number,
    default: 3
  },

  // Max Attempts regardless of the username, only for the same Request Signature
  maxRequestAttempts: {
    type: Number,
    default: 13
  },

  instance: {
     type: String,
     required: true
  }
});


module.exports = mongoose.model('LockoutPolicy', LockoutPolicySchema );
