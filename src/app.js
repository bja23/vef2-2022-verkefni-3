import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { body, validationResult } from "express-validator";
import xss from "xss";
import dotenv from 'dotenv';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

import {
  comparePasswords,
  findByUsername,
  findById,
  isAdmin,
  findAllUsers,
  createUser,
  findAllEvents,
} from './users.js';

const {
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000,
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 20000,
  DATABASE_URL: databaseUrl,
} = process.env;

if (!jwtSecret || !databaseUrl) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

const app = express();

app.use(express.json());

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  // fáum id gegnum data sem geymt er í token
  const user = await findById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

app.use(passport.initialize());

const data = [
  { id: 1, title: 'Foo', name: 'Jón' },
  { id: 2, title: 'Bar', name: 'Anna' },
];

// hjálparfall sem athuga hvort "s" sé null, undefined eða falsy
function isEmpty(s) {
  return s == null && !s;
}

// Útbýr ID fyrir færslu, aðeins fyrir dæmi, ekki nota í neinu alvöru!
// Ef við höfum gagnagrunn myndum við nota serial primary key þar til að
// útbúa ID
function nextId() {
  return data.map((i) => i.id).reduce((a, b) => (a > b ? a : b + 1), 1);
}

/*
GET:
> curl http://localhost:3000
[{"id":1,"title":"Foo"},{"id":2,"title":"Bar"}]
> curl http://localhost:3000/2
{"id":2,"title":"Bar"}
*/

app.post('/users/login', async (req, res) => {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such use' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }

      // Látum notanda vera aðgengilegan í rest af middlewares
      req.user = user;
      return next();
    },
  )(req, res, next);
}

app.get('/users/', requireAuthentication, async(req, res) => {
  // check if user is admin
  const isUserAdmin = await isAdmin(req.user.username);
  if(isUserAdmin.isadmin){
    const all = await findAllUsers();
    res.json(all);
  }
  else{
    res.json({ error: 'Notandi er ekki stjórnandi' });
  }
});

const validation = [
  body("name")
    .isLength({ min: 1, max: 64 })
    .withMessage("Nafn má ekki vera tómt"),
  body("username")
    .isLength({ min: 1, max: 64})
    .withMessage("username má ekki vera tómt"),
  body("password")
    .isLength({ min: 3, max: 254 })
    .withMessage("password verður að vera 3 stafir eða lengra og ekki stærra en 254"),
];

const sanitazion = [
  body("name").trim().escape(),
  body("username").trim().escape(),
  body("name").customSanitizer((value) => xss(value)),
  body("username").customSanitizer((value) => xss(value)),
  body("password").customSanitizer((value) => xss(value)),
];

const validationRegister = async (req, res, next) => {
  const { name ,username, password } = req.body;
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json(result);
  }

  return next();
};

app.post('/users/register', validation,validationRegister, sanitazion, async (req, res) => {
  const { name ,username, password } = req.body;
  const pass = await bcrypt.hash(password,10);
  console.log(pass);

  const test = await createUser(name, username, pass);
  console.log(test);
  if(test){
    const myData = [
      {userCreted: test, name: name, username: username, }
    ];
    return res.json(myData);
  }

  return res.json({error: "heppnaðist ekki"});
});

app.get('/users/me', requireAuthentication, async(req, res) => {
  const myData = await findByUsername(req.user.username);
  const showData = [
    {id: myData.id,name: myData.name, username: myData.username, token: req.user.token, }
  ];

  return res.json(showData);
});

app.get('/users/:id', requireAuthentication, async(req, res) => {
  const { id } = req.params;
  // check if user is admin
  const isUserAdmin = await isAdmin(req.user.username);
  if(isUserAdmin.isadmin){
    const all = await findById(id);
    if(all != null){
      const showData = [
        {id: all.id,name: all.name, username: all.username, }
      ];
      return res.json(showData);
    }
    else{
      return res.status(404).json({ error: 'Not found' });
    }
  }
  else{
    return res.json({ error: 'Notandi er ekki stjórnandi' });
  }
});

