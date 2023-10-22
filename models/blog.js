const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        // required:true
    },
    content: {
        type: String,
        // required: true,
    },
    Image: {
        type: String,
        data: Buffer,
    },
    references: {
        type: String,
        // required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
},
    {
        timestamps: true,
    });
// blogSchema.virtual("comment", {
//     ref: "Comment",
//     foreignField: "comments",
//     localField: "_id"
// });

const Blog = mongoose.model('blogs', blogSchema)
module.exports = Blog;