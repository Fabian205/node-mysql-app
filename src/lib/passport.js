const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const notifier = require('node-notifier');
//const {alert} = require('alert');
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async(req, username, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if(rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password);
    if(validPassword){
      //done(null, user, req.flash('success', 'Welcome ' + user.username));
      notifier.notify({
        title: 'Verify Password',
        message: 'Welcome ' + [user.username],
      });
      done(null, user);
    }else{
      //done(null, false, req.flash('message', 'Invalid password'));
      notifier.notify({
        title: 'Verify Password',
        message: 'Invalid password!'
      });
      done(null, false);
      //alert('Invalid password');   
    }
  }else{
    //return done(null, false, req.flash('message', 'The Username does not exists'));
    notifier.notify({
      title: 'Verify Password',
      message: 'The Username does not exists!'
    });
    return done(null, false);
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passportField: 'password',
  passReqToCallback: true,
}, async(req, username, password, done) => {
  const {fullname} = req.body;
  const newUser ={
    username,
    password,
    fullname
  };
  newUser.password = await helpers.encryptPassword(password);
  const result = await pool.query('INSERT INTO users SET ?', [newUser]);
  newUser.id = result.insertId;
  return done (null,newUser);
}));

passport.serializeUser((user, done)=>{
  done(null, user.id);
});

passport.deserializeUser(async(id,done)=>{
  const rows = await pool.query('SELECT * FROM users Where id = ?', [id]);
  done(null, rows[0]);
});