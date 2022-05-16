/*
    POST /login -> Autentificado en el sistema
    GET /       -> la pagina de inicio de sesion

    La funcion passport.use, passport.serializeUser, passport.deserializeUser son tomadas de la
    documentacion oficial de http://www.passportjs.org/docs  y se adapto al modelo Usuario de este sistema
*/

const express = require('express');
const router = express.Router();
const passport = require ('passport');
const LocalStrategy = require ('passport-local').Strategy;
const User = require('./../server/models/user.js');

/*
    GET / -> pagina de inicio de sesion
*/
router.get('/', (req, res) => {
    res.render('login', {layout: false});
});

/*
    POST /login -> autentifica el usuario
*/
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/app',
        failureRedirect: '/',
        failureFlash: true
    }), function(req, res) {
        res.redirect('/app');
    }
);


// el Middleware para la autenticacion -> proporcionado por la libreria passport
passport.use(new LocalStrategy(
  function(username, password, done) {
      User.getUserByUsername(username, function(err, user) {
          if (err) {
              throw err;
          }
          if (! user) {
              return done(null, false, {message: "Unknown User"});
          }

          User.comparePassword(password, user.password, function (err, isMatch) {
              if (err) {
                  throw err;
              }
              if (isMatch) {
                  return done(null, user);
              } else {
                  return done(null, false, 'Invalid password');
              }
          });
      });
  }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
});

module.exports = router;
