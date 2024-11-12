if(process.env.NODE_ENV !=='production'){
  require('dotenv').config();
}

const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const methodOverride=require('method-override');
const ExpressError = require('./utils/ExpressErrors');
const ejsMate=require('ejs-mate');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/users');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const mongoStore = require('connect-mongo')
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/YelpCamp'
const app=express();



main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl)
  .then(()=>{
    console.log('database connection established!')
  })
  .catch((err)=>{
    console.log('error while connecting to database!!')
  })
}

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = mongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret,
  }
});

store.on('error', (err)=>{
  console.log("session store error!")
})

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24
  }
}

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(session(sessionConfig))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
  "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dbmpwyvt9/",
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser (User.serializeUser());
passport.deserializeUser (User.deserializeUser());

app.use(flash());
app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error')
  next();
})


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);



app.get('/', (req,res)=>{
  res.render('home.ejs');
})


//review model.

app.all('*',(req,res,next)=>{
  next(new ExpressError('Page Not Found', 404))
})

app.use((err,req,res,next)=>{
  const {statusCode = 500}= err;
  if(!err.message) err.message= "Something went wrong"
  res.status(statusCode).render('error', {err})
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`Live on Port ${PORT}`);
})