const express = require('express')
const router = express.Router()

const chatCtrl = require('../controllers/chat')

router.get('/chat', chatCtrl.getChat)

router.get('/user', chatCtrl.getUser)


module.exports = router