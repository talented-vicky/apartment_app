const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const passport = require('passport')

const User = require('../models/user')

const { json_secret } = require('../config/keys')
const { funcSendMail } = require('../config/sendmail')

// predefining a a functioni to check if an error occurs carrying out a 
// database operation
const userDetailsFunc = (userParam, errMsg) => {
    if(!userParam){
        const error = new Error(errMsg)
        error.statusCode = 401
        throw error
    }
}

// USER ACTION
exports.reportUser = async (req, res, next) => {
    // get a particular user id from frontend route
    const { userId } = req.params
    try {
        // check user model in database if any user id matches that from frontend
        const user = await User.findById(userId)
        // throw error if operation fails
        userDetailsFunc(user, "User Not Found")

        // if found, report this user and save to database, then send success message
        user.reported += 1  
        user.save()
        res.staus(200).json({ message: "Reported User" })

    } catch (error) {
        next(error)
    }
}

// USERS DETAILS
exports.getUsers = async (req, res, next) => {
    try {
        // check database for all users and return the value to the user
        const users = await User.find()
        // if not found, throw error, otherwise send success message
        userDetailsFunc(users, "Users Not Found")
        res.status(200).json({
            message: "Successfully Fetched Users", 
            data: users
        })
    } catch (error) {
        next(error)
    }

}

exports.getUser = async (req, res, next) => {
    try {
        // get userId url from frontend and check database if any 
        // user satisfies the criteria
        const user = await User.findById(req.params.userId)
        // const user = await User.findById("64c22a054fd269c27a6ef043")

        // check if not found and throw error, send success message if otherwise
        userDetailsFunc(user, "User Not Found")
        res.status(200).json({message: "Successfully Fetched User", data: user})
    } catch (error) {
        next(error)
    }
}




// USERS SIGNUP & LOGIN
exports.userSignUp = async (req, res, next) => {
    // check validation functions for every field user enters
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }

    // if no validation error, take all user field and store in database,
    // ensuring password is encrypted and stored in the database, in case the 
    // database is hacked
    const { firstname, lastname, email, password, status, address } = req.body
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        const user = new User({ firstname, lastname, email, password: hashpassword, status, address })

        // save if successful and send success message
        const newUser = await user.save()
        res.status(201).json({message: `Successfully Signed up with email: ${newUser.email}`})

    } catch (error) {
        if(!error.statusCode) error.statusCode = 500
        next(error)
    }
}

exports.userLogin = async (req, res, next) => {
    // get user email and password from frontend form
    const { email, password } = req.body

    try {
        // check if email already exists in database, throw error if not
        const oldUser = await User.findOne({ email })
        userDetailsFunc(oldUser, "Email does not exist in database, Please sign up!")

        // check if password matches email found in database, throw error if not
        const okPassword = await bcrypt.compare(password, oldUser.password)
        userDetailsFunc(okPassword, "Incorrect Password")

        // if both email and password match any user detail in database, store
        // this values and sign using json webtoken for further verification
        // upon access by users
        const token = jwt.sign(
            {email: oldUser.email, userId: oldUser._id.toString()},
            json_secret, {expiresIn: '.25h'}) // signed in for 15 mins
        res.status(200).json({token: token, userId: oldUser._id.toString()})

    } catch (error) {
        next(error)
    }
}



// PASSWORD RESET
exports.resetPassword = async (req, res, next) => {
    // fectch email of user from frontend
    const { email } = req.body
    
    try {
        // check database if this email exists, if not throw error
        const user = await User.findOne({ email })
        if(!user){
            const error = new Error("Email does not exist, please sign up!")
            error.statusCode = 404
            throw error
        }
        
        // reset token and expiry date if user exists
        const token = crypto.randomBytes(32).toString('hex')
        user.token = token
        user.tokenExp = Date.now() + 3600000 // expires in 1 hr
        await user.save()

        // call function to send mail to user that redirects to a new page
        await funcSendMail(email, 'user/email-redirect', token)
        res.status(200).json({message: "Successfully sent email"})

    } catch (error) {
        next(error)
    }
}

// exports.emailRedirect = async (req, res, next) => {    
//     const user = await User.findOne({ token: req.query.token, tokenExp: {$gt: Data.now()} })
//     if(!user){
//         const error = new Error("Invalid token OR token already expired, note that token expiration is 15 mins")
//         error.statusCode = 403
//         throw error
//     }
//     res.status(200).json({message: "Success"})
// }

exports.newPassword = async (req, res, next) => {
    const { password, confirmpass } = req.body
    // get new password with its confimation from the frontend, throw eeor if invalid

    if(password !== confirmpass){
        const error = new Error("Passwords do not match")
        error.statusCode = 401
        throw error
    }

    // find currently logged in user in database
    const user = await User.findById(req.userId)
    // const user = await User.findOne({ email })
    if(!user){
        const error = new Error("User Not Found")
        error.statusCode = 403
        throw error
    }

    // upon successful password completion, hash password and reset token and 
    // token expiration
    const hashPassword = await bcrypt.hash(password, 12)
    user.password = hashPassword
    user.token = undefined
    user.tokenExp = undefined

    // save to database and send success message
    const newUser = await user.save()
    res.status(200).json({ 
        message: `Successfully reset password for user: ${newUser.email}`
    })
}


// GOOGLE LOGIN
// diplay consentscreen using google api
exports.gglConsentScreen = passport.authenticate(
    'google', { scope: ['email', 'profile'] }
);

// setting up display for  callback when a user clicks link sent to his/her mail
exports.gglCallback = passport.authenticate(
    'google', { session: false, successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'});

// signing user login via google to use token for verification    
exports.jsnWebToken = (req, res) => {
    jwt.sign(
        {user: req.user}, json_secret, {expiresIn: '.25'},
        (err, token) => {
            if(err){
                return res.status(500).json({token: null})
            }
            res.status(200).json({token, userId: req.user})
        })
};

exports.jsnValidteToken = passport.authenticate(
    'jwt', { session: false});

// what happens upon success
exports.onSuccess = (req, res) => {
    console.log("You are now logged in")
    res.status(200).json({message: "Successfully signed in"})
}

// what goes on if google sign up fails
exports.onFailure = (req, res) => {
    console.log("Login in Failed")
    res.status(500).json({message: "Error login in"})
    // res.send("Error login in")
}