/* eslint-disable no-undef */
'use strict';
require('dotenv');
const knex = require('knex');
const app = require('../src/app');
const BookmarksService = require('../src/bookmarks/BookmarksService');

describe('Bookmarks Endpoints', function () {
  let db;
  let testdb =
    [
      {
        'id': 1,
        'title': 'bookmark 1',
        'url': 'https://bookmark1.com',
        'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent lacinia purus sed eros rhoncus, eget ultricies nunc bibendum. Nunc fringilla laoreet tortor, non vestibulum felis. Nunc tincidunt eros eu porta hendrerit. Sed ac commodo magna. Mauris consectetur nulla vel lectus condimentum ultricies. Nullam id mi ut tortor elementum elementum. Donec placerat nulla sit amet diam iaculis, vitae auctor arcu tempor. Fusce aliquam quis nunc id dignissim. Donec porta faucibus purus id euismod.',
        'rating': '3'
      },
      {
        'id': 2,
        'title': 'bookmark 2',
        'url': 'https://bookmark2.com',
        'description': 'Ut congue nibh quam, vel pharetra ipsum tempor dictum. Proin varius sit amet orci aliquam blandit. Fusce ut tellus et turpis facilisis imperdiet quis sed arcu. Quisque vitae tempor libero. Sed eleifend, nisi ut interdum scelerisque, odio felis tempor tortor, a scelerisque nulla turpis ac dui. Quisque condimentum sapien eros, sed dignissim risus rhoncus nec. In viverra tellus erat, quis porta arcu feugiat id.',
        'rating': '4'
      },
      {
        'id': 3,
        'title': 'bookmark 3',
        'url': 'https://bookmark3.com',
        'description': 'Aenean sit amet lorem nec purus aliquam iaculis. Morbi et dolor et elit suscipit hendrerit suscipit et orci. Donec vitae eros laoreet tortor vestibulum maximus quis ut sem. Proin eget magna non ligula cursus suscipit. Nulla volutpat ligula quis nulla consectetur ornare. In sollicitudin efficitur neque quis sagittis. Maecenas sed sapien lobortis, pharetra sapien quis, rhoncus leo. Proin quis tempus urna. Donec commodo, nisl sed laoreet viverra, nisl ipsum sodales nunc, sit amet varius nulla turpis mattis metus. Quisque vitae euismod ligula, a porttitor elit. In eget cursus turpis. Sed et diam lobortis, tempor quam ultricies, commodo massa.',
        'rating': '5'
      }
    ];

  before('make knex isntance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });
  
  before('clean the table', () => db('test_bookmarks').truncate());

  afterEach(() => db('test_bookmarks').truncate());

  after('disconnect from db', () => db.destroy());

  context('Given there are bookmarks in the database', () => {

    beforeEach(() => {
      return db
        .into('test_bookmarks')
        .insert(testdb);
    });

    // 401 status tests
    it('responds with 401 status for GET /bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for POST /bookmarks', () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for GET /bookmarks/:id', () => {
      const bookmark = testdb[1];
      return supertest(app)
        .get(`/bookmarks/${bookmark.id}`)
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for DELETE /bookmarks/:id', () => {
      const bookmark = testdb[1];
      return supertest(app)
        .delete(`/bookmarks/${bookmark.id}`)
        .expect(401, { error: 'Unauthorized request' });
    });

    // smoke tests
    it('responds with 200 and bookmarks from the store', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_KEY}`)
        .expect(200, testdb);
    });

    it('responds with 200 and the specified bookmark', () => {
      const bookmarkId = 2;
      const expected = testdb[bookmarkId - 1];
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${process.env.API_key}`)
        .expect(200, expected);
    });

    it('removes the bookmark by ID from the store', () => {
      const remove = 2;
      const expected = testdb.filter(bm => bm.id !== remove);
      return supertest(app)
        .delete(`/bookmarks/${remove}`)
        .set('Authorization', `Bearer ${process.env.API_key}`)
        .expect(204)
        .then(() =>
          supertest(app)
            .get('/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_key}`)
            .expect(expected)
        );
    });
  });
});
