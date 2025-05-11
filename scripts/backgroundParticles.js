const config = {
  minSize: 25,
  maxSize: 55,
  spawnInterval: 150,
  lifespan: 3000,
  font: 'Poppins',
  maxActiveItems: 100
}

const characters = [
  "⭐", "🌟", "✨", "💫", "🪐", "🌙", "🌌", "🌠", "💥", "🧿", "🎇", "🌈", "🛸", "🦄", "🧸",
  ":freddyPlushie:", ":AstolfoPlushie:", ":catplush:",
  "🌀", "🌜", "🌛", "🔮", "👾", "🪄", "💎", "⚡", "🌧️", "🌟", "🍬", "🍭", "🎈", "🎉", "🎊"
]

let emojiMapCache = null

function createEmojiImg(name, url) {
  const img = document.createElement('img')
  img.src = url
  img.alt = `:${name}:`
  img.className = 'emoji-inline'
  img.style.position = 'absolute'
  img.style.width = (Math.random() * (config.maxSize - config.minSize) + config.minSize) + 'px'
  img.style.height = 'auto'
  img.style.zIndex = 1
  return img
}

const backgroundContainer = document.createElement('div')
backgroundContainer.style.position = 'fixed'
backgroundContainer.style.top = 0
backgroundContainer.style.left = 0
backgroundContainer.style.width = '100vw'
backgroundContainer.style.height = '100vh'
backgroundContainer.style.pointerEvents = 'none'
backgroundContainer.style.overflow = 'hidden'
backgroundContainer.style.zIndex = 0
document.body.appendChild(backgroundContainer)

async function spawnItem() {
  if (toggleValBackground === false) return
  if (backgroundContainer.children.length >= config.maxActiveItems) return

  if (!emojiMapCache) emojiMapCache = await loadEmojiMap()

  const itemVal = characters[Math.floor(Math.random() * characters.length)]
  const isCustomEmoji = /^:([a-zA-Z0-9_]+):$/.test(itemVal)

  const item = isCustomEmoji
    ? createEmojiImg(itemVal.slice(1, -1), emojiMapCache[itemVal.slice(1, -1)])
    : document.createElement('div')

  item.className = 'backgroundItem'

  if (!isCustomEmoji) {
    item.textContent = itemVal
    item.style.fontSize = (Math.random() * (config.maxSize - config.minSize) + config.minSize) + 'px'
    item.style.fontFamily = config.font
    item.style.color = getRandomColor()
  }

  item.style.position = 'absolute'
  item.style.top = Math.random() * window.innerHeight + 'px'
  item.style.left = Math.random() * window.innerWidth + 'px'

  backgroundContainer.appendChild(item)
  setTimeout(() => item.remove(), config.lifespan)
}

function getRandomColor() {
  const palette = ['#ff69b4', '#ffd700', '#00ffff', '#7fff00', '#ff4500', '#8a2be2']
  return palette[Math.floor(Math.random() * palette.length)]
}

setInterval(spawnItem, config.spawnInterval)
