const User = require('../models/users')

module.exports.renderRegister = (req,res)=>{
  res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
  try{
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser  = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to YelpCamp!');
      res.redirect('/campgrounds');
      });
    // req.flash('success',  'Successfully Registered, Welcome to YelpCamp!');
    // res.redirect('/campgrounds')
  }catch(e){
    req.flash('error',  e.message);
    return res.redirect('/register');
  }
}

module.exports.renderLogin = (req,res)=>{
  res.render('users/login');
}

module.exports.login = (req,res)=>{
  req.flash('success',  'Welcome Back!'); 
  // const redirectUrl = res.locals.returnTo || '/campgrounds';
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
  req.logout(function (err){
    if(err){
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds')
  });
}
