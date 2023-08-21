const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const passport = require('passport')

const User = require('../models/user')

const { json_secret } = require('../config/keys')
const { funcSendMail } = require('../config/sendmail')


const userDetailsFunc = (userParam, errMsg) => {
    if(!userParam){
        const error = new Error(errMsg)
        error.statusCode = 401
        throw error
    }
}

// USER ACTION
exports.reportUser = async (req, res, next) => {
    const { userId } = req.params
    try {
        const user = await User.findById(userId)
        userDetailsFunc(user, "User Not Found")

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
        const users = await User.find()
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
        const user = await User.findById(req.params.userId)
        // const user = await User.findById("64c22a054fd269c27a6ef043")

        userDetailsFunc(user, "User Not Found")
        res.status(200).json({message: "Successfully Fetched User", data: user})
    } catch (error) {
        next(error)
    }
}




// USERS SIGNUP & LOGIN
exports.userSignUp = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }

    const { firstname, lastname, email, password, status, address } = req.body
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        const user = new User({ firstname, lastname, email, password: hashpassword, status, address })

        const newUser = await user.save()
        res.status(201).json({message: `Successfully Signed up with email: ${newUser.email}`})

    } catch (error) {
        if(!error.statusCode) error.statusCode = 500
        next(error)
    }
}

exports.userLogin = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const oldUser = await User.findOne({ email })
        userDetailsFunc(oldUser, "Email does not exist in database, Please sign up!")

        const okPassword = await bcrypt.compare(password, oldUser.password)
        userDetailsFunc(okPassword, "Incorrect Password")

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
    const { email } = req.body
    
    try {
        const user = await User.findOne({ email })
        if(!user){
            const error = new Error("Email does not exist, please sign up!")
            error.statusCode = 404
            throw error
        }
        
        const token = crypto.randomBytes(32).toString('hex')
        user.token = token
        user.tokenExp = Date.now() + 3600000 // expires in 1 hr
        await user.save()

        await funcSendMail(email, 'user/email-redirect', token)
        res.status(200).json({message: "Successfully sent email"})

    } catch (error) {
        next(error)
    }
}

exports.newPassword = async (req, res, next) => {
    const { password, confirmpass } = req.body

    if(password !== confirmpass){
        const error = new Error("Passwords do not match")
        error.statusCode = 401
        throw error
    }

    const user = await User.findById(req.userId)
    if(!user){
        const error = new Error("User Not Found")
        error.statusCode = 403
        throw error
    }

    const hashPassword = await bcrypt.hash(password, 12)
    user.password = hashPassword
    user.token = undefined
    user.tokenExp = undefined

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

// setting up display for callback when a user clicks link sent to his/her mail
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

exports.onSuccess = (req, res) => {
    console.log("You are now logged in")
    res.status(200).json({message: "Successfully signed in"})
}

exports.onFailure = (req, res) => {
    console.log("Login in Failed")
    res.status(500).json({message: "Error login in"})
}