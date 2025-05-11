let emojiMap = null

async function loadEmojiMap() {
  if (emojiMap) return emojiMap
  const res = await fetch('files/emojiMap.json')
  emojiMap = await res.json()
  return emojiMap
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function createEmojiImg(name, url) {
  const img = document.createElement('img')
  img.src = url
  img.alt = `:${name}:`
  img.className = 'emoji-inline'
  return img
}

function getEmojiMatches(text, map) {
  const matches = []
  const regex = /:([a-zA-Z0-9_]+):/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const name = match[1]
    if (map[name]) {
      matches.push({ index: match.index, length: match[0].length, name })
    }
  }
  return matches
}

function buildFragmentWithEmojis(text, matches, map) {
  let last = 0
  const frag = document.createDocumentFragment()
  for (const m of matches) {
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
    frag.appendChild(createEmojiImg(m.name, map[m.name]))
    last = m.index + m.length
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
  return frag
}

function replaceContentInContentEditable(el, map) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const matches = getEmojiMatches(node.textContent, map)
    if (matches.length) {
      const frag = buildFragmentWithEmojis(node.textContent, matches, map)
      node.parentNode.replaceChild(frag, node)
    }
  }
}

function replaceInInputs(el, map) {
  el.value = el.value.replace(/:([a-zA-Z0-9_]+):/g, (m, name) => map[name] ? '🔹' : m)
}

function handleTyping(map) {
  document.body.addEventListener('input', e => {
    const el = e.target
    if (el.isContentEditable) {
      replaceContentInContentEditable(el, map)
    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      replaceInInputs(el, map)
    }
  }, { passive: true })
}

function replaceStaticTextNodes(map) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)
  const nodes = []
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (!node.parentNode.closest('script, style, textarea')) {
      nodes.push(node)
    }
  }
  for (const node of nodes) {
    const matches = getEmojiMatches(node.textContent, map)
    if (matches.length) {
      const frag = buildFragmentWithEmojis(node.textContent, matches, map)
      node.parentNode.replaceChild(frag, node)
    }
  }
}

function replaceEmojisInElement(el, map) {
  const matches = getEmojiMatches(el.innerText, map)
  if (matches.length) {
    const frag = buildFragmentWithEmojis(el.innerText, matches, map)
    el.innerHTML = ''
    el.appendChild(frag)
  }
}

async function startEmojiLiveReplacement() {
  const map = await loadEmojiMap()
  replaceStaticTextNodes(map)
  handleTyping(map)
}

startEmojiLiveReplacement()
window.replaceEmojisInElement = replaceEmojisInElement
