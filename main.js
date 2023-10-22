require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const route = require('./routes/routes')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const mongoStore = require('connect-mongo');




const app = express();

const PORT = process.env.PORT;
const db = process.env.DB_URI

mongoose.connect(db)
.then(() => console.log('MongoDB is connected..'))
.catch((err) => console.error('MongoDB is not connected...'))

//Middlewares

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json());

app.use(express.static("./public/uploads"))
app.use(expressLayouts)

app.use(session({
    secret: '@urface',
    saveUninitialized:true,
    resave:false,
    store: mongoStore.create({
        mongoUrl: "mongodb://127.0.0.1:27017/Data-blog",
        collectionName: "session",
    }),
    cookie: {
        maxAge: 86000000,
        httpOnly: true,
    }
}))
const userId = (req, res, next) => {
    if (req.session.userID) {
            res.redirect('/dashboard')
    
    } else {
        res.redirect('login')
    }
}

app.use((req,res,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
})

//ejs

app.set('view engine', 'ejs')
app.set('layout', './layout/main')
 
app.use('', route)


app.listen(PORT, () => {
    console.log(`Server is litsening at http://localhost:${PORT}`);
})
