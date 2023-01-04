var express = require("express");
var router  = express.Router();
var ForumPost = require("../models/forum");
var ForumComment = require("../models/comment");

// New comments
router.get("/forum/:id/comments/new", isLoggedIn, function(req, res){
    ForumPost.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {post: post});
        }
    });
});

// Creat comment
router.post("/forum/:id/comments", isLoggedIn, function(req, res){
    req.body.comment.text = req.sanitize(req.body.comment.text);
    // lookup forum post using ID
    ForumPost.findById(req.params.id, function(err, foundPost) {
        if(err){
            console.log(err);
            res.redirect("/forum");
        } else {
            ForumComment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "something went wrong");
                    console.log(err);
                } else{
                    // add username and ID to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    foundPost.comments.push(comment);
                    foundPost.save();
                    req.flash("success", "successfully added comment");
                    res.redirect("/forum/" + foundPost._id);
                }
            });
        }
    });
});

// Edit comments
router.get("/forum/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
    ForumComment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {post_id: req.params.id, comment: foundComment});
        }
    });
});

// Comment Update
router.put("/forum/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
   req.body.comment.text = req.sanitize(req.body.comment.text);
   ForumComment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if(err){
           req.flash("error", "unable to update comment");
           res.redirect("back");
       } else {
           req.flash("success", "successfully edited comment");
           res.redirect("/forum/" + req.params.id);
       }
   });
});


// Comment Destroy
router.delete("/forum/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
   ForumComment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
           req.flash("error", "unable to remove comment");
       } else {
           req.flash("error", "successfully removed comment");
           res.redirect("/forum/" + req.params.id);
       }
   });
});

// middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "you must be logged in to do that");
    res.redirect("/login");
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        ForumComment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "failed to find comment");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.username == "NikHowe"){
                    next();
                } else {
                    req.flash("error", "you don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "you must be logged in to do that");
        res.redirect("back");
    }
}

module.exports = router;