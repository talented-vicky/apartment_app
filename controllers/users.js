const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

const Student = require('../models/student')
const Owner = require('../models/owner')

exports.studentSignUp = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const err = new Error('validation failed')
        err.statusCode = 422
        throw error
    }
    
    const { firstname, lastname, email, password } = req.body
    try {
        const encryptedPass = await bcrypt.hash(password, 12)
        const student = new Student(firstname, lastname, email, encryptedPass)
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
        const err = new Error('validation failed')
        err.statusCode = 422
        throw error
    }
    
    const { firstname, lastname, address, email, password } = req.body
    try {
        const encryptedPass = await bcrypt.hash(password, 12)
        const owner = new Owner(firstname, lastname, address, email, encryptedPass)
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

        const okPassword = bcrypt.compare(password, existingStudent.password)
        if(!okPassword){
            const error = new Error("Incorrect password")
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign(
            {email: oldStudent.email, studentId: oldStudent._id.toString()},
            json_secret, {expiresIn: '.5h'})
        res.status(200).json({token: token, studentId: oldStudent._id.toString()})

    } catch (error) {
        next(error)
    }
}

exports.ownerLogin = async (req, res, next) => {
    const { email, passowrd } = req.body

    try {
        const oldOwner = Owner.findOne({email})
        if(!oldOwner){
            // const error = new Error("Email does not exist, please sign up!")
            // error.statusCode = 401
            // throw error
            redirect('/owner/signup', error)
        }

        const okPassword = bcrypt.compare(passowrd, oldOwner.password)
        if(!okPassword){
            const error = new Error("Incorrect password")
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign(
            {email: oldOwner.email, ownerId: oldOwner._id.toString()},
            json_secret, {expiresIn: '.5h'})
        // res.status(200).json({token: token, ownerId: oldOwner._id.toString()})
        res.status(200).json({token: token, ownerId: token.ownerId})
    } catch (error) {
        
    }
}