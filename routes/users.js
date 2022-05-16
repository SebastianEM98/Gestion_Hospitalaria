const express = require('express');
const router = express.Router();
const passport = require ('passport');
const LocalStrategy = require ('passport-local').Strategy;
const User = require('./../server/models/user.js');
var expressValidator = require('express-validator');
router.use(expressValidator()); 

/*
    POST /app/adduser ->  agrega un nuevo usuario al sistema
*/
router.post('/app/adduser', (req, res) => {
	var username = req.body.username;
	var password = req.body.password;

    // validacioncde los datos
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();
    if(errors) {
        res.status(400).redirect('systemsettings');
    } else {

        var newUser = new User({
            username,
            password
        });

        User.createUser(newUser, function(err, user) {
            if (err) {
				console.log(err);
                return ;
            }
        });

        req.flash('success_msg', 'User succesfully created');
        res.status(200).redirect('/app/systemsettings');
    }
});

/*
	GET /app/logout -> funcion para cerrar sesion
*/
router.get('/app/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out');

    res.status(200).redirect('/');
});

module.exports = router;
