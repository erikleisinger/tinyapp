const bcrypt = require('bcrypt');

const generateRandomString = function () {
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

  let randomString = "";

  for (let x = 0; x < 6; x++) {
    let randomNumber = Math.floor(Math.random() * alphabet.length)
    randomString += alphabet[randomNumber];
  }
  return randomString;
};

const loginUser = function (db, email, password) {
  for (let user in db) {
    
    // first matches the passed in email with an email in the database
    if (db[user].email === email) {
      // once correct email is found, it checks the plaintext password passed in with the hash in db[user]
      return bcrypt.compareSync(password, db[user].password);
    };
  }
  return null;
};

const validateUser = function(db, email, password) {
  if (!email && !password) {
    return `Please complete all fields`;
  } else if (!email) {
    return `Please enter a valid email address`;
  } else if (!password) {
    return `Please enter a password`;
  } else if (password.length < 7) {
    return `Password must be at least 7 characters`
  } else {
    for (let user in db) {
      if (db[user].email === email) {
        return `Email already in use`;
      }
    }
    return null;
  }
  
};

const  urlsForUser = function (db, id) {
  let returnData = {

  };
  for (let url in db) {
    if (db[url].userId === id) {
      returnData[url] = {longUrl: `${db[url].longUrl}`, userId: `${db[url].userId}`}
    }
  }
  if (Object.keys(returnData).length === 0) {
    return null
  } else {
    return returnData;
  }
  
}


module.exports = { generateRandomString, validateUser, loginUser, urlsForUser }