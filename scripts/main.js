let notificationQueue = []
let notificationShowing = false

const SettingsManager = {
  defaults: {
    toggleValBackground: true,
    weatherMode: true
  },
  settings: {},
  listeners: {},
  load() {
    try {
      const cookie = CookieManager.get('settings')
      this.settings = { ...this.defaults, ...(cookie ? JSON.parse(cookie) : {}) }
    } catch {
      this.settings = { ...this.defaults }
    }
  },
  save() {
    CookieManager.set('settings', JSON.stringify(this.settings), { path: '/', expires: 31536000 })
  },
  proxy() {
    this.settings = new Proxy(this.settings, {
      set: (obj, prop, val) => {
        if (obj[prop] !== val) {
          obj[prop] = val
          this.save()
          this.applyChange(prop, val)
        }
        return true
      }
    })
  },
  applyChange(prop, val) {
    const cbs = this.listeners[prop]
    if (Array.isArray(cbs)) cbs.forEach(fn => fn(val))
    else if (typeof cbs === 'function') cbs(val)
  },
  onChange(prop, cb) {
    if (!this.listeners[prop]) this.listeners[prop] = []
    if (!Array.isArray(this.listeners[prop])) this.listeners[prop] = [this.listeners[prop]]
    this.listeners[prop].push(cb)
  },
  injectGlobals() {
    Object.keys(this.defaults).forEach(key => {
      if (!(key in window)) {
        Object.defineProperty(window, key, {
          get: () => this.settings[key],
          set: v => { this.settings[key] = v },
          configurable: true
        })
      }
    })
  },
  initialize() {
    this.load()
    this.proxy()
    this.injectGlobals()
    this.applyAll()
  },
  applyAll() {
    Object.entries(this.settings).forEach(([k, v]) => this.applyChange(k, v))
  }
}

function toggleBackground(force) {
  if (typeof force === 'boolean') SettingsManager.settings.toggleValBackground = force
  showNotification(
    SettingsManager.settings.toggleValBackground ? 'Background particles enabled' : 'Background particles disabled',
    SettingsManager.settings.toggleValBackground ? 'lime' : 'red',
    2000
  )
}

function toggleWeather(force) {
  if (typeof force === 'boolean') SettingsManager.settings.weatherMode = force
  if (!SettingsManager.settings.weatherMode && typeof setEvent === 'function') setEvent('none')
  showNotification(
    SettingsManager.settings.weatherMode ? 'Weather enabled' : 'Weather disabled',
    SettingsManager.settings.weatherMode ? 'lime' : 'red',
    2000
  )
}

SettingsManager.onChange('toggleValBackground', toggleBackground)
SettingsManager.onChange('weatherMode', toggleWeather)
SettingsManager.initialize()

function toggleWeatherSetting() {
  SettingsManager.settings.weatherMode = !SettingsManager.settings.weatherMode
}

function toggleBackgroundSetting() {
  SettingsManager.settings.toggleValBackground = !SettingsManager.settings.toggleValBackground
}

function showNotification(message, color = 'white', duration = 2000) {
  notificationQueue.push({ message, color, duration })
  if (!notificationShowing) processQueue()
}

function processQueue() {
  if (notificationQueue.length === 0) {
    notificationShowing = false
    return
  }
  notificationShowing = true
  const { message, color, duration } = notificationQueue.shift()
  const notif = document.createElement('div')
  notif.className = 'notificationDiv mainGui'
  notif.innerText = message
  notif.style.color = color
  notif.style.transition = 'top 0.7s ease'
  document.body.appendChild(notif)
  void notif.offsetWidth
  notif.style.top = '-60px'
  setTimeout(() => {
    notif.style.top = '-200px'
    setTimeout(() => {
      notif.remove()
      requestIdleCallback(processQueue)
    }, 500)
  }, duration)
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function toggleMusic() {
  const music = document.getElementById('background-music')
  if (music) music.muted = !music.muted
}

function clearItems() {
  const area = document.getElementById('itemPlayground')
  if (area) area.innerHTML = ''
}

fetch('files/ascii_art.txt')
  .then(res => res.text())
  .then(text => {
    const blocks = text.split(/\s*===\s*/).map(b => b.trim()).filter(Boolean)
    const randomArt = blocks[Math.floor(Math.random() * blocks.length)]
    document.getElementById('asciiArt').textContent = randomArt
  })
  .catch(err => {
    document.getElementById('asciiArt').textContent = 'Error loading ASCII art.'
    console.error(err)
  })
