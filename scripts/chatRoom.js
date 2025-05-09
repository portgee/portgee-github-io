const DEBUG = true

console.log('Connecting to WebSocket...')
const socket = new WebSocket('wss://portgee-chat-server.onrender.com')

let username = localStorage.getItem('chatUsername') || null
let pfp = localStorage.getItem('chatPfp') || null
let token = localStorage.getItem('chatToken') || null
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

if (DEBUG) console.log('Loaded from localStorage:', { username, pfp, token, isLoggedIn })

socket.addEventListener('open', () => {
  if (DEBUG) console.log('WebSocket connection opened.')
  if (isLoggedIn && username && token) {
    if (DEBUG) console.log('Sending auth...')
    socket.send(JSON.stringify({ type: 'auth', username, token }))
  } else {
    if (DEBUG) console.log('No saved login, proceeding as guest.')
  }
})

function requestUserDatabase() {
  if (window.isAdminUser) {
    socket.send(JSON.stringify({ type: 'getUserDatabase' }))
  }
}

socket.addEventListener('message', (event) => {
  if (DEBUG) console.log('Received message from server:', event.data)
  const data = JSON.parse(event.data)

  if (data.type === 'userDatabase') {
    if (window.isAdminUser) renderUserDatabase(data.users)
    return
  }

  if (data.type === 'chat') {
    addMessage(data)
  } else if (data.type === 'history') {
    if (DEBUG) console.log(`Loading ${data.messages.length} messages from history`)
    document.getElementById('chatMessages').innerHTML = ''
    data.messages.forEach(addMessage)
  } else if (data.type === 'authSuccess') {
    if (DEBUG) console.log('Auth success')
    username = data.username
    pfp = data.pfp || 'assets/defaultPfp.png'
    token = data.token
    window.isAdminUser = data.isAdmin
    isLoggedIn = true
    localStorage.setItem('chatUsername', username)
    localStorage.setItem('chatPfp', pfp)
    localStorage.setItem('chatToken', token)
    localStorage.setItem('isLoggedIn', 'true')
    document.getElementById('loginArea').style.display = 'none'
    document.getElementById('profileButton').style.display = 'block'
    showNotification(`Logged in as ${username}`, 'lightgreen', 3000)
  } else if (data.type === 'error') {
    if (data.message.includes('Authentication failed')) {
      if (DEBUG) console.warn('Guest detected.')
      isLoggedIn = false
      localStorage.setItem('isLoggedIn', 'false')
    } else {
      showNotification(data.message, 'red', 3000)
    }
  } else if (data.type === 'system') {
    addSystemMessage(data.message)
  } else if (data.type === 'typing') {
    showTyping(data.username)
  }
})

function renderUserDatabase(users) {
  let container = document.getElementById('adminUserDb')
  if (!container) {
    container = document.createElement('div')
    container.id = 'adminUserDb'
    container.style = 'margin-top: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border: 2px solid #615eff; border-radius: 8px; max-height: 300px; overflow-y: auto; font-family: monospace;'
    document.body.appendChild(container)
  }

  container.innerHTML = '<h3>User DB</h3>' + users.map(user => `
    <div>
      <strong>${escapeHtml(user.username)}</strong>
      <span style="color:gray"> [Admin: ${user.isAdmin}]</span>
      <br><small>Color: ${user.chatColor || 'None'}, PFP: ${user.pfp || 'default'}, Badges: ${user.badges || 'None'}</small>
    </div>
    <hr>
  `).join('')
}

socket.addEventListener('close', () => {
  if (DEBUG) console.warn('WebSocket connection closed.')
})

socket.addEventListener('error', (error) => {
  if (DEBUG) console.error('WebSocket error:', error)
})

