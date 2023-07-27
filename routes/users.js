const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const userCtrl = require('../controllers/users')
const User = require('../models/user')


// USERS DETAILS
router.get('/users', userCtrl.getUsers)

router.get('/user/:userId', userCtrl.getUser)


// USERS SIGNUP & LOGIN
router.put('/user/signup', [
    body('email').isEmail().withMessage('Invalid email')
        .custom(async (notValid, { req }) => {
            const existingUser = await User.findOne({email: notValid})
            if(existingUser){
                return Promise.reject("A user with this email already exists")
            }
        }).normalizeEmail({
            gmail_remove_dots: false
        }),
    body('password').trim().isLength({min: 9})
        .withMessage("Password should be at least 9 characters"),
    body('firstname').trim().not().isEmpty()
        .withMessage("firstname cannnot be blank"),
    body('lastname').trim().not().isEmpty()
        .withMessage("lastname cannnot be blank"),
],
    userCtrl.userSignUp
)


router.post('/user/login', userCtrl.userLogin)

router.post('/user/reset-password', userCtrl.resetPassword)

router.get('/user/fetchtoken', userCtrl.fetchToken)

router.put('/user/reset-password/form', userCtrl.passwordform)



// GOOGLE LOGIN
router.get('/auth/google', userCtrl.gglConsentScreen)

router.get('/auth/google/callback', 
    userCtrl.gglCallback, userCtrl.jsnWebToken)

router.get('/auth/google/success', 
    userCtrl.jsnValidteToken, userCtrl.onSuccess)

router.get('/auth/google/failure', userCtrl.onFailure)


module.exports = router