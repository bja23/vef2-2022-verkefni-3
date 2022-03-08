import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
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
  createEvent,
  findEvent,
  updateEvent,
  register,
  deleteRegister,
  findAllRegistrationToEvent,
  deleteRegisterFromEvent,
  deleteEvent,
  findingRegisterion,
} from './users.js';

dotenv.config();

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


app.post('/users/login', async (req, res) => {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.status(201).json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

function requireAuthentication(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const error =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error });
    }

    // Látum notanda vera aðgengilegan í rest af middlewares
    req.user = user;
    return next();
  })(req, res, next);
}

app.get('/users/', requireAuthentication, async (req, res) => {
  // check if user is admin
  const isUserAdmin = await isAdmin(req.user.username);
  if (isUserAdmin.isadmin) {
    const all = await findAllUsers();
    return res.status(201).json(all);
  } 

  return res.status(400).json({ error: 'Notandi er ekki stjórnandi' });
  
});

const validation = [
  body('name')
    .isLength({ min: 1, max: 64 })
    .withMessage('Nafn má ekki vera tómt'),
  body('username')
    .isLength({ min: 1, max: 64 })
    .withMessage('username má ekki vera tómt'),
  body('password')
    .isLength({ min: 3, max: 254 })
    .withMessage(
      'password verður að vera 3 stafir eða lengra og ekki stærra en 254'
    ),
];

const validationEvent = [
  body('name')
    .isLength({ min: 1, max: 64 })
    .withMessage('Nafn má ekki vera tómt'),
  body('description')
    .isLength({ max: 254 })
    .withMessage('Lýsingar meiga ekki vera lengri en 254 stafir'),
];

const validationUpdateEvent = [
  body('description')
    .isLength({ max: 254 })
    .withMessage('Lýsingar meiga ekki vera lengri en 254 stafir'),
];

const validationRegisterToEvent = [
  body('comment')
    .isLength({ max: 254 })
    .withMessage('Komment má ekki vera lengra en 254 stafir'),
];

const sanitazion = [
  body('name').trim().escape(),
  body('username').trim().escape(),
  body('name').customSanitizer((value) => xss(value)),
  body('username').customSanitizer((value) => xss(value)),
  body('password').customSanitizer((value) => xss(value)),
];

const sanitazionEvent = [
  body('name').trim().escape(),
  body('name').customSanitizer((value) => xss(value)),
  body('description').customSanitizer((value) => xss(value)),
];

const sanitazionUpdateEvent = [
  body('description').customSanitizer((value) => xss(value)),
];

const sanitazionRegisterToEvent = [
  body('comment').customSanitizer((value) => xss(value)),
];

const validationRegister = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json(result);
  }

  return next();
};

const validationRegisterEvent = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json(result);
  }

  return next();
};

const validationRegisterUpdateEvent = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json(result);
  }

  return next();
};

const validationRegisterRegisterToEvent = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.json(result);
  }

  return next();
};

app.get('/', (req, res) => {
  res.json({
    register: '/users/register',
    login: '/users/login',
    me: '/users/me',
    events: '/events/',
  });
});

app.post(
  '/users/register',
  validation,
  validationRegister,
  sanitazion,
  async (req, res) => {
    const { name, username, password } = req.body;
    const pass = await bcrypt.hash(password, 10);

    const test = await createUser(name, username, pass);
    if (test) {
      // eslint-disable-next-line object-shorthand
      const myData = [{ userCreted: test, name: name, username: username }];
      return res.status(201).json(myData);
    }

    return res.status(400).json({ error: 'heppnaðist ekki' });
  }
);

app.get('/users/me', requireAuthentication, async (req, res) => {
  const myData = await findByUsername(req.user.username);
  const showData = [
    {
      id: myData.id,
      name: myData.name,
      username: myData.username,
      token: req.user.token,
    },
  ];
  return res.status(201).json(showData);
});

