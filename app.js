if(process.env.NODE_ENV !== 'production')
{
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// mongoose connection
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
  console.log("Database Connected");
}

// seting view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// serving static assets
app.use(express.static(path.join(__dirname, 'public')));


// setting parser
app.use(express.urlencoded({ extended: true }));

// override method
app.use(methodOverride("_method"));

app.use(mongoSanitize({
  replaceWith : "_"
}));

const secret = process.env.SECRET || "squirrel";
const store = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret : secret
  }
})

store.on("error", function(e) {
  console.log("SESSION STORE ERROR", e)
})

// setting up session
const sessionConfig = {
  store,
  name : "blah",
  secret : secret,
  resave : false,
  saveUninitialized : true,
  cookie : {
    httpOnly : true,
    // secure : true,
    expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge : 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));

// setting up flash
app.use(flash());


// helmet

const scriptSrcUrls = [
 
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net/'
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net/'  // I had to add this item to the array 
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/'
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dpo7yvwxc/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/'
      ],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
);
// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
// '/' entry point

app.get('/fakeUser', async (req, res) => {
  const user = new User({
    email : "madan@gmail.com",
    username : "madan"
  })
  const newUser = await User.register(user, 'gopal');
  res.send(newUser);
})
// server side validation


app.get("/", (req, res) => {
  res.render("home");
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
// for all invalid url
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not Found!!", 404));
});
// error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Oh boy, something went wrong" } = err;
  if (!err.message) err.message = "Oh no, something went wrong";
  res.status(statusCode).render("./Error", { err });
});
// listening on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
