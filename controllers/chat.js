const Chat = require('../models/chat')
const User = require('../models/user')


const noData = (data, errMsg) => {
    if(!data){
        const error = new Error(errMsg)
        error.statusCode = 402
        throw error
    }
}

// ahmed => 
// 64d767eec1b864b8d6032672
// ahmedlarry01@gmail.com

// Ajibola => 
// 64d74acca903ec8a107a9cb5
// harjeeborlar@gmail.com

exports.sendChat = async (req, res, next) => {
    const { receiverId } = req.params
    const { name, email, message } = req.body
    
    try {
        const receiver = await User.findById(receiverId)
        // const receiver = await User.findById("64d767eec1b864b8d6032672")
        noData(receiver, "Recipient Not Found")

        const sender = await User.findById(req.userId)
        // const sender = await User.findById("64d74acca903ec8a107a9cb5")
        noData(sender, "Oops, No Message for this user")

        const chat = new Chat({ name, email, message, senderId: req.userId, receiverId })
        // const chat = new Chat({ name, email, message, senderId: "64d74acca903ec8a107a9cb5", receiverId })
        await chat.save()

        receiver.messages.push(chat)
        sender.messages.push(chat)

        await receiver.save()
        await sender.save()

        res.status(200).json({
            message: "Successfully Sent Message",
            data: chat
        })

    } catch (error) {
        next(error)
    }
    
}

// a refresh button should be what triggers this
exports.loadSentChats = async (req, res, next) => {
    try {
        const chat = await Chat.find({ senderId: req.userId})
        // const chat = await Chat.find({ senderId: "64d767eec1b864b8d6032672"})
        noData(chat, "Unable to Load Chats")

        res.status(200).json({
            message: "Successfully Fetched Chats",
            data: chat
        })
    } catch (error) {
        next(error)
    }
}

exports.loadReceivedChats = async (req, res, next) => {
    try {
        const chat = await Chat.find({ receiverId: req.userId})
        // const chat = await Chat.find({ receiverId: "64d74acca903ec8a107a9cb5"})
        noData(chat, "Unable to Load Chats")
    
        res.status(200).json({
            message: "Successfully Fetched Chats",
            data: chat
        })
    } catch (error) {
        next(error)
    }
}

exports.loadChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            $or: [
                { receiverId: req.userId }, 
                { senderId: req.userId }
            ]
        })
        // const chats = await Chat.find({
        //     $or: [
        //         { receiverId: "64d74acca903ec8a107a9cb5" }, 
        //         { senderId: "64d74acca903ec8a107a9cb5" }
        //     ]
        // })
        noData(chats, "Unable to Load Chats")

        res.status(200).json({
            message: "Successfully Fetched Chats",
            data: chats
        })
    } catch (error) {
        next(error)
    }
}


