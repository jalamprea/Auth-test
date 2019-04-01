'use strict';
const mongoose = require('mongoose');
let db = null;


// This will connect to medullan-auth-test DB
module.exports.connect = function() {
  return new Promise((resolve, reject) => {
    try {
      const mongoDB = process.env.MONGO_URI || 'mongodb://127.0.0.1/medullan-auth-test';

      db = mongoose.connection;
      db.on('error', function(err) {
        console.error('MongoDB connection error:', err);
        reject(err);
      });
      db.once('open', function() {
        console.log('MongoDB connected sucessfully!');
        resolve(true);
      });
      db.on('disconnected', function () {
        console.log('Mongoose disconnected from ' + mongoDB);
      });

      mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useCreateIndex: true
      });

    } catch(ex) {
      console.error('Mongo Error:', ex);
      reject(ex);
    }
  });
}
