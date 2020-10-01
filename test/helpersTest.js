const { assert } = require('chai');

const { getUserByEmail } = require('../helpers')

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('should return false if the email is non-existant', function() {
    const user = getUserByEmail(testUsers, "user@e.com");
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
  it('should return false if the email is undefined', function() {
    const user = getUserByEmail(testUsers, undefined);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});