app.get('/users/', requireAuthentication, async (req, res) => {
  const myData = await findAllUsers();
  const myInfo = await findById(req.user.id);
  if (myInfo[0].isAdmin) {
    return res.status(201).json(myData);
  }
  return res.status(400).json({ error: 'not admin' });
});

app.get('/users/:id', requireAuthentication, async (req, res) => {
  const { id } = req.params;
  // check if user is admin
  const isUserAdmin = await isAdmin(req.user.username);
  if (isUserAdmin.isadmin) {
    const all = await findById(id);
    if (all != null) {
      const showData = [{ id: all.id, name: all.name, username: all.username }];
      return res.status(201).json(showData);
    }
    return res.status(404).json({ error: 'Not found' });
  }
  return res.status(400).json({ error: 'Notandi er ekki stjórnandi' });
});

app.get('/events/', async (req, res) => {
  const myData = await findAllEvents();
  if (myData === false) {
    return res.status(400).json({ error: 'no data to show' });
  }
  return res.status(200).json(myData);
});

app.post(
  '/events/',
  requireAuthentication,
  validationEvent,
  validationRegisterEvent,
  sanitazionEvent,
  async (req, res) => {
    const { name = '', description = '' } = req.body;
    const user = req.user.id;

    const test = await createEvent(name, description, user);
    if (test) {
      return res.status(201).json({ worked: 'TRUE' });
    }

    return res.status(400).json({ error: 'i dont know' });
  }
);

app.get('/events/:id', async (req, res) => {
  const { id } = req.params;

  const myData = await findEvent(id);
  const registration = await findAllRegistrationToEvent(id);
  const showData = [myData, registration];

  if (myData === false || myData.length === 0) {
    return res.status(401).json({ error: 'no data to show' });
  }
  return res.status(201).json(showData);
});

app.patch(
  '/events/:id',
  requireAuthentication,
  validationUpdateEvent,
  validationRegisterUpdateEvent,
  sanitazionUpdateEvent,
  async (req, res) => {
    const { id } = req.params;
    const { description = '' } = req.body;
    const user = req.user.id;
    const eventData = await findEvent(id);
    const userInfo = await findById(user);
    if (user === eventData.creator || userInfo.isadmin) {
      // check if description is not empty and has changed
      if (description !== '' && description !== eventData.description) {
        await updateEvent(description, id);
        return res.status(200).json({ updated: 'true' });
      }
      return res
        .status(400)
        .json({ error: 'description is the same or missing' });
    }
    return res
      .status(400)
      .json({ error: 'user did not create event and is not admin' });
  }
);

app.delete('/events/:id', requireAuthentication, async (req, res) => {
  const { id } = req.params;
  const user = req.user.id;
  const eventData = await findEvent(id);
  const userInfo = await findById(user);
  if (user === eventData[0].creator || userInfo.isAdmin) {
    await deleteRegisterFromEvent(id);
    const delEvent = await deleteEvent(id);
    if (delEvent) {
      res.status(200).json({ message: 'event deleted' });
    }
  }
  return res.status(400).json({ error: 'user did not delete event' });
});

app.post(
  '/events/:id/register',
  requireAuthentication,
  validationRegisterToEvent,
  validationRegisterRegisterToEvent,
  sanitazionRegisterToEvent,
  async (req, res) => {
    const { id } = req.params;
    const { comment = '' } = req.body;
    const user = req.user.id;
    const regi = await register(id, comment, user);
    if (regi) {
      return res.status(201).json({ worked: 'TRUE' });
    }

    return res.status(400).json({ error: 'did not register' });
  }
);

app.delete('/events/:id/register', requireAuthentication, async (req, res) => {
  const { id } = req.params;
  const user = req.user.id;
  const isRegisterd = await findingRegisterion(id, user);
  if (isRegisterd) {
    const delregi = await deleteRegister(id, user);
    if (delregi) {
      return res.status(201).json({ worked: 'TRUE' });
    }
  }
  return res.status(400).json({ error: 'did not delete registration' });
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
   // eslint-disable-next-line prefer-template
  console.info('Server running at http://' + hostname + ':' + port + '/events');
});
