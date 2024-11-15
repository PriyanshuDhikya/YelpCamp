const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync');
const User = require('../models/users');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');
const users = require('../controllers/users')

router.route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.registerUser))

router.route('/login')
  .get(users.renderLogin)
  .post(storeReturnTo ,passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)

module.exports = router;