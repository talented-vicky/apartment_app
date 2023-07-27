const stuff = require('../config/socket')

const socket = io()
// this is supposed to be a function call


const msg = document.getElementById('messages')
const form = document.getElementById('formholder')
const input = document.getElementById('inputfield')

form.addEventListener('submit', e => {
    e.preventDefault()
    const msg = input.value.trim()
    if(msg !== ''){
        socket.emit('chat message', msg)
        input.value = ''
    }
})

socket.on('chat message', msg => {
    const li = document.createElement('li')
    li.textContent = msg

})