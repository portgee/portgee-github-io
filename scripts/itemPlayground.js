const itemConfig = {
  minSize: 50,
  maxSize: 500,
  normalScaleFactor: 1.05,
  fastScaleFactor: 1.1
}

const dbName = 'playgroundDB'
const storeName = 'itemsStore'

let selectedImage = null
let rotationDirection = 0
let rotating = false
let lastTimestamp = 0
let shiftPressed = false
let snapCooldown = false

window.addEventListener('DOMContentLoaded', () => {
  loadState()
})

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = e => resolve(e.target.result)
    request.onerror = e => reject(e.target.error)
  })
}

async function saveSingleItem(img) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  const store = tx.objectStore(storeName)
  const item = {
    src: img.src,
    width: img.style.width,
    height: img.style.height,
    x: +img.dataset.x || 0,
    y: +img.dataset.y || 0,
    zIndex: +img.style.zIndex || 1,
    rotation: +img.dataset.rotation || 0
  }
  if (img.dataset.dbId) item.id = +img.dataset.dbId
  const req = store.put(item)
  req.onsuccess = e => {
    if (!img.dataset.dbId) img.dataset.dbId = e.target.result
  }
  await tx.done
  db.close()
}

async function loadState() {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readonly')
  const store = tx.objectStore(storeName)
  const request = store.getAll()
  request.onsuccess = e => {
    const items = e.target.result || []
    items.forEach(item => spawnItem(null, item))
  }
  request.onerror = () => console.error('Failed to load items from IndexedDB')
}

function spawnItem(filename, saved = null) {
  const wrapper = document.getElementById('itemPlaygroundWrapper')
  const img = document.createElement('img')
  img.src = saved ? saved.src : 'assets/itemPlayground/' + filename
  img.className = 'draggable imagePlayground'
  img.style.position = 'absolute'
  img.style.objectFit = 'contain'
  if (saved) {
    img.style.width = saved.width
    img.style.height = saved.height
    img.style.zIndex = saved.zIndex
    Object.assign(img.dataset, {
      x: saved.x,
      y: saved.y,
      rotation: saved.rotation,
      dbId: saved.id
    })
  } else {
    img.style.width = '150px'
    img.style.height = '150px'
    img.style.zIndex = 1
    Object.assign(img.dataset, { x: 10, y: 10, rotation: 0 })
    saveSingleItem(img)
  }
  applyTransforms(img)
  wrapper.appendChild(img)
  makeDraggable(img)
}

