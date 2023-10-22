const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    // author: String,
    timestamp: { type: Date, default: Date.now },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
     }
})

const Comment = mongoose.model('comment', commentSchema)

module.exports = Comment;