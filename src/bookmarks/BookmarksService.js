'use strict';

const BookmarksService = {

  getAllBookmarks(knex) {
    return knex
      .select('*')
      .from('test_bookmarks');
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('test_bookmarks')
      .where({ id })
      .first();
  }

};

module.exports = BookmarksService;