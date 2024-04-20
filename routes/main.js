module.exports = function(app, shopData) {

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId) {
            res.redirect('./login')
        }
        else {
            next ();
        }
    }
    //const request = require('request');
    //const bcrypt = require('bcryptjs');
    
    app.get('/', function(req, res){
        res.render('index.ejs', shopData)
    });
    app.get('/about', function(req, res) {
        res.render('about.ejs', shopData)
    });
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData)
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });  
}