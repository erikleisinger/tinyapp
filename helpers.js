const bcrypt = require('bcrypt');

const generateRandomString = function() {
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  let randomString = "";

  for (let x = 0; x < 6; x++) {
    let randomNumber = Math.floor(Math.random() * alphabet.length);
    randomString += alphabet[randomNumber];
  }
  return randomString;
};

const getDate = function() {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  let today = new Date();
  let day = today.getDate();
  let month = monthNames[today.getMonth()];
  let year = today.getFullYear();
  let hour = today.getHours();
  let min = Math.round(today.getMinutes(), 2);

  return `${month} ${day}, ${year} at ${hour}:${min}`;
};
getDate();

const getUserByEmail = function(db, email) {
  for (let entry in db) {
    if (db[entry].email === email) {
      return entry;
    }
  }
  return false;
};

const findUser = function(db, email, password) {
  let userAccount = getUserByEmail(db, email);
  if (userAccount) {
    if (bcrypt.compareSync(password, db[userAccount].password) === true) {
      return userAccount;
    }
  }

  return null;
};

const validateId = function(db, id) {
  for (let entry in db) {
    if (entry === id) {
      return true;
    }
  }
  return false;
};

const validateUser = function(db, email, password) {
  if (!email && !password) {
    return `Please complete all fields`;
  } else if (!password) {
    return `Please enter a password`;
  } else {
    for (let user in db) {
      if (db[user].email === email) {
        return `Email already in use`;
      }
    }
  }
  if (password.length < 7) {
    return `Password must be at least 7 characters`;
  }
  return null;

};




const urlsForUser = function(db, id) {
  let returnData = {

  };
  for (let url in db) {
    if (db[url].userId === id) {
      returnData[url] = { longUrl: db[url].longUrl, userId: db[url].userId, time: db[url].time, visits: db[url].visits };
    }
  }
  if (Object.keys(returnData).length === 0) {
    return null;
  } else {
    return returnData;
  }

};

const urlConverter = function(url) {

  if (/^http:\/\//.test(url) === true) {
    return url;
  } else {
    return "http://" + url;
  }
};



module.exports = { generateRandomString, validateUser, findUser, urlsForUser, urlConverter, getUserByEmail, validateId, getDate };