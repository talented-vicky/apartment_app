const express = require('express')
const socket = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = socket(server)

const Chat = require('../models/chat')


// socket chat setup
const socketCon = () => {
    io.on("connection", async socket => {
        console.log(`User: ${socket.id} is now connected`)        
        
        // join group
        socket.on("joinRoom", room => {
            socket.join(room)
        })
        
        // typing
        socket.on("typing", async data => {
            socket.broadcast.emit("notifyTyping", {
                sender: data.sender,
                message: data.message
            })
        })
        // stops typing
        socket.on("stopTyping", async () => {
            socket.broadcast.emit("notifyStopTyping")
        })
        
        // New Chat messages
        socket.on("sendMessage", async msg => {
            console.log(`message: ${msg}`)
            const {sender, message } = msg

            // save message to database
            const chatMsg = new Chat({
                // message: message, 
                // sender: sender,
                message, sender, timestamp: new Date()
            })
            await chatMsg.save()
            
            // send message to everyone in port 5000 (chatroom)
            io.emit("receiveMessage", chatMsg)
        })

        // disconnecting user
        socket.on("disconnect", () => {
            console.log(`User: ${socket.id} disconnected`)
        })
    })
}

module.exports = { socketCon }