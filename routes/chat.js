const express = require('express')
const router = express.Router()

const chatCtrl = require('../controllers/chat')
const authMid = require('../middlewares/auth')

router.put('/chat/:receiverId', chatCtrl.sendChat)

router.get('/chats/sent', chatCtrl.loadSentChats)

router.get('/chats/received', chatCtrl.loadReceivedChats)

router.get('/chats', chatCtrl.loadChats)



module.exports = router