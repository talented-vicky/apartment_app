const Chat = require('../models/chat')
const User = require('../models/user')

// predefining function to check when an undefined result is returned
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
    // get receiver id from frontend
    const { receiverId } = req.params

    // get all user input values from message container
    const { name, email, message } = req.body
    
    try {
        // check database for user with this id passed from frontend url
        const receiver = await User.findById(receiverId)
        // const receiver = await User.findById("64d767eec1b864b8d6032672")
        noData(receiver, "Recipient Not Found")

        // check all users id in database to see which matches currently logged in user
        const sender = await User.findById(req.userId)
        // const sender = await User.findById("64d74acca903ec8a107a9cb5")
        noData(sender, "Oops, No Message for this user")

        // save all input values of chat message to the database
        const chat = new Chat({ name, email, message, senderId: req.userId, receiverId })
        // const chat = new Chat({ name, email, message, senderId: "64d74acca903ec8a107a9cb5", receiverId })
        await chat.save()

        // push chat into both sender and receiver model in database
        receiver.messages.push(chat)
        sender.messages.push(chat)

        // save both to database and send success message if no error
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
        // load all chats sent by currently logged in user
        const chat = await Chat.find({ senderId: req.userId})
        // const chat = await Chat.find({ senderId: "64d767eec1b864b8d6032672"})
        noData(chat, "Unable to Load Chats")
        
        // send success message if no error
        res.status(200).json({
            message: "Successfully Fetched Chats",
            data: chat
        })
        // enter the error middleware if error occured
    } catch (error) {
        next(error)
    }
}

exports.loadReceivedChats = async (req, res, next) => {
    try {
        // load all chats received by currently logged in user
        const chat = await Chat.find({ receiverId: req.userId})
        // const chat = await Chat.find({ receiverId: "64d74acca903ec8a107a9cb5"})
        noData(chat, "Unable to Load Chats")
        
        // throw error if process fails, send success message if it passes
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
        // load chats sent or received by currently logged in user, this in turns
        // is equivalent to getting all chats by logged in user
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
        // throw error if process fails
        noData(chats, "Unable to Load Chats")

        // send success message upon completion
        res.status(200).json({
            message: "Successfully Fetched Chats",
            data: chats
        })
    } catch (error) {
        next(error)
    }
}


