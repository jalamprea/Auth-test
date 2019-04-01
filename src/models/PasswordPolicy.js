'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PasswordPolicySchema = new Schema({

   minimumLength: Number,

   maximumLength: Number,

   requireCapital: {
       type: Boolean,
       required: false,
       default: false
   },

   requireLower: {
       type: Boolean,
       required: false,
       default: false
   },

   requireNumber: {
       type: Boolean,
       required: false,
       default: false
   },

   requireSpecial: {
       type: Boolean,
       required: false,
       default: false
   },

   instance: {
       type: String,
       required: true
   }
});


module.exports = mongoose.model('PasswordPolicy', PasswordPolicySchema );
