const DEBUG = true

console.log('Connecting to WebSocket...')
const socket = new WebSocket('wss://portgee-chat-server.onrender.com')

let username = null
let pfp = null
let token = null
let isLoggedIn = false

const ADMIN_BADGE_SRC = 'assets/chatRoom/adminBadge.png'
const DEFAULT_PFP_SRC = 'assets/chatRoom/defaultPfp.png'

const userCache = new Map()

loadEmojiMap().then(map => {
  emojiMap = map
  if (DEBUG) console.log('Emoji map loaded', emojiMap)
}).catch(err => {
  if (DEBUG) console.error('Error loading emoji map', err)
})

socket.addEventListener('open', () => {
  if (DEBUG) console.log('WebSocket connection opened.')
  if (isLoggedIn && username && token) {
    if (DEBUG) console.log('Sending auth', { username, token })
    socket.send(JSON.stringify({ type: 'auth', username, token }))
  } else {
    if (DEBUG) console.log('No saved login, proceeding as guest')
  }
})

function requestUserDatabase() {
  if (window.isAdminUser) {
    if (DEBUG) console.log('Requesting user database')
    socket.send(JSON.stringify({ type: 'getUserDatabase' }))
  }
}

socket.addEventListener('message', (event) => {
  if (DEBUG) console.log('Received message from server:', event.data)
  let data
  try {
    data = JSON.parse(event.data)
  } catch (e) {
    if (DEBUG) console.error('JSON parse error', e)
    return
  }

  if (data.type === 'messageDeleted') {
    if (DEBUG) console.log('Deleting message with ID:', data.messageID)
    const msg = document.querySelector(`.chat-message[data-id="${data.messageID}"]`)
    if (msg) msg.remove()
    return
  }

  if (data.type === 'userDatabase') {
    if (DEBUG) console.log('User database received')
    if (window.isAdminUser) renderUserDatabase(data.users)
    return
  }

  if (data.type === 'chat') {
    if (DEBUG) console.log('Chat message received:', data)
    addMessage(data)
  } else if (data.type === 'history') {
    if (DEBUG) console.log(`Loading ${data.messages.length} messages from history`)
    document.getElementById('chatMessages').innerHTML = ''
    Object.entries(data.userCache).forEach(([name, info]) => {
      if (DEBUG) console.log('Caching user:', name, info)
      userCache.set(name.toLowerCase(), info)
    })
    data.messages.forEach(msg => addMessage(msg))
  } else if (data.type === 'authSuccess') {
    if (DEBUG) console.log('Auth success:', data)
    username = data.username
    pfp = data.pfp || DEFAULT_PFP_SRC
    token = data.token
    window.isAdminUser = data.isAdmin
    isLoggedIn = true
    document.getElementById('loginArea').style.display = 'none'
    document.getElementById('profileButton').style.display = 'block'
    showNotification(`Logged in as ${username}`, 'lightgreen', 3000)
  } else if (data.type === 'error') {
    if (DEBUG) console.warn('Server error:', data.message)
    if (data.message.includes('Authentication failed')) {
      isLoggedIn = false
      username = null
      pfp = null
      if (DEBUG) console.warn('Guest fallback mode activated')
    } else {
      showNotification(data.message, 'red', 3000)
    }
  } else if (data.type === 'system') {
    if (DEBUG) console.log('System message received:', data.message)
    addSystemMessage(data.message)
  } else if (data.type === 'typing') {
    if (DEBUG) console.log('Typing event:', data.username)
    showTyping(data.username)
  } else {
    if (DEBUG) console.warn('Unknown message type:', data)
  }
})

socket.addEventListener('close', () => {
  if (DEBUG) console.warn('WebSocket connection closed')
})

socket.addEventListener('error', (error) => {
  if (DEBUG) console.error('WebSocket error:', error)
  addSystemMessage("[ERROR] A WebSocket error occurred, please reload.", "red")
})

function renderUserDatabase(users) {
  if (DEBUG) console.log('Rendering user database')
  let container = document.getElementById('adminUserDb')
  if (!container) {
    container = document.createElement('div')
    container.id = 'adminUserDb'
    container.style = 'margin-top: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border: 2px solid #615eff; border-radius: 8px; overflow-y: scroll; font-family: monospace; z-index: 20;'
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

function addMessage(data) {
  if (DEBUG) console.log('Rendering message:', data)
  const chatMessages = document.getElementById('chatMessages')
  const messageElement = document.createElement('div')
  messageElement.className = 'chat-message'
  messageElement.style.paddingBottom = '10px'
  messageElement.dataset.id = data.id

  const userInfo = userCache.get(data.username.toLowerCase()) || {}
  if (DEBUG) console.log('User info for message:', userInfo)

  const img = document.createElement('img')
  img.src = userInfo.pfp || data.pfp || DEFAULT_PFP_SRC
  img.alt = 'pfp'
  img.className = 'chat-pfp'

  const usernameSpan = document.createElement('strong')
  const colorVal = userInfo.chatColor || ''
  if (colorVal.startsWith('gradient:')) {
    const gradientParts = colorVal.slice(9).split(';')
    const [colors, angle = '270', speed = '6', easing = 'ease', backgroundSize = '800% 800%'] = gradientParts
    usernameSpan.classList.add('animatedText')
    usernameSpan.dataset.colors = colors
    usernameSpan.dataset.angle = angle
    usernameSpan.dataset.speed = speed
    usernameSpan.dataset.easing = easing
    usernameSpan.dataset.backgroundSize = backgroundSize
    if (typeof applyMovingGradient === 'function') applyMovingGradient(usernameSpan)
  } else {
    usernameSpan.style.color = colorVal
  }

  usernameSpan.appendChild(document.createTextNode(data.username))

  if (userInfo.isAdmin) {
    const badgeImg = document.createElement('img')
    badgeImg.src = ADMIN_BADGE_SRC
    badgeImg.alt = 'Admin'
    badgeImg.style.width = '16px'
    badgeImg.style.height = '16px'
    badgeImg.style.marginLeft = '4px'
    badgeImg.style.verticalAlign = 'middle'
    usernameSpan.appendChild(badgeImg)
  }

  const badgesSpan = document.createElement('span')
  if (userInfo.badges) {
    const badgeList = userInfo.badges.split(',').map(b => b.trim()).filter(b => b)
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
  if (typeof replaceEmojisInElement === 'function' && emojiMap) {
    replaceEmojisInElement(messageContent, emojiMap)
  }

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
      <button onclick="deleteMessage('${data.id}')">Delete Message</button>
    `
    adminControls.style.marginLeft = '10px'
    messageElement.appendChild(adminControls)
  }

  chatMessages.appendChild(messageElement)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function addSystemMessage(message, color = "orange") {
  if (DEBUG) console.log('Adding system message:', message)
  const chatMessages = document.getElementById('chatMessages')
  const systemElement = document.createElement('div')
  systemElement.className = 'chat-message'
  systemElement.innerHTML = `<em style="color: ${color};">${escapeHtml(message)}</em>`
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

function deleteMessage(targetMessageID) {
  if (confirm(`Delete message with id ${targetMessageID}?`))
    if (DEBUG) console.log('Sending delete for', targetMessageID)
    socket.send(JSON.stringify({ type: 'deleteMessage', messageID: targetMessageID }))
}