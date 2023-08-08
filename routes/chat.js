const express = require('express')
const router = express.Router()

const chatCtrl = require('../controllers/chat')

router.get('/chat', chatCtrl.Chatroom)


module.exports = router