const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;


const { generateRandomString, validateUser, loginUser, urlsForUser, urlConverter } = require('./helpers');
const PORT = 3050; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['a']
}));



const urlDatabase = {
  "b2xVn2": { longUrl: "http://www.lighthouselabs.ca", userId: "userRandomID1" },
  "9sm5xK": { longUrl: "http://www.google.ca", userId: "userRandomID1" },
};

const users = {
  "userRandomID1": {
    id: "erik",
    email: "me@me.com",
    password: "12345678",
  },
};



app.use(bodyParser.urlencoded({ extended: true }));

// HOME PAGE

app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('pages/index', templateVars);

});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null
  };
  res.render('register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  console.log(`This is the current urlDatabase before redirect: ${JSON.stringify(urlDatabase)}`);
  console.log(`this is the req.params.shortURL: ${req.params.shortURL}`);
  let long = urlDatabase[req.params.shortURL].longUrl;
  
  res.redirect(long);
  // console.log(long);
  // res.redirect(long);
});

app.post('/updateURL', (req, res) => {
  const templateVars = {
    urls: null,
    user: users[req.session.user_id]
  };
  let keyName = Object.keys(req.body)[0];

  // converted to http:// url format
  let convertedUrl = urlConverter(req.body[keyName]);

  urlDatabase[keyName].longUrl = convertedUrl;
  templateVars.urls = urlsForUser(urlDatabase, req.session.user_id);

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const templateVars = {
    urls: null,
    user: users[req.session.user_id]
  };
  let randomId = generateRandomString()

  // url is passed through a function which ensures it begins 'http://', to ensure no redirect problems
  let convertedUrl = urlConverter(req.body.longURL);
  urlDatabase[randomId] = {longUrl: convertedUrl, userId: req.session.user_id};

  templateVars.urls = urlsForUser(urlDatabase, req.session.user_id);
  
  res.render(`urls_index`, templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  let userId = req.session.user_id;
  let userURLs = urlsForUser(urlDatabase, userId);
  console.log(userURLs);
  if (userURLs) {
    if (userURLs[req.params.id]) {
      console.log(`User ${userId} deleted entry { ${req.params.id}: "${urlDatabase[req.params.id]}" }`);
      delete urlDatabase[req.params.id];
      console.log(`Updated urls: ${JSON.stringify(urlDatabase)}`)
    }

  } else {
    // will not delete
  }
  
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const templateVars = {
    user: "",
    urls: null,
    error: null,
  };
  let error = validateUser(users, req.body.email, req.body.password);
  if (error) {
    templateVars.error = error;
    res.render('register', templateVars);

  } else {
    let hash = bcrypt.hashSync(req.body.password, saltRounds);
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: hash
    };
    templateVars.user = users[req.session.user_id];
    templateVars.email = req.body.email;
    templateVars.urls = urlsForUser(urlDatabase, newId);
    res.render('login', templateVars);
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null,
    email: null
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const templateVars = {
    urls: null,
    user: "",
    error: null,
    email: null,
  };
  if (loginUser(users, req.body.email, req.body.password)) {
    console.log(`loginUser returned true`)
    let userId = loginUser(users, req.body.email, req.body.password);
    console.log(`this is the userId returned from loginUser: ${userId}`);
    req.session.user_id = userId;
    console.log(`this is req.session.user_id: ${req.session.user_id}`)
    console.log(`this is users database: ${JSON.stringify(users)}`)
    console.log(users[String(req.session.user_id)] === true);
    templateVars.user = users[req.session.user_id];
    templateVars.urls = urlsForUser(urlDatabase, userId);
    res.render('urls_index', templateVars);
  } else {
    console.log(`loginUser returned false`)
    templateVars.error = `Email or password incorrect.`;
    templateVars.email = req.body.email;
    res.render('login', templateVars);
  }

})

app.post('/logout', (req, res) => {

  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: null,
    user: users[req.session.user_id]
  };
  console.log(users);
  console.log(req.session.user_id)
  if (req.session.user_id) {
    templateVars.urls = urlsForUser(urlDatabase, req.session.user_id);
    res.render("urls_index", templateVars);
  } else {
    res.redirect('login');
  }


});
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  if (req.session.user_id) {
   
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }

});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: `${urlDatabase[req.params.shortURL].longUrl}`,
    user: users[req.session.user_id]
  };

  let userId = req.session.user_id;
  let userURLs = urlsForUser(urlDatabase, userId);
  if (userURLs) {
    if (userURLs[req.params.shortURL]) {
      res.render('urls_show', templateVars);
    }

  } else {
    res.sendStatus(500);
  }

  
});

app.get("/about", (req, res) => {
  res.render('pages/about');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});