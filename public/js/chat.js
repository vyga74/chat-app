const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector("#message-template").innerHTML
const linkTemplate = document.querySelector('#link-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true 
})

const autoscroll = () => {
       // New message element
       const $newMessage = $messages.lastElementChild

       // Height of the new message
       const newMessageStyles = getComputedStyle($newMessage)
       const newMessageMargin = parseInt(newMessageStyles.marginBottom)
       const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
   
       // Visible height
       const visibleHeight = $messages.offsetHeight
   
       // Height of messages container
       const containerHeight = $messages.scrollHeight
   
       // How far have I scrolled?
       const scrollOffset = $messages.scrollTop + visibleHeight
   
       if (containerHeight - newMessageHeight <= scrollOffset) {
           $messages.scrollTop = $messages.scrollHeight
       }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(linkTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')


    const message = e.target.elements.message.value

    // disable

    socket.emit('sendMessage', message, (err) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (err) {
            return console.log(err)
        }
        console.log('Zinute nusiusta')
    })
})

$locationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolokacija neimanoma del narsykles')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{

        const lokacija = {lat:position.coords.latitude, long: position.coords.longitude}

        socket.emit('sendLocation', lokacija, (pranes) => {
            if (pranes) {
                $locationButton.removeAttribute('disabled')
                console.log('Lokacija pateikta')
            }
        })

    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})