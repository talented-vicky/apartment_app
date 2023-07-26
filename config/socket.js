const express = require('express')
const socket = require('socket.io')
const http = require('http')

const Chat = require('../models/chat')

const app = express()

const server = http.Server(app)
const io = socket(server, {cors: {origin: "*"}})

// chat event listener setup
const socketIO = () => {
    io.on("connection", async socket => {
        console.log(`User: ${socket.id} is now connected`)
        io.on("disconnect", () => {
            console.log(`User: ${socket.id} disconnected`)
        })
    
        // typing
        let ctUser;
        io.on("typing", async data => {
            io.broadcast.emit("notifyTyping", {
                user: data.user,
                message: data.message
            })
            ctUser = data.user
        })
        // stops typing
        io.on("stopTyping", async () => {
            io.broadcast.emit("notifyStopTyping")
        })
    
        io.on("chat message", async msg => {
            console.log(`message: ${msg}`)
    
            // send message to everyone in port 5000 except self
            io.broadcast.emit("received", { message: msg})
    
            // call database and afterwards
            connectDB()
            const chatMsg = new Chat({message: msg, sender: ctUser})
            await chatMsg.save()
        })
    })
}


module.exports = { socketIO }