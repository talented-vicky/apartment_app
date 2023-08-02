const express = require('express')
const router = express.Router()

const chatCtrl = require('../controllers/chat')

// router.get('/chat', chatCtrl.chatHome)
// remove this route, should be on frontend page
// should pass emails of users

router.get('/chatroom/:email', chatCtrl.Chatroom)


module.exports = router