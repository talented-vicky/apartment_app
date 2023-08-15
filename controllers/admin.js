const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const { json_secret } = require('../config/keys')

const User = require('../models/user')
const Apartment = require('../models/apartment')
const Admin = require('../models/admin')
const Address = require('../models/address')
const Postcode = require('../models/postcode')

const findData = (data, errMsg) => {
    if(!data){
        const error = new Error(errMsg)
        error.statusCode = 422
        throw error
    }    
}

// ADDRESSES
exports.addAddress = async (req, res, next) => {
    // fetch data from user in the frontend and save it in address model
    const { location } = req.body
    try {
        const address = new Address({ location })
        address.save()

        // send success message if successful
        res.status(200).json({
            message: "Successfully Added Location",
            data: address
        })
        // throw error if not successful
    } catch (error) {
        next(error)
    }
}

exports.getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find()
        findData(addresses, "No Location Found")

        res.status(200).json({
            message: "Successfully Fetched Locations",
            data: addresses
        })
        
    } catch (error) {
        next(error)
    }
}

exports.addPostcode = async (req, res, next) => {
    // fetch data from user in the frontend & save it in postcode model
    const { postcode } = req.body
    try {
        const pcode = new Postcode({ postcode })
        pcode.save()

        // send success message if successful
        res.status(200).json({
            message: "Successfully Added PostCode",
            data: pcode
        })
        // return error if not successful
    } catch (error) {
        next(error)
    }
}

exports.getPostcodes = async (req, res, next) => {
    // check database for all postcodes using the find() method
    try {
        const postcodes = await Postcode.find()
        // return error if request fails
        findData(postcodes, "No PostCode Found")
        
        // send success message if successful
        res.status(200).json({
            message: "Successfully Fetched PostCodes",
            data: postcodes
        })
    } catch (error) {
        next(error)
    }
}


// hardcode admin sign up 
// This should only be accessible by bakcend dev
exports.adminSignUp = async (req, res, next) => {
    // check for validation of input fields from user when sigining up
    // throw error if any input value fails validation
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 422
        error.data = errors.array()[0]
        throw error
    }
    
    // fetch all input values from the user
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
    // fetch all user input values from body of the website
    const { email, password } = req.body

    try {
        // check adming data ase if this email exists
        const myAdmin = await Admin.findOne({ email })
        // throw error if it's non-existent
        findData(myAdmin, "Email does not match admin email!")

        // compare password if of existing admin and new attempt  
        const okPassword = await bcrypt.compare(password, myAdmin.password)
        // return error if passwords don't match
        findData(okPassword, "Incorrect Password")

        // sign password with jwt for safe usage
        const token = jwt.sign(
            {email: myAdmin.email, adminId: myAdmin._id.toString()},
            json_secret, {expiresIn: '1h'}) // signed in for 1 hour
        res.status(200).json({token: token, adminId: myAdmin._id.toString()})

        // throw error if any
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
    // fetch userid from params in frontend url
    const { userId } = req.params
    try {
        // check user database for existence of user with this id
        const user = await User.findById(userId)
        // throw error if non
        findData(user, "User Not Found")

        // deactivate user and update user model in the database
        user.activated = false
        user.save()
        // send success message upon deactivation completion 
        res.status(200).json({ message: "Successfully Deactivated User"})
    
    } catch (error) {
        next(error)
    }
}

exports.verifyApartment = async (req, res, next) => {
    const { apartId } = req.params
    try {
        const apartment = await Apartment.findById(apartId)
        // const apartment = await Apartment.findById("64d6c91d78f68b064e1d9599")
        findData(apartment, "Apartment Not Found")

        apartment.isVerified = true
        apartment.save()
        res.status(200).json({message: "User now verified"})

    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async (req, res, next) => {
    // check url link with userId
    const { userId } = req.params
    try {
        // find user with the fetched id and throw error if process fails
        const user = await User.findById(userId)
        findData(user, "User Not Found")

        // if user is found, delete user from database
        await User.findByIdAndRemove(userId)
        // send success message upon completion
        res.status(200).json({ 
            message: "Successfully Deleted User",
            data: user
        })
    } catch (error) {
        next(error)
    }
}