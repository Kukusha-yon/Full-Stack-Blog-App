const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        // required: true
    },
    email: {
        type:String,
        // required: true
    },
    phone: {
        type:String,
        // required: true

    },
    Image: {
        type: String,
        // required: true
    },
    password: {
        type:String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    blogPosts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Blog' }],

},
{
    timestamps: true
})
userSchema.virtual("blogs", {
    ref: "Blog",
    foreignField: "author",
    localField: "_id"
  });

module.exports = mongoose.model('User', userSchema)