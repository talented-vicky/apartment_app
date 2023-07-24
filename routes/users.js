const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const userCtrl = require('../controllers/users')
const Student = require('../models/student')
const Owner = require('../models/owner')


// USERS DETAILS
router.get('/students', userCtrl.getStudents)

router.get('/student/:studentId', userCtrl.getStudent)

router.get('/owners', userCtrl.getOwners)

router.get('/owner/:ownerId', userCtrl.getOwner)


// USERS LOGIN & SIGNUP
router.put('/student/signup', [
    body('email').isEmail().withMessage('Invalid email')
        .custom(async (notValid, { req }) => {
            const existingUser = await Student.findOne({email: notValid})
            if(existingUser){
                return Promise.reject("A student with this email already exists")
            }
        }).normalizeEmail(),
    body('password').trim().isLength({min: 9})
        .withMessage("Password should be at least 9 characters"),
    body('firstname').trim().not().isEmpty()
        .withMessage("firstname cannnot be blank"),
    body('lastname').trim().not().isEmpty()
        .withMessage("lastname cannnot be blank"),
],
    userCtrl.studentSignUp
)

router.put('/owner/signup', [
    body('email').isEmail().withMessage('Invalid email')
        .custom(async (notValid, { req }) => {
            const existingUser = await Owner.findOne({email: notValid})
            if(existingUser){
                return Promise.reject("An owner with this email already exists")
            }
        }).normalizeEmail(),
    body('password').trim().isLength({min: 9})
        .withMessage("Password should be at least 9 characters"),
    body('address').trim().isLength({min: 12})
        .withMessage("Address should be at least 12 characters"),
    body('firstname').trim().not().isEmpty()
        .withMessage("firstname cannnot be blank"),
    body('lastname').trim().not().isEmpty()
        .withMessage("lastname cannnot be blank"),
],
    userCtrl.ownerSignUp
)

router.post('/login', userCtrl.userLogin)

router.post('/student/login', userCtrl.studentLogin)

router.post('/owner/login', userCtrl.ownerLogin)

router.post('/student/resetpassword', userCtrl.studentReset)

router.post('/student/changepassword', userCtrl.studentChangePassword)



// GOOGLE LOGIN
router.get('/auth/google', userCtrl.gglConsentScreen)

router.get('/auth/google/callback', 
    userCtrl.gglCallback, userCtrl.jsnWebToken)

router.get('/auth/google/success', 
    userCtrl.jsnValidteToken, userCtrl.onSuccess)

router.get('/auth/google/failure', userCtrl.onFailure)


module.exports = router