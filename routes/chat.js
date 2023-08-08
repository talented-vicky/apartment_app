const express = require('express')
const router = express.Router()

const chatCtrl = require('../controllers/chat')
const authMid = require('../middlewares/auth')

router.put('/chat/:receiverId', authMid, chatCtrl.sendChat)

router.get('/chats', authMid, chatCtrl.loadChats)


module.exports = router