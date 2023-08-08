const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const apartCtrl = require('../controllers/apartments')
const authMid = require('../middlewares/auth')


// APARTMENTS
router.get('/owner/apartments', apartCtrl.fetchApartments)

router.get('/owner/apartment/:apartId', authMid, apartCtrl.fetchApartment)

router.post('/owner/apartment', [
    body('name').not().isEmpty()
        .withMessage("Name cannot be blank"),
    body('description').not().isEmpty()
        .withMessage("Description cannot be empty"),
    body('rooms').isNumeric()
        .withMessage('rooms field must be numeric'),
    body('lowestPrice').isNumeric()
        .withMessage('price must be numeric'),
    body('highestPrice').isNumeric()
        .withMessage('price must be numeric'),
], apartCtrl.createApartment)

router.post('/owner/apartment/:apartId', [
    body('name').not().isEmpty()
        .withMessage("Name cannot be blank"),
    body('description').not().isEmpty()
        .withMessage("Description cannot be empty"),
        body('rooms').isNumeric()
        .withMessage('rooms field must be numeric'),
    body('lowestPrice').isNumeric()
        .withMessage('price must be numeric'),
    body('highestPrice').isNumeric()
        .withMessage('price must be numeric'),
], authMid, apartCtrl.updateApartment)

router.delete('/owner/apartment/:apartId', authMid, apartCtrl.deleteApartment)



// COMMENTS
router.get('/apartment/comments', apartCtrl.fetchComments)

router.get('/apartment/comment/:commentId', apartCtrl.fetchComment)

router.put('/apartment/comment/:apartId', [
    body('content').not().isEmpty()
        .withMessage("Comment cannot be blank")
], apartCtrl.addComment)

router.post('/apartment/comment/:commentId', [
    body('content').not().isEmpty()
        .withMessage("Comment cannnot be blank")
], apartCtrl.editComment)

router.delete('/apartment/comment/:commentId', apartCtrl.removeComment)



// LIKES
router.get('/comment/like/:commentId', apartCtrl.likeComment)

router.get('/comment/unilike:commentId', apartCtrl.unlikeComment)




module.exports = router