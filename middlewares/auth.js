require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const COOKIE_NAME = process.env.COOKIE_NAME

const auth = async (req, res, next) => {
    try {
        // let token = req.cookies[COOKIE_NAME]
        let authenticationHeader = req.header('Authorization')
        let heads = authenticationHeader.split(" ")
        let token = heads[1]
        console.log(token);
        if(token == undefined || token == null || token == "") {
            return res.status(200).send('Sorry! You are not authorized.')
        }
        // token = token.token;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findOne({_id: verifyUser._id})
        if(user == undefined || user == null) {
            return res.status(200).send('Sorry! You are not authorized.')
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(200).send('Sorry! You are not authorized.')
    }
}

module.exports = auth