const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const Student = require('../models/student')
const Owner = require('../models/owner')

const { json_secret } = require('../config/keys')

const { sendMail } = require('../config/sendmail')

exports.studentSignUp = async (req, res, next) => {
    const errors = validationResult(req)
    console.log(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation failed')
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }
    
    const { firstname, lastname, email, password } = req.body
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        const student = new Student({ firstname, lastname, email, password: hashpassword })
        const newStudent = await student.save()
        res.status(201).json({message: `Successfully Signed up with email: ${newStudent.email}`})

    } catch (error) {
        if(!error.statusCode) error.statusCode = 500
        next(error)
    }
}

exports.ownerSignUp = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('validation failed')
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }
    
    const { firstname, lastname, address, email, password } = req.body
    try {
        const hashPassword = await bcrypt.hash(password, 12)
        const owner = new Owner({ firstname, lastname, address, email, password: hashPassword })
        const newOwner = await owner.save()
        res.status(201).json({message: `Successfully Signed up with email: ${newOwner.email}`})

    } catch (error) {
        if(!error.statusCode) err.statusCode = 500
        next(error)
    }
}

exports.studentLogin = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const oldStudent = await Student.findOne({ email })
        if(!oldStudent){
            const error = new Error("Email does not exist in database, Please sign up!")
            error.statusCode = 401
            throw error
        }

        const okPassword = await bcrypt.compare(password, oldStudent.password)
        if(!okPassword){
            const error = new Error("Incorrect password")
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign(
            {email: oldStudent.email, studentId: oldStudent._id.toString()},
            json_secret, {expiresIn: '.25h'}) // signed in for 15 mins
        res.status(200).json({token: token, studentId: oldStudent._id.toString()})

    } catch (error) {
        next(error)
    }
}

exports.ownerLogin = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const oldOwner = await Owner.findOne({ email })
        if(!oldOwner){
            const error = new Error("Email does not exist, please sign up!")
            error.statusCode = 401
            throw error
        }

        const okPassword = await bcrypt.compare(password, oldOwner.password)
        if(!okPassword){
            const error = new Error("Incorrect password")
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign(
            {email: oldOwner.email, ownerId: oldOwner._id.toString()},
            json_secret, {expiresIn: '.25h'})
        res.status(200).json({token: token, ownerId: oldOwner._id.toString()})
    } catch (error) {
        next(error)
    }
}

exports.studentReset = async (req, res, next) => {
   try {
        crypto.randomBytes(32, (err, buff) => {
            if(err){
                console.log(err)
                return res.redirect('/reseturl')
            }
            const token = buff.toString('hex')
            console.log(token)

            const student = await Student.findOne({ email: req.body.email})
            if(!student){
                const error = new Error("Email does not exist, please sign up!")
                error.statusCode = 404
                throw error
            }

            student.token = token
            student.tokenExp = Data.now() + 900000 // expires in 15 mins
            await student.save()

            sendMail(student.email, '/student/passwordForm', token)
        })
    } catch (error) {
        next(error)
    }
}

exports.studentChangePassword = async (req, res, next) => {
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
        const student = await Student.findOne({ token, tokenExp: {$gt: Data.now()} })
        if(!student){
            const error = new Error("Invalid token OR token already expired, note that token expiration date is 15 mins")
            error.statusCode = 403
            throw error
        }
        const hashPassword = await bcrypt.hash(password, 12)
        student.password = hashPassword
        student.token = undefined
        student.tokenExp = undefined
        const newStudent = await student.save()
        res.status(200).json({message: `Successfully reset password for user with id: ${newStudent._id}`})
        // redirect to login page

    } catch (error) {
        next(error)
    }
}