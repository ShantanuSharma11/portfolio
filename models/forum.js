var mongoose = require("mongoose");

// SCHEMA SETUP
var forumPostSchema = new mongoose.Schema({
    title: String,
    text: String,
    image: String, 
    created: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ForumComment"
        }
    ]
});

module.exports = mongoose.model("ForumPost", forumPostSchema);
