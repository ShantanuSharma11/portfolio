var express = require("express");
var router  = express.Router();
var ForumPost = require("../models/forum");
var ForumComment = require("../models/comment");

router.get("/forum", function(req, res){

    ForumPost.find({}, function(err, forumPosts){
        if(err){
            console.log(err);
        } else{
            res.render("forum/index", {forumPosts:forumPosts, currentUser: req.user});
        }
    });
    
});

router.post("/forum", isLoggedIn, function(req, res){
   req.body.text = req.sanitize(req.body.text);
   var title = req.body.title;
   var text = req.body.text;
   var image = req.body.image;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newForumPost = {title: title, text: text, image: image, author: author};
   ForumPost.create(newForumPost, function(err, newlyCreate){
       if(err){
           req.flash("error", "error creating post");
           console.log(err);
       } else{
            req.flash("success", "post successfully created");
            res.redirect("/forum");
       }
   });
});

// Create new post
router.get("/forum/new", isLoggedIn, function(req, res){
    res.render("forum/new");
});

// Shows entire post
router.get("/forum/:id", function(req, res){
    ForumPost.findById(req.params.id).populate("comments").exec(function(err, foundPost){
        if(err){
            console.log(err);
        }
        res.render("forum/show", {post: foundPost});
    });
});

// Edit posts
router.get("/forum/:id/edit", checkOwnership, function(req, res){
    ForumPost.findById(req.params.id, function(err, foundPost){
         res.render("forum/edit", {post: foundPost});
    });
});

// Update posts
router.put("/forum/:id", checkOwnership, function(req, res){
    req.body.post.text = req.sanitize(req.body.post.text)
    ForumPost.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
        if(err){
            req.flash("error", "failed to update post");
            res.redirect("/forum");
        } else{
            req.flash("success", "successfully updated post");
            res.redirect("/forum/" + req.params.id);         
        }
    });
});

// Delete posts
router.delete("/forum/:id", checkOwnership, function(req, res){
   ForumPost.findByIdAndRemove(req.params.id, function(err){
       if(err){
           req.flash("error", "post was not removed");
           res.redirect("/forum");
       } else{
           req.flash("success", "post successfully removed");
           res.redirect("/forum");
       }
   });
});

// middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you need to be logged in to do that");
    res.redirect("/login");
}

function checkOwnership(req, res, next){
    if(req.isAuthenticated()){
        ForumPost.findById(req.params.id, function(err, foundPost){
            if(err){
                req.flash("error", "post not found");
                res.redirect("back");
            } else {
                if(foundPost.author.id.equals(req.user._id) || req.user.username == "NikHowe"){
                    next();
                } else {
                    req.flash("error", "you don't have permission to do that");
                    res.redirect("back");
                }
                
            }
        });
    } else {
        req.flash("error", "you need to be logged in to do that");
        res.redirect("back");
    }
}

module.exports = router;