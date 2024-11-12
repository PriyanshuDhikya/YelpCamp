const express = require('express');
const router = express.Router();
const catchAsync =require('../utils/CatchAsync')
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const  Campgrounds = require('../controllers/campgrounds')
const {storage} = require('../cloudinary/index')
const multer = require('multer')
const upload = multer({ storage })

router.route('/')
  .get(catchAsync(Campgrounds.index))
  .post(isLoggedIn, upload.array('image') ,validateCampground ,catchAsync(Campgrounds.createCampground))

router.get('/new', isLoggedIn, Campgrounds.renderNewForm)

router.route('/:id')
  .get(catchAsync(Campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground,catchAsync(Campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor,catchAsync(Campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(Campgrounds.renderEditForm))


module.exports= router