app.get('/events/', async(req, res) => {
  const myData = await findAllEvents();
  return res.json(myData);
});

app.post('/events/',requireAuthentication, (req, res) => {
  const { title = '' } = req.body;

  // Hér ætti að vera meira robust validation
  if (typeof title !== 'string' || title.length === 0) {
    return res.status(400).json({
      field: 'title',
      error: 'Title must be a non-empty string',
    });
  }

  const item = { id: nextId(), title };
  data.push(item);

  return res.status(201).json(item);
});


app.get('/events/:id', (req, res) => {
  const { id } = req.params;

  const item = data.find((i) => i.id === Number.parseInt(id, 10));

  if (item) {
    return res.json(item);
  }

  return res.status(404).json({ error: 'Not found' });
});

/*
POST:
> curl -vH "Content-Type: application/json" -d '{x}' http://localhost:3000/
{"error":"Invalid json"}
> curl -vH "Content-Type: application/json" -d '{"title":""}' http://localhost:3000/
{"field":"title","error":"Title must be a non-empty string"}
> curl -vH "Content-Type: application/json" -d '{"title":"bar"}' http://localhost:3000/
{"id":2,"title":"foo"}
*/


/*
PUT:
> curl -X PUT -H "Content-Type: application/json" -d '{"title": "asdf", "name": "Jói"}' http://localhost:3000/4
{"error":"Not found"}
> curl -X PUT -H "Content-Type: application/json" -d '{"title": "asdf", "name": "Jói"}' http://localhost:3000/2
{"id":2,"title": "asdf","name": "Jói"}
*/
app.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title = '', name = '' } = req.body;

  const item = data.find((i) => i.id === Number.parseInt(id, 10));

  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }

  const errors = [];

  // Hér ætti að vera meira robust validation
  if (typeof title !== 'string' || title.length === 0) {
    errors.push({
      field: 'title',
      error: 'Title must be a non-empty string',
    });
  }

  if (typeof name !== 'string' || name.length === 0) {
    errors.push({
      field: 'name',
      error: 'Name must be a non-empty string',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  item.title = title;
  item.name = name;
  return res.status(200).json(item);
});

/*
PATCH:
> curl -X PATCH -H "Content-Type: application/json" -d '{"title": "asdf"}' http://localhost:3000/4
{"error":"Not found"}
> curl -X PATCH -H "Content-Type: application/json" -d '{"title": "asdf"}' http://localhost:3000/2
{"id":2,"title": "asdf","name": "Anna"}
*/
app.patch('/:id', (req, res) => {
  const { id } = req.params;

  // verðum að vita hvort gögnin séu send inn eða aðeins falsy
  const { title, name } = req.body;

  const item = data.find((i) => i.id === Number.parseInt(id, 10));

  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }

  const errors = [];

  // Þetta gæti valdið vandræðum ef title mætti vera uppfært sem tómi strengur
  if (!isEmpty(title)) {
    if (typeof title !== 'string' || title.length === 0) {
      errors.push({
        field: 'title',
        error: 'Title must be a non-empty string',
      });
    }
  }

  if (!isEmpty(name)) {
    if (typeof name !== 'string' || name.length === 0) {
      errors.push({
        field: 'name',
        error: 'Name must be a non-empty string',
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  if (!isEmpty(title)) {
    item.title = title;
  }

  if (!isEmpty(name)) {
    item.name = name;
  }

  return res.status(200).json(item);
});

/*
DELETE:
> curl -X DELETE http://localhost:3000/5
{"error":"Not found"}
> curl -X DELETE http://localhost:3000/2
*/
app.delete('/:id', (req, res) => {
  const { id } = req.params;

  const item = data.find((i) => i.id === Number.parseInt(id, 10));

  if (item) {
    data.splice(data.indexOf(item), 1);
    return res.status(204).end();
  }

  return res.status(404).json({ error: 'Not found' });
});

app.use((req, res) => {
  console.warn('Not found', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Grípum illa formað JSON og sendum 400 villu til notanda
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.info('Server running at http://'+hostname+':'+port+'/events');
});