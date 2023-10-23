const express = require('express')
const router = express.Router()
const User = require('../models/user');
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const user = require('../models/user');
// const joi = require('joi')



// image uploader
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./public/uploads`)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})
const upload = multer({
    storage: storage,
}).single('Image')


//home
router.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' })
})

//session 
const userId = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/blogs')
    } else {
        res.redirect('login')
    }

    next();
}

//signup

router.get('/add', (req, res) => {
    res.render('signup', { title: 'Add Users' })
})

router.post('/add', upload, async (req, res) => {
    // const userSchema = joi.object(
    //     {
    //         name: joi.string()
    //             .alphanum()
    //             .min(3)
    //             .max(30)
    //             .required(),
    //         email: joi.string()
    //             .email({
    //                 minDomainSegments: 2,
    //                 tlds: { allow: ["com", "net"] }
    //             }),
    //         password: joi.string(),
    //         role: joi.string().valid('user', 'admin'),

    //     }
    // )
    try {
        // const dataCorrect = userSchema.validate(req.body)
        // if (dataCorrect.error.details) {
        //     return res.send('Please Try again !!');
        // }
        const { password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashPassword,
            Image: req.file.filename,
            role: req.body.role
        })
        await user.save();
        res.redirect('/login')
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})

//Signin 

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).send('User not found !!!')
    }
    console.log('log1')
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) {
        return res.status(400).send('Plese Try Again !!')

    }
    console.log('log2')
    req.session.user = {
        user: user._id,
        role: user.role,
        author: user._id
   };
    console.log('log3')
    res.redirect('/blogs');
    console.log('log4')
})


// logout
router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.redirect('/')
        }
        res.clearCookie('connect.sid');
        res.redirect('login');
    })

})
//get all user

router.get('/users', async (req, res) => {
    try {
        if (req.session.user) {
            if (req.session.user.role === 'admin') {
                const users = await User.find()
                res.render('userBlog', { title: 'Blog', users: users })
            } else {
                res.send('you do not have previleges !!')
            }
        } else {
            res.redirect('/login')
        }

    } catch (err) {
        res.json({ message: err.message })
    }
})

//edit usuer
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id
        const user = await User.findById(id)
        if (user == null) {
            res.redirect('/blogs')
        } else {
            res.render('editUsers', { title: "Edit User", user: user, })
        }
    } catch (error) {
        res.redirect('/')
    }
})
// //update user
router.post('/update/:id', upload, async (req, res) => {
    const id = req.body.id;
    let new_image = "";
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./public/uploads/" + req.body.old_image)
        } catch (err) {
            console.log(err)
        }
    } else {
        new_image = req.body.old_image
    }
    await User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        mage: req.body.image,
        image: new_image,
    })
    req.session.message = {
        type: 'succes',
        message: 'User updated successfylly'
    }
    res.redirect('/')

})

// Delete user
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id
        await User.findByIdAndRemove(id)
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!'
        }
        res.redirect('/')
    } catch (err) {
        console.log(err)
    }
})



// //post blog
router.get('/blog', (req, res) => {
    res.render('blog')
})

router.post('/blog', upload, async (req, res) => {
    try {
        const blog = new Blog({
            title: req.body.title,
            email: req.body.email,
            author: req.session.user.user,
            content: req.body.content,
            // comments:req.body.comments,
            Image: req.file.filename,
            references: req.body.references,
        })
        await blog.save()
        console.log('blog4')
        return res.redirect('/blog')
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }



})

// //profile blog
router.get('/profile/:id', async (req, res) => {

    try {
        const id = req.params.id
        console.log('id1')
        const blogs = await Blog.find({ author: id }).populate('author');
        // console.log(blogs)
        res.render('showBlog', { blogs: blogs })
        // res.json(blogs);
        console.log('id1')
    } catch (error) {
        res.status(500).send('An error occurred while retrieving the blogs.');
    }
});

// // show blogs
router.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().populate('comments')
        res.render('showBlog', { title: 'Blog', blogs: blogs ,_id:req.session.user.user})
    } catch (err) {
        res.json({ message: err.message })
    }
})


// //edit blog
router.get('/edit/:id/blog', async (req, res) => {
    try {
        const id = req.params.id
        const blogs = await Blog.findById(id)
        if (blogs == null) {
            res.redirect('/')
        } else {
            res.render('editBlogs', { title: "Edit blog", blogs: blogs, })
        }
    } catch (error) {
        res.redirect('/blogs')
    }
})

// //update blog
router.post('/update/:id/blog', upload, async (req, res) => {
    const id = req.body.id;

    try {
        await Blog.updateOne(id, {
            title: req.body.title,
            email: req.body.email,
            content: req.body.content,
            image: req.body.image,
            // image: new_image,
            references: req.body.references
        })

        req.session.message = {
            type: 'succes',
            message: 'User updated successfylly'
        }

        res.redirect('/blogs')

    } catch (err) {
        console.log(err)
    }

})

// // Delete blog
router.get('/delete/:id/blog', async (req, res) => {
    const { id } = req.params;

    try {
        await Blog.findByIdAndRemove(id);
        res.redirect('/blogs');
    } catch (error) {
        console.log(error);
        res.render('error');
    }
});

// //comment
router.get('/post/:id/comment', (req, res) => {
    res.render('comments')
})
router.post('/post/:id/comments', async (req, res) => {
    try {
        const id = req.params.id;

        const comment = new Comment({
            text: req.body.text,
            blog: id
        });

        await comment.save()
        // res.send('done')
        const blog = await Blog.findById(req.params.id);
        blog.comments.push(comment);
        // await Promise.all([blog.save(), comment.save()])
        blog.save()
        res.redirect('/blogs');
    } catch (error) {
        console.log('Error creating comment:', error);
        // res.redirect('/');
    }

})

module.exports = router;