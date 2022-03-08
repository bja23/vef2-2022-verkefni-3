import { test, describe, expect } from '@jest/globals';

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:7777';

let token = '';

// USERS TEST
// GET                      only admin
describe('users', () => {
  test('GET /users/', async () => {
    const url = BASE_URL + '/users/'; // eslint-disable-line prefer-template
    const res = await fetch(url, {
      method: 'GET',
    });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toBeDefined();
  });
});
// GET with ID              only admin
// POST /users/register
describe('register', () => {
  test('post /users/register', async () => {
    const user = { name: 'Björgvin', username: 'Bjoggi9999', password: '123' };
    const url = BASE_URL + '/users/register'; // eslint-disable-line prefer-template
    const res = await fetch(url, {
      method: 'POST',
      body: user,
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toBeDefined();
  });
});
// POST /user/login
describe('login', () => {
  test('post /users/login', async () => {
    const user = { username: 'admin', password: '123' };
    const url = BASE_URL + '/users/login'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'POST';
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(user);
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toBeDefined();
    token = json.token;
  });
});

// GET /users/me            only loged-in
describe('Get user me', () => {
  test('get /users/me', async () => {
    const url = BASE_URL + '/users/me'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'GET';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toBeDefined();
  });
});

// EVENT TEST
// GET check
describe('events', () => {
  test('GET /events/', async () => {
    const url = BASE_URL + '/events/'; // eslint-disable-line prefer-template
    const res = await fetch(url, {
      method: 'GET',
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toBeDefined();
  });
});

// POST only if loged-in
describe('POST new event', () => {
  test('get /users/me', async () => {
    const url = BASE_URL + '/events/'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'POST';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;
    options.body = JSON.stringify({
      name: 'Test1',
      description: 'þetta er test1',
    });
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toBeDefined();
  });
});

// GET with ID
describe('Get event with id', () => {
  test('get /users/me', async () => {
    const url = BASE_URL + '/events/5'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'GET';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toBeDefined();
  });
});
// PATCH with ID                loged-in or admin
describe('PATCH event with id', () => {
  test('PATCH /users/me', async () => {
    const url = BASE_URL + '/events/4'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'PATCH';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;
    options.body = JSON.stringify({ description: 'þetta er test2' });
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toBeDefined();
  });
});

describe('PATCH event with id to change again', () => {
  test('PATCH /users/me', async () => {
    const url = BASE_URL + '/events/4'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'PATCH';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;
    options.body = JSON.stringify({ description: 'ny lysing' });
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toBeDefined();
  });
});

// REGISTRATION TEST
// POST                         only loged-in
describe('POST new register', () => {
  test('POST register', async () => {
    const url = BASE_URL + '/events/4/register'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'POST';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toBeDefined();
  });
});
// DELETE                       only loged in and registerd
describe('DELETE register', () => {
  test('DELETE register', async () => {
    const url = BASE_URL + '/events/4/register'; // eslint-disable-line prefer-template
    const options = { headers: {} };
    options.method = 'DELETE';
    options.headers['content-type'] = 'application/json';
    options.headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, options);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toBeDefined();
  });
});
