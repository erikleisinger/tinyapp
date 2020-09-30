const generateRandomString = function () {
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

  let randomString = "";

  for (let x = 0; x < 6; x++) {
    let randomNumber = Math.floor(Math.random() * alphabet.length)
    randomString += alphabet[randomNumber];
  }
  return randomString;
};

const validateUser = function(db, email) {
  
  for (let user in db) {
    console.log(`this is ${user}'s email: ${db[user].email}`)
    if (db[user].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { generateRandomString, validateUser };