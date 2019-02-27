"use strict";

const express = require("express");
const bookmarksRouter = express.Router();
const logger = require("../logger");
const BookmarksService = require("./BookmarksService");
const bodyParser = express.json();
const xss = require('xss');
const uuid = require("uuid/v4");

bookmarksRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { title, url, description, rating } = req.body;
    const newItem = {
      title,
      url,
      description,
      rating
    };
    BookmarksService.addItem(knexInstance, newItem).then(bookmarks => {
      console.log(bookmarks)
      res.json(bookmarks);
    });
  });

bookmarksRouter.route("/:id")
  .get((req, res, next) => {
  BookmarksService.getById(req.app.get("db"), req.params.id)
    .then(bookmark => {
      console.log(bookmark)
      res.json({
        id: bookmark.id,
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        description: xss(bookmark.description),
        rating: bookmark.rating
      });
    })
    .catch(next);
})
  .delete((req, res, next) =>{
    const itemId = req.params.id
    BookmarksService.deleteItem(req.app.get("db"), itemId)
      .then(() =>{
        res.status(201).end()
      })
      .catch(next)
  })
;

/*   .post(bodyParser, (req, res) => {
    const { title, url, content } = req.body;
    const id = uuid();
    const newBookmark = {
      id,
      title,
      url,
      content
    };

    if (!title || !url) {
      logger.error('No title or url were submitted.');
      return res.status(404).send('Please submit a title and URL.');
    }

    BOOKMARKS.push(newBookmark);
    res
      .status(201)
      .location(`https://localhost:8000/bookmarks/${id}`)
      .json(newBookmark);
    
  });

bookmarksRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = BOOKMARKS.find(bookmark => bookmark.id === id);
    if (!bookmark) {
      logger.error(`Bookmark not found with id: ${id}`);
      return res.status(404).send('Bookmark not found.');
    }
    res.json(bookmark);

  })

  .delete((req, res) => {
    const { id } = req.params;
  
    
    if (bookmarkIndex === - 1) {
      logger.error(`Bookmark not found with id: ${id}`);
      return res.status(404).send('Bookmark not found.');
    }
    BOOKMARKS.splice(bookmarkIndex, 1);
    res.status(204).end();

  }); */

module.exports = bookmarksRouter;
