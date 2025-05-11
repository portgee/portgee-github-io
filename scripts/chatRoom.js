const DEBUG = true
const socket = new WebSocket('wss://portgee-chat-server.onrender.com')
const ADMIN_BADGE_SRC = 'assets/chatRoom/adminBadge.webp'
const DEFAULT_PFP_SRC = 'assets/chatRoom/defaultPfp.webp'
const userCache = new Map()
const MAX_CHAT_MESSAGES = 200

let username = null
let pfp = null
let token = null
let isLoggedIn = false

loadEmojiMap().then(map => {
  emojiMap = map
  if (DEBUG) console.log('Emoji map loaded')
})

socket.addEventListener('open', () => {
  if (DEBUG) console.log('WebSocket connected')
  if (isLoggedIn && username && token) {
    socket.send(JSON.stringify({ type: 'auth', username, token }))
  }
})

function applyMarkup(text) {
  text = escapeHtml(text)
  text = text.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`)
  text = text.replace(/\n&gt; (.*)/g, '<blockquote>$1</blockquote>')
  text = text.replace(/(?:^|\n)(#{1,6}) (.*)/g, (_, h, content) => `<h${h.length}>${content}</h${h.length}>`)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>')
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.*?)_/g, '<em>$1</em>')
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>')
  text = text.replace(/`(.*?)`/g, '<code>$1</code>')
  text = text.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  text = text.replace(/(?:^|\n)[*\-+] (.*)/g, '<ul><li>$1</li></ul>').replace(/<\/ul>\n<ul>/g, '')
  return text.replace(/\n/g, '<br>')
}

function requestUserDatabase() {
  if (window.isAdminUser) {
    socket.send(JSON.stringify({ type: 'getUserDatabase' }))
  }
}

socket.addEventListener('message', (event) => {
  let data
  try {
    data = JSON.parse(event.data)
  } catch (e) {
    if (DEBUG) console.error('Invalid JSON', e)
    return
  }

  switch (data.type) {
    case 'messageDeleted':
      document.querySelector(`.chat-message[data-id="${data.messageID}"]`)?.remove()
      break
    case 'userDatabase':
      if (window.isAdminUser) renderUserDatabase(data.users)
      break
    case 'chat':
      addMessage(data)
      break
    case 'history':
      userCache.clear()
      for (const [name, info] of Object.entries(data.userCache)) {
        userCache.set(name.toLowerCase(), info)
      }
      const container = document.getElementById('chatMessages')
      container.innerHTML = ''
      data.messages.forEach(msg => addMessage(msg))
      break
    case 'authSuccess':
      username = data.username
      pfp = data.pfp || DEFAULT_PFP_SRC
      token = data.token
      window.isAdminUser = data.isAdmin
      isLoggedIn = true
      document.getElementById('loginArea').style.display = 'none'
      document.getElementById('profileButton').style.display = 'block'
      showNotification(`Logged in as ${username}`, 'lightgreen', 3000)
      break
    case 'error':
      if (data.message.includes('Authentication failed')) {
        isLoggedIn = false
        username = null
        pfp = null
      }
      showNotification(data.message, 'red', 3000)
      break
    case 'system':
      addSystemMessage(data.message)
      break
    case 'typing':
      showTyping(data.username)
      break
    default:
      if (DEBUG) console.warn('Unknown message type:', data)
  }
})

socket.addEventListener('close', () => {
  if (DEBUG) console.warn('WebSocket closed')
})

socket.addEventListener('error', (err) => {
  if (DEBUG) console.error('WebSocket error:', err)
  addSystemMessage("[ERROR] WebSocket error, reload required.", "red")
})

function addMessage(data) {
  const chatMessages = document.getElementById('chatMessages')
  if (!chatMessages) return

  if (chatMessages.children.length >= MAX_CHAT_MESSAGES) {
    chatMessages.removeChild(chatMessages.firstChild)
  }

  const messageElement = document.createElement('div')
  messageElement.className = 'chat-message'
  messageElement.dataset.id = data.id
  messageElement.style.paddingBottom = '10px'

  const userInfo = userCache.get(data.username.toLowerCase()) || {}

  const img = document.createElement('img')
  img.src = userInfo.pfp || data.pfp || DEFAULT_PFP_SRC
  img.alt = 'pfp'
  img.className = 'chat-pfp'

  const usernameSpan = document.createElement('strong')
  const color = userInfo.chatColor || ''
  if (color.startsWith('gradient:')) {
    const [colors, angle = '270', speed = '6', easing = 'ease', size = '800% 800%'] = color.slice(9).split(';')
    usernameSpan.classList.add('animatedText')
    Object.assign(usernameSpan.dataset, { colors, angle, speed, easing, backgroundSize: size })
    window.applyMovingGradient?.(usernameSpan)
  } else {
    usernameSpan.style.color = color
  }
  usernameSpan.textContent = data.username

  if (userInfo.isAdmin) {
    const badge = document.createElement('img')
    Object.assign(badge, {
      src: ADMIN_BADGE_SRC,
      alt: 'Admin',
      style: 'width:16px;height:16px;margin-left:4px;vertical-align:middle;'
    })
    usernameSpan.appendChild(badge)
  }

  const badgesSpan = document.createElement('span')
  if (userInfo.badges) {
    userInfo.badges.split(',').forEach(b => {
      const tag = document.createElement('span')
      tag.textContent = ` [${b.trim()}]`
      Object.assign(tag.style, { color: 'gold', fontSize: '0.8em', marginLeft: '3px' })
      badgesSpan.appendChild(tag)
    })
  }

  const messageContent = document.createElement('span')
  messageContent.innerHTML = `: ${applyMarkup(data.message)}`
  if (emojiMap && typeof replaceEmojisInElement === 'function') {
    replaceEmojisInElement(messageContent, emojiMap)
  }

  messageElement.append(img, usernameSpan, badgesSpan, messageContent)

  if (isLoggedIn && window.isAdminUser) {
    const controls = document.createElement('span')
    controls.style.marginLeft = '10px'
    controls.innerHTML = `
      <button onclick="banUser('${data.username}')">Ban</button>
      <button onclick="muteUser('${data.username}')">Mute</button>
      <button onclick="promoteUser('${data.username}')">Promote</button>
      <button onclick="deleteMessage('${data.id}')">Delete</button>
    `
    messageElement.appendChild(controls)
  }

  chatMessages.appendChild(messageElement)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function addSystemMessage(msg, color = 'orange') {
  const el = document.createElement('div')
  el.className = 'chat-message'
  el.innerHTML = `<em style="color:${color};">${escapeHtml(msg)}</em>`
  const chatMessages = document.getElementById('chatMessages')
  chatMessages.appendChild(el)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

document.getElementById('sendButton').addEventListener('click', () => {
  const input = document.getElementById('chatInput')
  const message = input.value.trim()
  if (!message) return
  if (!username) {
    let name = prompt('Enter a username:').trim()
    if (!name || name.length < 3) return showNotification('Username must be at least 3 characters.', 'red', 3000)
    name = name.charAt(0).toUpperCase() + name.slice(1)
    username = name
  }
  socket.send(JSON.stringify({ type: 'chat', username, message }))
  input.value = ''
})

document.getElementById('chatInput').addEventListener('input', () => {
  if (username) socket.send(JSON.stringify({ type: 'typing', username }))
})

document.getElementById('loginButton').addEventListener('click', () => {
  const u = document.getElementById('usernameInput').value.trim()
  const p = document.getElementById('passwordInput').value.trim()
  const pic = document.getElementById('pfpInput').value.trim()
  if (!u || !p) return showNotification('Username and password required', 'red', 3000)
  socket.send(JSON.stringify({ type: 'registerOrLogin', username: u, password: p, pfp: pic }))
})

document.getElementById('profileButton').addEventListener('click', () => {
  document.getElementById('profileMenu').style.display = 'flex'
})

document.getElementById('saveProfileButton').addEventListener('click', () => {
  const c = document.getElementById('colorInput').value
  const p = document.getElementById('pfpEditInput').value
  socket.send(JSON.stringify({ type: 'updateProfile', username, chatColor: c, pfp: p }))
  showNotification('Profile updated', 'lightblue', 3000)
})

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return str.replace(/[&<>"']/g, m => map[m])
}

function showTyping(name) {
  const el = document.getElementById('typingIndicator')
  el.innerText = `${name} is typing...`
  el.classList.add('show')
  clearTimeout(el.timeout)
  el.timeout = setTimeout(() => {
    el.classList.remove('show')
    el.innerText = ''
  }, 3000)
}

function renderUserDatabase(users) {
  let db = document.getElementById('adminUserDb')
  if (!db) {
    db = document.createElement('div')
    db.id = 'adminUserDb'
    db.style = 'margin-top:20px;background:rgba(0,0,0,0.8);color:white;padding:10px;border:2px solid #615eff;border-radius:8px;overflow-y:scroll;font-family:monospace;z-index:20'
    document.body.appendChild(db)
  }
  db.innerHTML = '<h3>User DB</h3>' + users.map(u =>
    `<div><strong>${escapeHtml(u.username)}</strong> <span style="color:gray">[Admin: ${u.isAdmin}]</span><br><small>Color: ${u.chatColor || 'None'}, PFP: ${u.pfp || 'default'}, Badges: ${u.badges || 'None'}</small></div><hr>`
  ).join('')
}

function banUser(name) {
  if (confirm(`Ban ${name}?`)) socket.send(JSON.stringify({ type: 'banUser', targetUsername: name }))
}
function muteUser(name) {
  if (confirm(`Mute ${name}?`)) socket.send(JSON.stringify({ type: 'muteUser', targetUsername: name }))
}
function promoteUser(name) {
  if (confirm(`Promote ${name} to admin?`)) socket.send(JSON.stringify({ type: 'promoteUser', targetUsername: name }))
}
function deleteMessage(id) {
  if (confirm(`Delete message ID ${id}?`)) socket.send(JSON.stringify({ type: 'deleteMessage', messageID: id }))
}
