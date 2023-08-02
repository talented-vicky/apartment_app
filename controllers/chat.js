const fs = require('fs')
const { parse, HTMLElement } = require('node-html-parser')

const Chat = require('../models/chat')

exports.Chatroom = async (req, res, next) => {
    var { email } = req.params
    email = email?.split("@")[0]
    console.log(email)
    // document.getElementById('usernameid').innerText = email;
    
    const chatHistory = await Chat.find().sort({ timestamp: 1 })
    
    fs.readFile('views/chatroom.html', 'utf8', (err, data) => {
        if(err){
            console.log(err)
            return res.status(500).send("Error Reading File")
        }

        // parsing already existing html page
        const root = parse(data)
        const chatMsg = root.querySelector('#chat-message')

        // const userId = root.querySelector('#user-id')
        // const userName = root.querySelector('#user-name')
        // const userMsg = root.querySelector('#user-message')
        
        chatHistory.forEach(msg => {
            console.log(msg)
            const newItem = new HTMLElement('div')
            newItem.set_content(msg.sender)
            chatMsg.appendChild(newItem)
        })

        res.send(root.toString())

    })
    
    // var colorsRand = colors[Math.floor(Math.random() * colors.length)]
    // document.getElementById("user-id").style.color = colorsRand
    // const userId = parse(`<div class="user-id"> ${msg._id}</div>`)
    
    // const finalstuff = root.toString()
    // res.render('chatroom', { pullValue: finalstuff})



    // var colors = ['#d8cd30', '#ff0000', '#00ff00', '#0000ff', '#d83076']
    // if(chatHistory.length > 0){
    //     chatHistory.forEach( msg => {
    //         var msgContainer = document.createElement('div')
    //         msgContainer.className = "message-container"
            
    //         msgContainer.appendChild(userMsg)

    //         // do this last
    //         chatMessage.appendChild(msgContainer)
    //     })
    // } else {
    //     // render an empty stuff
    //     const emptyChat = document.createElement('h3').innerText = "No chat yet"
    //     chatMessage.appendChild(emptyChat)
    // }
}