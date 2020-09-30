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
    if (db[user].password === password && db[user].email === email) {
      return user;
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

module.exports = { generateRandomString, validateUser, loginUser };