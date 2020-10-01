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

const getUserByEmail = function (db, email) {
  for (let entry in db) {
    if (db[entry].email === email) {
      return entry;
    }
  };
  return false;
}

const loginUser = function (db, email, password) {
    let userAccount = getUserByEmail(db, email);
    if (userAccount) {
      if (bcrypt.compareSync(password, db[userAccount].password) === true) {
        return userAccount;
        }
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
      returnData[url] = {longUrl: db[url].longUrl, userId: db[url].userId}
    }
  }
  if (Object.keys(returnData).length === 0) {
    return null
  } else {
    return returnData;
  }
  
};

const urlConverter = function (url) {
  
  if ( /^http:\/\//.test(url) === true) {
    return url;
  } else {
    return "http://" + url;
  }
};




module.exports = { generateRandomString, validateUser, loginUser, urlsForUser, urlConverter }