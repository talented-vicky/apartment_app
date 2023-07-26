const Chat = require('../models/chat')
const { connectDB } = require('../config/db')

exports.getChat = async (req, res, next) => {
    res.setHeader("Content-Type", "application/json")
    res.statusCode = 200

    // now connect to database and AFTERWARDS
    connectDB()
    const chat = await Chat.find()
    res.status(200).json(chat)

}

exports.getUser = (req, res, next) => {
    username = localStorage.setItem("user", req.body.username)
}