function applyTransforms(img) {
  const x = +img.dataset.x || 0
  const y = +img.dataset.y || 0
  const rot = +img.dataset.rotation || 0
  img.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`
}

function makeDraggable(img) {
  const wrapper = document.getElementById('itemPlaygroundWrapper')
  let isDragging = false
  interact(img).draggable({
    listeners: {
      start(e) {
        isDragging = true
        selectedImage = e.target
        bringToFront(e.target)
      },
      move(e) {
        const t = e.target
        const w = t.offsetWidth
        const h = t.offsetHeight
        let x = (+t.dataset.x || 0) + e.dx
        let y = (+t.dataset.y || 0) + e.dy
        x = Math.max(0, Math.min(wrapper.clientWidth - w, x))
        y = Math.max(0, Math.min(wrapper.clientHeight - h, y))
        Object.assign(t.dataset, { x, y })
        applyTransforms(t)
      },
      end(e) {
        const t = e.target
        const del = document.getElementById('deleteZone').getBoundingClientRect()
        const inZone = e.client.x >= del.left && e.client.x <= del.right && e.client.y >= del.top && e.client.y <= del.bottom
        if (inZone) deleteItem(t)
        else saveSingleItem(t)
        isDragging = false
      }
    },
    inertia: true
  }).on('tap', () => {
    selectedImage = img
    bringToFront(img)
  })

  img.addEventListener('mousedown', () => {
    selectedImage = img
    bringToFront(img)
  })

  img.addEventListener('wheel', e => {
    if (!isDragging) return
    e.preventDefault()
    const scale = e.shiftKey ? itemConfig.fastScaleFactor : itemConfig.normalScaleFactor
    const scaleFactor = e.deltaY < 0 ? scale : 1 / scale
    const w = img.offsetWidth
    const h = img.offsetHeight
    const ar = w / h
    let nw = w * scaleFactor
    let nh = h * scaleFactor

    nw = Math.max(itemConfig.minSize, Math.min(itemConfig.maxSize, nw))
    nh = nw / ar

    const x = +img.dataset.x || 0
    const y = +img.dataset.y || 0
    nw = Math.min(nw, wrapper.clientWidth - x)
    nh = nw / ar
    nh = Math.min(nh, wrapper.clientHeight - y)
    nw = nh * ar

    img.style.width = nw + 'px'
    img.style.height = nh + 'px'
    saveSingleItem(img)
  }, { passive: false })
}

function bringToFront(target) {
  const wrapper = document.getElementById('itemPlaygroundWrapper')
  const items = Array.from(wrapper.getElementsByClassName('imagePlayground')).filter(i => i !== target)
  items.sort((a, b) => +a.style.zIndex - +b.style.zIndex)
  items.forEach((item, i) => item.style.zIndex = i + 1)
  target.style.zIndex = items.length + 1
  saveSingleItem(target)
}

async function deleteItem(target) {
  const id = +target.dataset.dbId
  target.remove()
  if (!isNaN(id)) {
    const db = await openDB()
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(id)
    await tx.done
    db.close()
  }
}

function addItem() {
  document.getElementById('fileInput').click()
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    if (file.type === 'image/png') {
      spawnItemFromUpload(ev.target.result)
    } else {
      compressImage(ev.target.result, 1000, 0.8).then(spawnItemFromUpload)
    }
  }
  reader.readAsDataURL(file)
}

function compressImage(base64, maxSize, quality = 0.8) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height && width > maxSize) {
        height = Math.round(height * (maxSize / width))
        width = maxSize
      } else if (height > maxSize) {
        width = Math.round(width * (maxSize / height))
        height = maxSize
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = base64
  })
}

function spawnItemFromUpload(src) {
  const wrapper = document.getElementById('itemPlaygroundWrapper')
  const img = document.createElement('img')
  Object.assign(img, {
    src,
    className: 'draggable imagePlayground'
  })
  Object.assign(img.style, {
    position: 'absolute',
    objectFit: 'contain',
    width: '150px',
    height: '150px',
    zIndex: 1
  })
  Object.assign(img.dataset, { x: 10, y: 10, rotation: 0 })
  applyTransforms(img)
  wrapper.appendChild(img)
  saveSingleItem(img)
  makeDraggable(img)
}

document.addEventListener('keydown', e => {
  if (e.key === 'Shift') shiftPressed = true
  if (!selectedImage || rotating) return
  if (e.key === 'ArrowLeft') {
    rotationDirection = -1
    startRotation()
  }
  if (e.key === 'ArrowRight') {
    rotationDirection = 1
    startRotation()
  }
})

document.addEventListener('keyup', e => {
  if (e.key === 'Shift') shiftPressed = false
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') stopRotation()
})

function startRotation() {
  rotating = true
  lastTimestamp = performance.now()
  requestAnimationFrame(rotateFrame)
}

function stopRotation() {
  rotating = false
}

function rotateFrame(timestamp) {
  if (!rotating || !selectedImage) return
  const delta = (timestamp - lastTimestamp) / 1000
  lastTimestamp = timestamp
  if (shiftPressed && !snapCooldown) {
    rotateItem(selectedImage)
    snapCooldown = true
    setTimeout(() => snapCooldown = false, 150)
  } else if (!shiftPressed) {
    applyRotation(selectedImage, rotationDirection * 180 * delta)
  }
  requestAnimationFrame(rotateFrame)
}

function rotateItem(img) {
  let angle = +img.dataset.rotation || 0
  let target = Math.round(angle / 90) * 90
  target += rotationDirection > 0
    ? target <= angle ? 90 : 0
    : target >= angle ? -90 : 0
  target = (target + 360) % 360
  img.dataset.rotation = target
  applyTransforms(img)
  saveSingleItem(img)
}

function applyRotation(img, delta) {
  let current = +img.dataset.rotation || 0
  let next = (current + delta) % 360
  img.dataset.rotation = next
  applyTransforms(img)
  saveSingleItem(img)
}
