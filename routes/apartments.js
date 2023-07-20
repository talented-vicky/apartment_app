const express = require('express')
const { body } = require('express-validator')

const router = express.Router()
const apartCtrl = require('../controllers/apartments')

const authMid = require('../middlewares/auth')

// APARTMENTS
router.get('/owner/apartments', apartCtrl.fetchApartments)

router.get('/owner/apartment/:apartId', apartCtrl.fetchApartment)

router.put('/owner/apartment', [
    body('name').not().isEmpty()
        .withMessage("Name cannot be blank"),
    body('description').not().isEmpty()
        .withMessage("Description cannot be empty")
], authMid, apartCtrl.createApartment)

router.post('/owner/apartment/:apartId', [
    body('name').not().isEmpty()
        .withMessage("Name cannot be blank"),
    body('description').not().isEmpty()
        .withMessage("Description cannot be empty")
], authMid, apartCtrl.updateApartment)

router.delete('/owner/apartment/:apartId', authMid, apartCtrl.deleteApartment)

// remove authentication middleware when testing with postman
// naaaaaah, add authorization in postman when testing

// COMMENTS
router.get('/apartment/comments', apartCtrl.fetchComments)

router.get('/apartment/comment/:commentId', apartCtrl.fetchComment)

router.put('/apartment/comment/:apartId', [
    body('content').not().isEmpty()
        .withMessage("Comment cannot be blank")
], apartCtrl.addComment)

router.post('/apartment/comment/:commentId', [
    body('content').not().isEmpty()
        .withMessage("Content cannnot be blank")
], apartCtrl.editComment)

router.delete('/apartment/comment/:commentId', apartCtrl.removeComment)