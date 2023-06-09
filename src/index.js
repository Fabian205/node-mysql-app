const express = require("express");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);
const {database} = require('./keys');
const  passport = require('passport');


//initializations
const app = express();
require('./lib/passport');

const sessionStore =  new MySQLStore(database);

//settings
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
  })
);
app.set("view engine", ".hbs");

//Middlewares
app.use(session({ 
  key:'nobasession',
  secret: 'nobasys',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

app.use(flash());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Global variables
app.use((req, res, next) => {
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message');
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require("./routes/"));
app.use(require("./routes/authentication"));
app.use("/links", require("./routes/links"));

// Se agrega para eliminar error en navegadores ojo firefox sigue error
app.get('/favicon.ico', (req, res) => {
  res.sendStatus(404);
});
//Public
app.use(express.static(path.join(__dirname, "public")));

//Startin the server
app.listen(app.get("port"), () => {
  console.log("Server listening on port ", app.get("port"));
});
