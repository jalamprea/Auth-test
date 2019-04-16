'use strict';
const fs = require('fs');
const expect  = require('chai').expect;
const app = require('../src/index');



// Sucessfull Register User
describe('app.registerUser(email, password)', function() {

  it('Register user with email and password', async function() {

    const userEmail = 'hello@world.com';
    const userPass = 'HelloWorld123';

    const newUser = await app.registerUser(userEmail, userPass);

    expect(newUser).to.have.property('_id');

    await app.deleteUser(userEmail);
  });
});


// Bad registration
describe('app.registerUser(email, password)', function() {

  it('Try to register user with password without capital letters', async function() {

    const userEmail = 'hello@world.com';
    const userPass = 'helloworld123';

    try {
      const newUser = await app.registerUser(userEmail, userPass);
      return newUser;
    } catch(err) {
      expect(err).contains('Password must contain a capital letter');
    }

  });
});


// Password without numbers
describe('app.registerUser(email, password)', function() {

  it('Try to register user with password without Numbers', async function() {

    const userEmail = 'hello@world.com';
    const userPass = 'HelloWorld';

    try {
      const newUser = await app.registerUser(userEmail, userPass);
      return newUser;
    } catch(err) {
      expect(err).contains('Password must contain a number');
    }

  });
});




// Invalid Password length
describe('app.registerUser(email, password)', function() {

  it('Try to register user with invalid password length', async function() {

    const userEmail = 'hello@world.com';
    const userPass = 'Hi5';

    try {
      const newUser = await app.registerUser(userEmail, userPass);
      return newUser;
    } catch(err) {
      expect(err).contains('Password must be at least 6 letters long');
    }

  });
});