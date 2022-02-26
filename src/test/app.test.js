import { test, describe, expect } from '@jest/globals';

import fetch from 'node-fetch';

const {
    BASE_URL = 'http://localhost:7777',
    ADMIN_USER: adminUser = '',
    ADMIN_PASS: adminPass = '',
  } = process.env;


// USERS TEST
// GET                      only admin
describe('users', () => {
    test('GET /users/', async () => {
        const url = BASE_URL + '/users/';
        const res = await fetch(url, {
            method: 'GET'
        });
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json).toBeDefined();
    })
})
// GET with ID              only admin
// POST /users/register     
describe('register', () => {
    test('post /users/register', async () => {
        const user = { name: 'Björgvin', username: 'Bjoggi9999', password: '123'};
        const url = BASE_URL + '/users/register';
        const res = await fetch(url, {
            method: 'POST',
            body: user,
        });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toBeDefined();
    })
})
// POST /user/login
describe('login', () => {
    test('post /users/login', async () => {
        const user = { username: 'Bjoggi9999', password: '123'};
        const url = BASE_URL + '/users/login';
        const res = await fetch(url, {
            method: 'POST',
            body: user,
        });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toBeDefined();
    })
})

// GET /users/me            only loged-in


// EVENT TEST
// GET check
describe('events', () => {
    test('GET /events/', async () => {
        const url = BASE_URL + '/events/';
        const res = await fetch(url, {
            method: 'GET'
        });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toBeDefined();
    })
})

//POST                          only if loged-in

// GET with ID
// PATCH with ID                loged-in or admin
// DELETE with ID               loged-in or admin


// REGISTRATION TEST
// POST                         only loged-in
// DELETE                       only loged in and registerd

