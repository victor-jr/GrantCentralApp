
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  morgan = require('morgan'),
  passport = require('passport'),
  flash = require('connect-flash'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),

  // Require the routes
  routes = require('./routes'),
  ideas = require('./routes/ideas'),
  gwgs = require('./routes/gwgs'),

  http = require('http'),
  path = require('path'),
  models = require('./models');

require('./config/passport')(passport);



var app = module.exports = express();

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session( { secret: 'grantsystemsecrect', saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}


/**
 * Routes
 */
require('./routes/passport')(app, passport); // load our routes and pass in our app and fully configured passport


// serve index and view partials
app.get('/',  routes.index);
app.get('/partials/:name', routes.partials);
app.get('/partials/Idea/:name', isLoggedIn, routes.ideaPartials);
app.get('/partials/Gwg/:name', isLoggedIn, routes.gwgPartials);


// JSON API
app.use('/ideas', ideas);
app.use('/gwgs', gwgs);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Middleware to check authorization
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated())
        return next();
    res.redirect('/login');
};


/**
 * Start Server
 */

models.sequelize.sync().then(function () {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
})

