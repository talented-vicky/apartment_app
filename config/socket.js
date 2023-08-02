const express = require('express')
const socket = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = socket(server)

const Chat = require('../models/chat')


// chat event listener setup
const socketCon = () => {
    io.on("connection", async socket => {
        console.log(`User: ${socket.id} is now connected`)
        socket.on("disconnect", () => {
            console.log(`User: ${socket.id} disconnected`)
        })
    
        // typing
        socket.on("typing", async data => {
            socket.broadcast.emit("notifyTyping", {
                user: data.user,
                message: data.message
            })
        })
        // stops typing
        socket.on("stopTyping", async () => {
            socket.broadcast.emit("notifyStopTyping")
        })
    
        // chat messages
        socket.on("chatMessage", async msg => {
            console.log(`message: ${msg}`)
    
            // save message to database
            const chatMsg = new Chat({
                message: msg.text, 
                sender: msg.sender
            })
            await chatMsg.save()
            
            // send message to everyone in port 5000 (chatroom)
            io.emit("chatMessage", chatMsg)
        })
    })
}

module.exports = { socketCon }