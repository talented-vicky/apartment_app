const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const passport = require('passport')

const User = require('../models/user')

const { json_secret } = require('../config/keys')
const { funcSendMail } = require('../config/sendmail')

const validationFunc = (request) => {
    const errors = validationResult(request)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }
}

const userDetailsFunc = (userParam, errMsg) => {
    if(!userParam){
        const error = new Error(errMsg)
        error.statusCode = 401
        throw error
    }
}

// USERS DETAILS
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find()
        userDetailsFunc(users, "Users Not Found")
        res.status(200).json({message: "Successfully Fetched Users", data: users})
    } catch (error) {
        next(error)
    }

}

exports.getUser = async (req, res, next) => {
    try {
        // const user = await User.findById(req.params.userId)
        const user = await User.findById("64bee4a8a59769b0633fd6c4")
        userDetailsFunc(user, "User Not Found")
        res.status(200).json({message: "Successfully Fetched User", data: user})
    } catch (error) {
        next(error)
    }
}




// USERS SIGNUP & LOGIN
exports.userSignUp = async (req, res, next) => {
    validationFunc(req)
    
    const { firstname, lastname, email, password, status } = req.body
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        const user = new User({ firstname, lastname, email, password: hashpassword, status })
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


exports.userReset = async (req, res, next) => {
    let token;
    crypto.randomBytes(32, (err, buff) => {
        if(err){
            const error = new Error("Problem generating encryption")
            error.statusCode = 404
            throw error
        }
        token = buff.toString('hex')
    })
    
    try {
        const user = await User.findOne({ email: req.body.email})
        if(!user){
            const error = new Error("Email does not exist, please sign up!")
            error.statusCode = 404
            throw error
        }

        user.token = token
        user.tokenExp = Date.now() + 900000 // expires in 15 mins
        await user.save()
        
        const data = await funcSendMail(user.email, '/user/passwordForm', token)
        // data has been undefined all these while
        console.log(data)
        if(!data){
            const error = new Email("Error sending email")
            error.statusCode = 402
            throw error
        }
        res.status(200).json({message: "Successfully sent email", result: data})

    } catch (error) {
        next(error)
    }
}

exports.userChangePassword = async (req, res, next) => {
    const { token, password, passwordConfirm } = req.body
    // inform frontend to add a hidden input field that fetches
    // the token from the url that brought the user to the 
    // password form page

    if(password !== passwordConfirm){
        const error = new Error("Passwords do not match")
        error.statusCode = 401
        throw error
    }

    try {
        const user = await User.findOne({ token, tokenExp: {$gt: Data.now()} })
        if(!user){
            const error = new Error("Invalid token OR token already expired, note that token expiration date is 15 mins")
            error.statusCode = 403
            throw error
        }
        const hashPassword = await bcrypt.hash(password, 12)
        user.password = hashPassword
        user.token = undefined
        user.tokenExp = undefined
        const newUser = await user.save()
        res.status(200).json({message: `Successfully reset password for user with id: ${newUser._id}`})

    } catch (error) {
        next(error)
    }
}



// GOOGLE LOGIN
exports.gglConsentScreen = passport.authenticate(
    'google', { scope: ['email', 'profile'] }
);

exports.gglCallback = passport.authenticate(
    'google', { session: false, successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'});

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
    // res.send("Error login in")
}