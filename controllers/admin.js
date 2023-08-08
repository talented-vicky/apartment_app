const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const { json_secret } = require('../config/keys')

const User = require('../models/user')
const Apartment = require('../models/apartment')
const Admin = require('../models/admin')

const findData = (data, errMsg) => {
    if(!data){
        const error = new Error(errMsg)
        error.statusCode = 422
        throw error
    }    
}

// hardcode admin sign up 
// This should only be accessible by bakcend dev
exports.adminSignUp = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }
    
    const { fullname, email, password } = req.body
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        const admin = new Admin({ fullname, email, password: hashpassword })
        const newUser = await admin.save()
        res.status(201).json({message: `Successfully Signed Up Admin With Email: ${newUser.email}`})

    } catch (error) {
        if(!error.statusCode) error.statusCode = 500
        next(error)
    }
}


exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const myAdmin = await Admin.findOne({ email })
        findData(myAdmin, "Email does not match admin email!")

        const okPassword = await bcrypt.compare(password, myAdmin.password)
        findData(okPassword, "Incorrect Password")

        const token = jwt.sign(
            {email: myAdmin.email, adminId: myAdmin._id.toString()},
            json_secret, {expiresIn: '1h'}) // signed in for 1 hour
        res.status(200).json({token: token, adminId: myAdmin._id.toString()})

    } catch (error) {
        next(error)
    }
}


// let users see button showing how many times they've 
// been reported, if value is 1 show green, if 2 show
// orange, and if 3 show red

// ensure admin monitors this value and restrict user
// when value exceeds 3

exports.deactivateUser = async (req, res, next) => {
    const { userId } = req.params
    try {
        const user = await User.findById(userId)
        findData(user, "User Not Found")

        user.activated = false
        user.save()
        res.status(200).json({ message: "Successfully Deactivated User"})
    
    } catch (error) {
        next(error)
    }
}

exports.verifyApartment = async (req, res, next) => {
    const { apartId } = req.params
    try {
        const apartment = await Apartment.findById(apartId)
        findData(apartment, "Apartment Not Found")

        apartment.isVerified = true
        user.save()
        res.status(200).json({message: "User now verified"})

    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    const { userId } = req.params
    try {
        const user = await User.findById(userId)
        findData(user, "User Not Found")

        await User.findByIdAndRemove(userId)
        res.status(200).json({ 
            message: "Successfully Deleted User",
            data: user
        })
    } catch (error) {
        next(error)
    }
}