function addMessage(data) {
  const chatMessages = document.getElementById('chatMessages')
  const messageElement = document.createElement('div')
  messageElement.className = 'chat-message'
  messageElement.style.paddingBottom = "10px"
  const img = document.createElement('img')
  img.src = data.pfp || 'assets/defaultPfp.png'
  img.alt = 'pfp'
  img.className = 'chat-pfp'
  const usernameSpan = document.createElement('strong')
  if (data.chatColor) {
    usernameSpan.style.color = data.chatColor
  }
  if (data.isAdmin) {
    const badgeImg = document.createElement('img')
    badgeImg.src = 'assets/adminBadge.png'
    badgeImg.alt = 'Admin'
    badgeImg.style.width = '16px'
    badgeImg.style.height = '16px'
    badgeImg.style.marginRight = '4px'
    badgeImg.style.verticalAlign = 'middle'
    usernameSpan.prepend(badgeImg)
  }
  usernameSpan.innerText += escapeHtml(data.username)

  usernameSpan.innerText = escapeHtml(data.username)
  const badgesSpan = document.createElement('span')
  if (data.badges) {
    const badgeList = data.badges.split(',').map(b => b.trim()).filter(b => b)
    badgeList.forEach(badge => {
      const badgeElement = document.createElement('span')
      badgeElement.textContent = ` [${badge}]`
      badgeElement.style.color = 'gold'
      badgeElement.style.fontSize = '0.8em'
      badgeElement.style.marginLeft = '3px'
      badgesSpan.appendChild(badgeElement)
    })
  }
  const messageContent = document.createElement('span')
  messageContent.innerHTML = `: ${escapeHtml(data.message)}`
  messageElement.appendChild(img)
  messageElement.appendChild(usernameSpan)
  messageElement.appendChild(badgesSpan)
  messageElement.appendChild(messageContent)
  if (isLoggedIn && window.isAdminUser) {
    const adminControls = document.createElement('span')
    adminControls.innerHTML = `
      <button onclick="banUser('${data.username}')">Ban</button>
      <button onclick="muteUser('${data.username}')">Mute</button>
      <button onclick="promoteUser('${data.username}')">Promote</button>
    `
    adminControls.style.marginLeft = '10px'
    messageElement.appendChild(adminControls)
  }
  chatMessages.appendChild(messageElement)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function addSystemMessage(message) {
  const chatMessages = document.getElementById('chatMessages')
  const systemElement = document.createElement('div')
  systemElement.className = 'chat-message'
  systemElement.innerHTML = `<em style="color: orange;">${escapeHtml(message)}</em>`
  chatMessages.appendChild(systemElement)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

document.getElementById('sendButton').addEventListener('click', () => {
  const input = document.getElementById('chatInput')
  const message = input.value.trim()
  if (!message) return
  let finalUsername = username
  if (!finalUsername) {
    finalUsername = prompt("Enter a username:").trim()
    if (!finalUsername || finalUsername.length < 3) {
      showNotification('Username must be at least 3 characters.', 'red', 3000)
      return
    }
    finalUsername = finalUsername.charAt(0).toUpperCase() + finalUsername.slice(1)
    username = finalUsername
    localStorage.setItem('guestUsername', finalUsername)
  }
  if (DEBUG) console.log('Sending chat message:', { username: finalUsername, message })
  socket.send(JSON.stringify({ type: 'chat', username: finalUsername, message }))
  input.value = ''
})

document.getElementById('chatInput').addEventListener('input', () => {
  socket.send(JSON.stringify({ type: 'typing', username }))
})

document.getElementById('loginButton').addEventListener('click', () => {
  const uInput = document.getElementById('usernameInput').value.trim()
  const pInput = document.getElementById('passwordInput').value.trim()
  const pfpInput = document.getElementById('pfpInput').value.trim()
  if (!uInput || !pInput) {
    showNotification('Username and password required', 'red', 3000)
    return
  }
  if (DEBUG) console.log('Sending login/register:', { username: uInput })
  socket.send(JSON.stringify({ type: 'registerOrLogin', username: uInput, password: pInput, pfp: pfpInput }))
})

document.getElementById('profileButton').addEventListener('click', openProfileMenu)

document.getElementById('saveProfileButton').addEventListener('click', () => {
  const newColor = document.getElementById('colorInput').value
  const newPfp = document.getElementById('pfpEditInput').value
  socket.send(JSON.stringify({ type: 'updateProfile', username, chatColor: newColor, pfp: newPfp }))
  showNotification('Profile updated', 'lightblue', 3000)
})

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return text.replace(/[&<>"']/g, m => map[m])
}

function showTyping(name) {
    const typingIndicator = document.getElementById('typingIndicator')
    typingIndicator.innerText = `${name} is typing...`
    typingIndicator.classList.add('show')
    clearTimeout(typingIndicator.timeout)
    typingIndicator.timeout = setTimeout(() => {
      typingIndicator.classList.remove('show')
      typingIndicator.innerText = ''
    }, 3000)
}

function openProfileMenu() {
  document.getElementById('profileMenu').style.display = 'flex'
}

function banUser(targetUsername) {
  if (confirm(`Ban ${targetUsername}?`)) {
    if (DEBUG) console.log('Sending ban for', targetUsername)
    socket.send(JSON.stringify({ type: 'banUser', targetUsername }))
  }
}

function muteUser(targetUsername) {
  if (confirm(`Mute ${targetUsername}?`)) {
    if (DEBUG) console.log('Sending mute for', targetUsername)
    socket.send(JSON.stringify({ type: 'muteUser', targetUsername }))
  }
}

function promoteUser(targetUsername) {
  if (confirm(`Promote ${targetUsername} to admin?`)) {
    if (DEBUG) console.log('Sending promote for', targetUsername)
    socket.send(JSON.stringify({ type: 'promoteUser', targetUsername }))
  }
}
