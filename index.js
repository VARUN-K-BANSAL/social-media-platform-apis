require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const auth = require('./middlewares/auth')
require("./connections/db")

const User = require("./models/user")
const Post = require("./models/post")

app.use(cookieParser())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.post("/api/authenticate", async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        let user = await User.findOne({email})
        if(user != null && user != undefined && user.password == password) {
            const token = await user.generateAuthToken();
            await user.save()
            return res.status(200).send({token})
        }
        return res.status(200).send("Incorrect credentials provided")
    } catch (error) {
        res.status(200).send("Sorry for the inconvinience. Some error has occurred. Please try again after some time.")
    }
})

app.post('/api/follow/:id', auth, async (req, res) => {
    try {
        const uid = req.params.id
        const cuid = req.user._id
        let user = await User.findById(uid)
        let cuser = await User.findById(cuid)
        if(user) {
            let i = 0;
            let len = user.followers.length
            while(i < len) {
                if(String(user.followers[i]._id) == String(cuid)) {
                    return res.status(200).send({success: true})
                }
                i++
            }
            user.followers.push(String(cuid))
            cuser.followings.push(String(uid))
            await user.save()
            await cuser.save()
            return res.status(200).send({success: true})
        }
        return res.status(200).send({success: false})
    } catch (error) {
        res.status(200).send("Sorry for the inconvinience. Some error has occurred. Please try again after some time.")
    }
})

app.post('/api/unfollow/:id', auth, async (req, res) => {
    try {
        const uid = req.params.id
        const cuid = req.user._id

        let user = await User.findById(uid)
        let cuser = await User.findById(cuid)
        if(user) {
            user.followers = user.followers.filter((curr) => {
                return String(curr._id) != String(cuid)
            })
            cuser.followings = cuser.followings.filter((curr) => {
                return String(curr._id) != String(uid)
            })
            await user.save()
            await cuser.save()
            return res.status(200).send({success: true})
        }
        return res.status(200).send({success: false})
    } catch (error) {
        res.status(200).send("Sorry for the inconvinience. Some error has occurred. Please try again after some time.")
    }
})

app.get('/api/user', auth, async (req, res) => {
    try {
        let details = {
            email: req.user.email,
            no_of_followers: req.user.followers.length,
            no_of_followings: req.user.followings.length
        }
        return res.status(200).send(details)
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.post('/api/posts', auth, async (req, res) => {
    try {
        const title = req.body.title
        const description = req.body.description
        let post = new Post({
            title,
            description
        })
        await post.save()
        req.user.posts.push(post._id)
        await req.user.save()
        return res.status(200).send(post)
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.delete('/api/posts/:id', auth, async (req, res) => {
    try {
        let flag = false
        let i = 0
        let len = req.user.posts.length
        console.log(req.user);
        while(i < len) {
            if(String(req.user.posts[i]._id) == req.params.id) {
                flag = true
                break;
            }
            i++
        }
        if(flag) {
                await Post.deleteOne({_id: req.params.id})
            req.user.posts = req.user.posts.filter((curr) => {
                return String(curr._id) != String(req.params.id)
            })
            await req.user.save()
            return res.status(200).send({success: true})
        } else {
            return res.status(200).send({success: false})
        }
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.post('/api/like/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        if(post) {
            post.likes.push(req.user._id)
            await post.save()
            return res.status(200).send({success: true})
        }
        return res.status(200).send({success: false})
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.post('/api/unlike/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        if(post) {
            post.unlikes.push(req.user._id)
            await post.save()
            return res.status(200).send({success: true})
        }
        return res.status(200).send({success: false})
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.post('/api/comment/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        const comm = req.body.comment
        if(post) {
            post.comments.push({
                comment: comm,
                user: req.user._id
            })
            await post.save()
            return res.status(200).send({comment_id: post.comments[post.comments.length - 1]._id})
        }
        return res.status(200).send({success: false})
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.get('/api/posts/:id', async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        if(post) {
            let post_to_return = {
                post_id: post._id,
                title: post.title,
                description: post.description,
                likes: post.likes.length,
                unlikes: post.unlikes.length,
                comments: post.comments.length
            }
            return res.status(200).send(post_to_return)
        }
        return res.status(200).send({success: false})
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.get('/api/all_posts', auth, async (req, res) => {
    try {
        let posts = []
        let i = 0;
        let len = req.user.posts.length
        while(i < len) {
            let post = await Post.findById(req.user.posts[i]._id)
            if(post) {
                let post_to_return = {
                    post_id: post._id,
                    title: post.title,
                    description: post.description,
                    likes: post.likes.length,
                    unlikes: post.unlikes.length,
                    comments: post.comments.length
                }
                posts.push(post_to_return)
            }
            i++
        }
        return res.status(200).send(posts)
    } catch (error) {
        console.log(error);
        return res.status(200).send({success: false})
    }
})

app.get("/", (req, res) => {
    res.send("Testing the app")
})


app.listen(PORT, (req, res) => {
    console.log(`Server started at http://localhost:${PORT}`);
});
