console.log("first external")
const socket = io()

const messages = document.getElementById('messages')
const formholder = document.getElementById('formholder')
const messageInput = document.getElementById('message-input')

console.log("here now")
formholder.addEventListener('submit', e => {
    e.preventDefault()
    const msg = messageInput.value.trim()
    if(msg !== ''){
        socket.emit('chat message', msg)
        messageInput.value = ''
    }
})

socket.on('chatMessage', msg => {
    const li = document.createElement('li')
    li.textContent = msg
    messages.append(li)
})