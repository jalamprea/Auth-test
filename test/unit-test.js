'use strict';
const fs = require('fs');
const expect  = require('chai').expect;
const app = require('../src/index');

const userEmail = 'hello@world.com';
const userPass = 'HelloWorld123';
const requestTest = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
        'x-forwarded-for': '127.0.0.1',
        'cookies': 'localTest=1'
      },
      body: {
        email: userEmail,
        password: userPass
      }
    };


// Register User Test
describe('app.registerUser(email, password)', function() {

  it('Register user with email and password', async function() {

    const newUser = await app.registerUser(userEmail, userPass);

    expect(newUser).to.have.property('_id');

    await app.deleteUser(userEmail);
  });
});


// Simple one login test
describe('app.userLogin(email, password)', function(){

  it('Allow user log in with email and password credentials', async function() {

    const newUser = await app.registerUser(userEmail, userPass);
      
    const loggedUser = await app.loginUserRequest(requestTest);

    expect(loggedUser).to.have.property('_id');

    await app.deleteUser(userEmail);
    
  });
});


describe('app.userLogin(email, password)', function(){

  it('Block user because of bad password', async function() {

    const newUser = await app.registerUser(userEmail, userPass);

    // try one
    requestTest.body.password = getRandomPassword();
    console.log('TRY ONE', requestTest.body.password);
    await app.loginUserRequest(requestTest).catch(console.error);

    // try two
    requestTest.body.password = getRandomPassword();
    console.log('TRY TWO', requestTest.body.password);
    await app.loginUserRequest(requestTest).catch(console.error);

    // try three
    requestTest.body.password = getRandomPassword();
    console.log('TRY THREE', requestTest.body.password);
    const loggedUser = await app.loginUserRequest(requestTest).catch(console.error);

    // expect(loggedUser).to.not.have.property('_id');
    expect(loggedUser).to.be.undefined;

    await app.deleteUser(userEmail);
    
  });
});


describe('app.userLogin(email, password)', function(){

  it('Block requests no matter the username', async function() {

    const newUser = await app.registerUser(userEmail, userPass);
      
    let response = '';
    let index = 1;
    do {
      try {
        requestTest.body.email = 'hello' + getRandomPassword() + '@test.com';
        console.log('Try %d', index, requestTest.body.email);
        index++;
        response = await app.loginUserRequest(requestTest);
      } catch(ex) {
        response = ex.message;
      }
      console.log('Response:', response);
      
    } while(response.indexOf('Locked')<0);

    expect(response).to.have.string('Locked');

    await app.deleteUser(userEmail);
    
  });
});


function getRandomPassword() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}