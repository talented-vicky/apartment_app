console.log("inner javascript")
const socket = io()
// handle message submission

const chatform = document.querySelector('#chat-form')
const msg = document.querySelector('#message-input')
// const chatform = document.getElementById('chat-form')
// const msg = document.getElementById('message-input')

chatform.addEventListener('submit', e => {
    // e.preventDefault()

    // send message to server
    if(msg){
        console.log(msg)
        socket.emit('sendMessage', {
            sender: user,
            message: msg.value
        })
        // clear input field
        msg.value = ''
    }
})
// chatform.addEventListener('click', () => {

//     // send message to server
//     if(msg.value){
//         socket.emit('sendMessage', {
//             sender: user,
//             message: msg.value
//         })
//         // clear input field
//         msg.value = ''
//     }
// })

// display incoming chat message
socket.on('receiveMessage', msg => {
    const chatMsg = document.getElementById('chat-message')
    const msgElem = document.createElement('div')
    msgElem.innerText = `${msg.sender}: ${msg.message}`
    chatMsg.appendChild(msgElem)
})

// entering a room
socket.on('joinRoom', user)