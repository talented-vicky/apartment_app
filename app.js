const express = require('express')
const bodyparser = require('body-parser')
const multer = require("multer")
const path = require('path')
const passport = require('passport')
const ckSession = require('cookie-session')
require('./config/googleAuth')

const userRoute = require('./routes/users')
const apartmentRoute = require('./routes/apartments')
const chatRoute = require('./routes/chat')

const { PORT } = require('./config/keys')
const { connectDB } = require('./config/db')
const { logger } = require('./config/logger')
const { fileStorage, filter } = require('./config/file')

const app = express()

app.use(ckSession({
    name: 'google-auth-session',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(bodyparser.json())
// helps server understand all client json data

app.use(multer({storage: fileStorage, fileFilter: filter}).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')))
// [0] all request going to /images can be served statically
// [1][0][1] dirname gives access to app.js which is in the same 
// directory as the images folder hence everything in it is 
// easily accessible

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// app.get('/', (req, res) => {
//     res.send("<button><a href='/auth/google'>Login with ggl</a></button>")
// })

app.use(userRoute)
app.use(apartmentRoute)
app.use(chatRoute)

// errors from the above middlewares (see all catch in controllers) 
// are sent to the middleware below (error middleware)

app.use((err, req, res, next) => {
    const status = err.statusCode || 500
    const msg = err.message; const data = err.data;
    res.status(status).json({message: msg, data: data})
})

connectDB()
app.listen(PORT, "0.0.0.0", () => logger.info(`Connection live on port: ${PORT}`))

// confirm frontend set headers to allow for json data
// frontend should have token and userId in the setstate upon
// user login

// headers: {
//     Authorization: 'Bearer ' + this.props.token
// }