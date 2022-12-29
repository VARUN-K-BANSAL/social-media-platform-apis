const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    unlikes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    comments: [{
        comment: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId
        }
    }]
},
{
    timestamps: true
})

const Post = new mongoose.model('Post', postSchema)

module.exports = Post