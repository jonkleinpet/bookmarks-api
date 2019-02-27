'use strict';

const BookmarksService = {

  getAllBookmarks(knex) {
    console.log(knex)
    return knex
      .select('*')
      .from('bookmarks');
  }

};

module.exports = BookmarksService;