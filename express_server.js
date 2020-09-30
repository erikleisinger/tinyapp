const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateRandomString, validateUser } = require('./helpers');
const PORT = 3050; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID1": {
    id: "",
    email: "",
    password: "",
  },
};




app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.cookies["username"]],
  };
  res.render('pages/index', templateVars);

});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["username"]],
    error: null
  };
  res.render('register', templateVars);
});

app.get('/goRegister', (req, res) => {
  const templateVars = {
    user: users[req.cookies["username"]],
    error: null
  };
  res.render('register', templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  let long = urlDatabase[req.params.shortURL]
  console.log(long);
  res.redirect(`http://${long}`);
});

app.post('/updateURL', (req, res) => {
  console.log(`This is the body: ${JSON.stringify(req.body)}`);
  let keyName = Object.keys(req.body)[0];
  urlDatabase[keyName] = req.body[keyName];
  res.redirect('/urls');

});

app.post("/urls", (req, res) => {
  let randomId = generateRandomString()
  urlDatabase[randomId] = req.body.longURL;
  console.log(`User created entry { ${randomId}: "${req.body.longURL}" }`);
  console.log(`Updated URLS: ${JSON.stringify(urlDatabase)}`);
  res.redirect(`/urls/${randomId}`);
});

app.post('/urls/:id/delete', (req, res) => {
  console.log(`User deleted entry { ${req.params.id}: "${urlDatabase[req.params.id]}" }`);
  delete urlDatabase[req.params.id];
  console.log(`Updated urls: ${JSON.stringify(urlDatabase)}`)
  res.redirect('/urls');
});

app.post('/newUser', (req, res) => {
  const templateVars = {
    user: users[req.cookies["username"]],
  };
  let error = validateUser(users, req.body.email, req.body.password);
  if (error) {
    templateVars.error = error;
    res.render('register', templateVars);

  } else {
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: req.body.password
    };
  
    console.log(users);
    res.cookie('user_id', newId);
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  console.log(req.body);
  res.cookie('username', 'hiuefbwubf');
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: `${urlDatabase[req.params.shortURL]}`,
    user: users[req.cookies["user_id"]]
  };
  console.log(req.params.shortURL)
  res.render('urls_show', templateVars);
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