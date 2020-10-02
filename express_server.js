const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;


const { generateRandomString, validateUser, findUser, urlsForUser, urlConverter, validateId, getDate } = require('./helpers');
const PORT = 3080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['a']
}));


const urlDatabase = {
  // placeholder for testing
  "9sm5xK": { longUrl: "http://www.google.ca", userId: "userRandomID1" },
};

const users = {
  // placeholder for testing
  'bHuQNK': {
    id: 'bHuQNK',
    email: 'erikleisinger@gmail.com',
    password:
      '$2b$10$Mrm68YTYVbby9eTTUr8MLOkm4nQjafG/9wB51Puid5nyPM16WYBcW'
  }
};



app.use(bodyParser.urlencoded({ extended: true }));


// HOME PAGE
app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null,
  };
  res.render('pages/index', templateVars);

});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null,
    register: null,
  };

  res.render('register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const templateVars = {
    user: null,
    error: null,
  };


  // first check if the URL exists
  if (validateId(urlDatabase, req.params.shortURL) === false) {
    templateVars.error = `URL does not exist.`
    templateVars.user = users[req.session.user_id],
      res.render('pages/index', templateVars);
  }

  // if URL exists, redirect to page
  res.redirect(urlDatabase[req.params.shortURL].longUrl);
});

app.post('/updateURL', (req, res) => {
  const templateVars = {
    urls: null,
    user: users[req.session.user_id],
    error: null,
  };

  let shortURL = Object.keys(req.body)[0];

  // convert the link to http:// url format
  let convertedUrl = urlConverter(req.body[shortURL]);

  urlDatabase[shortURL].longUrl = convertedUrl;
  templateVars.urls = urlsForUser(urlDatabase, req.session.user_id);

  res.render('urls_index', templateVars);
});


// Create new URL
app.post("/urls", (req, res) => {
  const templateVars = {
    urls: null,
    user: users[req.session.user_id],
    error: null,
  };
  //random string for the URL id in urlDatabase
  let randomId = generateRandomString();

  // url is passed through a function which ensures it begins 'http://', to ensure no redirect problems
  let convertedUrl = urlConverter(req.body.longURL);

  //new entry in urlDatabase
  // get timestamp for when the URL was created
  let timeStamp = String(getDate())
  console.log(`This is the return time: ${timeStamp}`)
  urlDatabase[randomId] = {longUrl: convertedUrl, userId: req.session.user_id, time: timeStamp};
  console.log(typeof(timeStamp))
  console.log(timeStamp)

  templateVars.urls = urlsForUser(urlDatabase, req.session.user_id);
  console.log(urlsForUser(urlDatabase, req.session.user_id))
  res.render(`urls_index`, templateVars);
});

// delete URL
app.post('/urls/:id/delete', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null,
  };

  // first check if the URL exists
  if (validateId(urlDatabase, req.params.id) === false) {
    templateVars.error = `URL does not exist.`;
    res.status(400).send('URL not found.');
  }


  // if URL exists..
  let userId = req.session.user_id;
  // check URLs associated with the client's ID
  let userURLs = urlsForUser(urlDatabase, userId);

  // check that there is an entry for the client in urlDatabase
  if (userURLs) {
    // check client URLs for the requested URL
    if (userURLs[req.params.id]) {
      // if URL is in client's URLs, it will be deleted
      delete urlDatabase[req.params.id];
    }
    // status code 403 if the requested URL is not the client's
  } else {
    res.status(403).send('Access denied.')
  }
  res.redirect('/urls');
});


// PUT - NEW USER REGISTRATION
app.post('/register', (req, res) => {
  const templateVars = {
    user: "",
    urls: null,
    error: null,
    register: null,
  };

  // email and password verified using helper function validateUser()
  // function returns a custom error depending on the problem
  let error = validateUser(users, req.body.email, req.body.password);
  if (error) {
    templateVars.error = error;
    res.render('register', templateVars);

  } else {
    // hash the password received so it can be stored securely
    let hash = bcrypt.hashSync(req.body.password, saltRounds);
    // store new user data (including hashed password) in the users database with a unique ID
    let newId = generateRandomString();
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: hash
    };

    //assign encrypted cookie to client
    req.session.user_id = newId;
    // set parameters to be given to urls_index when rendered
    templateVars.email = req.body.email;
    templateVars.urls = urlsForUser(urlDatabase, newId);
    templateVars.register = true;
    templateVars.user = users[req.session.user_id];


    res.render('urls_index', templateVars);
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: null,
    email: null,
    register: null,
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const templateVars = {
    urls: null,
    user: "",
    error: null,
    email: null,
    register: null,
  };

  // verify the user exists with the findUser() helper function
  if (findUser(users, req.body.email, req.body.password)) {

    // assign cookie to client
    let userId = findUser(users, req.body.email, req.body.password);
    req.session.user_id = userId;

    // update parameters to be passed into urls_index upon rendering
    templateVars.user = users[req.session.user_id];
    templateVars.urls = urlsForUser(urlDatabase, userId);

    res.render('urls_index', templateVars);
  } else {
    // if the user does not exist in the users database, return to login page with relevant error
    templateVars.error = `Email or password incorrect.`;
    templateVars.email = req.body.email;

    res.render('login', templateVars);
  }

})

app.post('/logout', (req, res) => {
  // remove cooke from client
  req.session = null;

  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: null,
    user: users[req.session.user_id],
    error: null,
  };
  if (req.session.user_id) {
    // finds the clients URLs in the database using urlsForUser function
    // passes them into urls_index as parameters so they can be displayed
    templateVars.urls = urlsForUser(urlDatabase, req.session.user_id);

    res.render("urls_index", templateVars);
  } else {
    // if the client does not have a cookie, they must login
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
    // redirect to login if client has no cookie
    res.redirect('/login');
  }

});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: null,
    user: users[req.session.user_id],
  };

  // first check to see if shortURL exists at all
  if (validateId(urlDatabase, req.params.shortURL) == false) {
    templateVars.error = `URL does not exist.`
    res.render('pages/index', templateVars)
  }

  let userId = req.session.user_id;
  // checks if client is logged in
  if (userId) {

    // if logged in, finds the client's account URLS
    let userURLs = urlsForUser(urlDatabase, userId);

    //displays URL if client is the owner
    if (userURLs && userURLs[req.params.shortURL]) {
      res.render('urls_show', templateVars);

      // redirects to account home if client is not the owner
    } else {
      templateVars.error = "You must be the owner of this URL to edit it";
      templateVars.urls = userURLs;
      res.render('urls_index', templateVars);
    }
    //if client is not logged in, they are redirected to the home page with relevant error
  } else {
    templateVars.error = `Not logged in`;
    res.render('pages/index', templateVars)
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