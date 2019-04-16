# Auth-test

NodeJS library to complete requirements for the Medullan Code Test.

**Assumptions:**
- This library will work as a Node Dependency of another project.
- The separation of jurisdictions and countries per each application instance means that each Instance run as a separated process with the respective environment vars, so, the variable COUNTRY_INSTANCE should always defined por each country. by default it is "USA".
- This library doesn't handle any Graphic User Interface, so it receive everything as parameters and return messages or conditions, nothing implemented in UI.
- The request object used on the login function is a standard HTTP Request Object, with the headers and body attributes accesible, so all functions will use that attributes from the request.
- The login function returns a JWT with a Session Expiration time, but this library doesn't include functions to check that JWT expiration time since the Test Code doesn't especificate it


## Installation

Node JS 10.0.0+ is required.
To install and test this library, clone it from repository or download and compress the zip file. Once you have the folder uncompressed, open a Terminal or Console on the folder and type the install command:

```
npm install
```

Before run the project, it is needed to have MongoDB Database installed on your system.
You can set your own Mongo URI String connection by setting up the environment var MONGO_URI.
If this env var is not available, the project will try to connect to a default database on localhost by using the default string: mongodb://127.0.0.1/medullan-auth-test

## Test

To be able to run the unit-tests, just type the test command form the terminal:

```
npm run test
```

------------



## Data Models

I have created 3 models, they are located on the /src/models/

### User Model
Contains the basic information for a user and the lock data for respective validations

### LockoutPolicy
Contains all rules defined as a Lockout Policy per each request in the application. Each policy must be associated to a Application Instace (refered as the country code in a environment var).

### PasswordPolicy
Contains all rules defined as a Policy to be applied to User Passwords. Each policy must be associated to a Application Instace (refered as the country code in a environment var).


## Object Models
Although I have not used ES6 classes, this library is based on the same concepts, exposing public methods/functions and keeping internal functions as private per each module.


### index
The main module with public functions offer the requested functions by the Medullan Test:

**registerUser**
Receive two params: email, password
The password should be passed as a plain string. It will internally manage all code to hash it. Also the library will handle the validations to avoid duplicated users and avoid invalid emails.

**loginUserRequest**
This function receive a standard HTTP Request Object, based on this request, it will extract the request signature and the user data from the body.
On the body the required variables are email and password.
To apply all Lockout Policies, this function will use the headers from the Request Object.

**deleteUser**
Function exposed only to use it from testing, to be able to run all unit-tests.
It will delete a user based on the username.


### Policies/lockout
Module that handle all Lockout Validations per each request.


### Auth/login
Module that handle all login functions, including Database queries, validations and lockout rules due to max failed login attempts.


### Auth/register
Module that handle user registration process, including password policy and database validations to avoid bad emails and avoid duplicated users.
