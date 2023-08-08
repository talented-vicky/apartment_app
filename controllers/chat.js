const Chat = require('../models/chat')
const User = require('../models/user')


const noData = (data, errMsg) => {
    if(!data){
        const error = new Error(errMsg)
        error.statusCode = 402
        throw error
    }
}

exports.sendChat = async (req, res, next) => {
    const { receiverId } = req.params
    const { name, email, message } = req.body
    
    try {
        const receiver = await User.findById(receiverId)
        noData(receiver, "Recipient Not Found")

        const chat = new Chat({ name, email, message, senderId: req.userId, receiverId })
        await chat.save()

        receiver.messages.push(chat)
        await receiver.save()

        res.status(200).json({
            message: "Successfully Sent Message",
            data: chat
        })

    } catch (error) {
        next(error)
    }
    
}

// a refresh button should be what triggers this
exports.loadChats = async (req, res, next) => {
    try {
        const chat = await Chat.find({ senderId: req.userId})
        noData(chat, "Unable to Load Chats")

        res.status(200).json({
            message: "Successfully Fetched Chats",
            data: chat
        })
    } catch (error) {
        next(error)
    }
}