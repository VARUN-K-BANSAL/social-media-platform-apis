const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    followings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    followers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    posts: [{
        post: {
            type: mongoose.Schema.Types.ObjectId
        }
    }]
},
{
    timestamps: true
})

userSchema.methods.generateAuthToken = async function() {
    try {
        const token = jwt.sign({_id: this._id}, SECRET_KEY)
        this.tokens = this.tokens.concat({token: token})
        await this.save()
        return token
    } catch (error) {
        console.log(error);
    }
}

const User = new mongoose.model('User', userSchema)

module.exports = User