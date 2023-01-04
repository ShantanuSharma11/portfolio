var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req, res){
    res.render("landing");
});

// about me page
router.get("/about", function(req, res){
    res.render("about");
});


    
// memory game route
router.get("/memory-game", function(req, res){
    res.render("games/memory-game");
});

// AUTH ROUTES

// show register form
router.get("/register", function(req, res) {
    res.render("user/register");
});

// handle sign up 
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("user/register");
        }
        
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "successfully signed up, welcome " + user.username + "!");
            res.redirect("/");
        })
        
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("user/login");
})

// handle log in
router.post("/login", passport.authenticate("local", 
    {
        successReturnToOrRedirect: "/forum", 
        failureRedirect: "/login",
        badRequestMessage : "Incorrect username or password.",
        failureFlash: true
    }));
    
    
// log out
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "successfullly logged out");
    res.redirect("/");
});

// middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you must be logged in to do that");
    res.redirect("/login");
}



module.exports = router;