'use strict';
const crypto = require('crypto');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const UserSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    },

    // MD5 password automatically generated on account creation and used to show in the dashboard on the first access
    password: String,

    locked: {
        type: Boolean,
        default: false
    },

    createdAt: Date,
    lastLogin: Date,
    lastLock: Date,
    lastAttempt: Date,

    // Login Attempts counter, reseted after a valid login
    attempts: {
        type: Number,
        default: 0
    }
});

UserSchema.plugin(uniqueValidator, {message: 'User is already registered.'});

UserSchema.pre('save', function(next) {
    if(!this.createdAt) {
        this.createdAt = new Date();

        // Hashed password in DB
        this.password = crypto.createHash('md5').update(this.password).digest("hex")
    }

    next();
});

module.exports = mongoose.model('User', UserSchema );
