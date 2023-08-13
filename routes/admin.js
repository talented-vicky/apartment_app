const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const adminCtrl = require('../controllers/admin')
const Admin = require('../models/admin')
const authMid = require('../middlewares/auth')


// ADDRESSES
router.put('/admin/location', authMid, adminCtrl.addAddress)

router.get('/admin/locations', authMid, adminCtrl.getAddresses)

router.put('/admin/postcode', authMid, adminCtrl.addPostcode)

router.get('/admin/postcodes', authMid, adminCtrl.getPostcodes)


// only accessible by backender =>
// SIGN UP (ONLY ACCESSIBLE BY BACKENDER) AND LOG IN
router.put('/admin/signup', [
    body('email').isEmail().withMessage('Invalid email')
        .custom(async (notValid, { req }) => {
            const existingUser = await Admin.findOne({email: notValid})
            if(existingUser){
                return Promise.reject("A user with this email already exists")
            }
        }).normalizeEmail({
            gmail_remove_dots: false
        }),
    body('password').trim().isLength({min: 9}).withMessage("Password should be at least 9 characters"),
    body('fullname').not().isEmpty().withMessage("fullname cannnot be blank"),
],
    adminCtrl.adminSignUp
)

router.post('/admin/login', adminCtrl.adminLogin)



// OPERATIONS
router.put('/admin/user/:userId', authMid, adminCtrl.deactivateUser)

router.put('/admin/apartment/:apartId', authMid, adminCtrl.verifyApartment)

router.delete('/admin/user/:userId', authMid, adminCtrl.deleteUser)

module.exports = router

