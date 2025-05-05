const config = {
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
        request.onupgradeneeded = function (event) {
            const db = event.target.result
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
            }
        }
        request.onsuccess = function (event) {
            resolve(event.target.result)
        }
        request.onerror = function (event) {
            reject(event.target.error)
        }
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
        x: parseFloat(img.dataset.x) || 0,
        y: parseFloat(img.dataset.y) || 0,
        zIndex: parseInt(img.style.zIndex) || 1,
        rotation: parseFloat(img.dataset.rotation) || 0
    }
    if (img.dataset.dbId) {
        item.id = parseInt(img.dataset.dbId)
    }
    const request = store.put(item)
    request.onsuccess = function (event) {
        if (!img.dataset.dbId) {
            img.dataset.dbId = event.target.result
        }
    }
    await tx.complete
    db.close()
}

async function loadState() {
    const db = await openDB()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = function (event) {
        const items = event.target.result
        if (!items) return
        items.forEach(item => spawnItem(null, item))
    }
    request.onerror = function () {
        console.error('Failed to load items from IndexedDB')
    }
}

function spawnItem(filename, savedData = null) {
    const wrapper = document.getElementById('itemPlaygroundWrapper')
    const img = document.createElement('img')
    img.src = savedData ? savedData.src : 'assets/itemPlayground/' + filename
    img.className = 'draggable imagePlayground'
    img.style.position = 'absolute'
    img.style.objectFit = 'contain'
    if (savedData) {
        img.style.width = savedData.width
        img.style.height = savedData.height
        img.style.zIndex = parseInt(savedData.zIndex) || 1
        img.dataset.x = savedData.x
        img.dataset.y = savedData.y
        img.dataset.rotation = savedData.rotation || 0
        img.dataset.dbId = savedData.id
        applyTransforms(img)
    } else {
        img.style.width = '150px'
        img.style.height = '150px'
        img.style.zIndex = 1
        img.dataset.x = 10
        img.dataset.y = 10
        img.dataset.rotation = 0
        applyTransforms(img)
        saveSingleItem(img)
    }
    wrapper.appendChild(img)
    makeDraggable(img)
}

function applyTransforms(img) {
    const x = parseFloat(img.dataset.x) || 0
    const y = parseFloat(img.dataset.y) || 0
    const rotation = parseFloat(img.dataset.rotation) || 0
    img.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`
}

function makeDraggable(img) {
    let isDragging = false
    const wrapper = document.getElementById('itemPlaygroundWrapper')
    interact(img).draggable({
        listeners: {
            start(event) {
                isDragging = true
                selectedImage = event.target
                bringToFront(event.target)
            },
            move(event) {
                const target = event.target
                let x = (parseFloat(target.dataset.x) || 0) + event.dx
                let y = (parseFloat(target.dataset.y) || 0) + event.dy
                const width = target.offsetWidth
                const height = target.offsetHeight
                if (x < 0) x = 0
                if (y < 0) y = 0
                if (x + width > wrapper.clientWidth) x = wrapper.clientWidth - width
                if (y + height > wrapper.clientHeight) y = wrapper.clientHeight - height
                target.dataset.x = x
                target.dataset.y = y
                applyTransforms(target)
            },
            end(event) {
                const target = event.target
                const deleteZone = document.getElementById('deleteZone')
                const deleteZoneRect = deleteZone.getBoundingClientRect()
                const pointerX = event.client.x
                const pointerY = event.client.y
                if (pointerX >= deleteZoneRect.left && pointerX <= deleteZoneRect.right && pointerY >= deleteZoneRect.top && pointerY <= deleteZoneRect.bottom) {
                    deleteItem(target)
                } else {
                    saveSingleItem(target)
                }
                isDragging = false
            }
        },
        inertia: true
    }).on('tap', function (event) {
        selectedImage = img
        bringToFront(img)
    })
    img.addEventListener('mousedown', function () {
        selectedImage = img
        bringToFront(img)
    })
    img.addEventListener('wheel', function (event) {
        if (!isDragging) return
        event.preventDefault()
        let currentWidth = img.offsetWidth
        let currentHeight = img.offsetHeight
        let scaleBase = event.deltaY < 0 ? config.normalScaleFactor : 1 / config.normalScaleFactor
        let scaleAmount = event.shiftKey ? (event.deltaY < 0 ? config.fastScaleFactor : 1 / config.fastScaleFactor) : scaleBase
        let newWidth = currentWidth * scaleAmount
        let newHeight = currentHeight * scaleAmount
        const aspectRatio = currentWidth / currentHeight
        if (newWidth > config.maxSize) {
            newWidth = config.maxSize
            newHeight = newWidth / aspectRatio
        }
        if (newHeight > config.maxSize) {
            newHeight = config.maxSize
            newWidth = newHeight * aspectRatio
        }
        if (newWidth < config.minSize) {
            newWidth = config.minSize
            newHeight = newWidth / aspectRatio
        }
        if (newHeight < config.minSize) {
            newHeight = config.minSize
            newWidth = newHeight * aspectRatio
        }
        const x = parseFloat(img.dataset.x) || 0
        const y = parseFloat(img.dataset.y) || 0
        if (x + newWidth > wrapper.clientWidth) {
            newWidth = wrapper.clientWidth - x
            newHeight = newWidth / aspectRatio
        }
        if (y + newHeight > wrapper.clientHeight) {
            newHeight = wrapper.clientHeight - y
            newWidth = newHeight * aspectRatio
        }
        img.style.width = newWidth + 'px'
        img.style.height = newHeight + 'px'
        saveSingleItem(img)
    }, { passive: false })
}

function bringToFront(target) {
    const wrapper = document.getElementById('itemPlaygroundWrapper')
    const items = Array.from(wrapper.getElementsByClassName('imagePlayground')).filter(el => el !== target)
    items.sort((a, b) => parseInt(a.style.zIndex) - parseInt(b.style.zIndex))
    items.forEach((item, index) => {
        item.style.zIndex = index + 1
        saveSingleItem(item)
    })
    target.style.zIndex = items.length + 1
    saveSingleItem(target)
}

async function deleteItem(target) {
    const dbId = parseInt(target.dataset.dbId)
    target.remove()
    if (!isNaN(dbId)) {
        const db = await openDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        store.delete(dbId)
        await tx.complete
        db.close()
    }
}

function addItem() {
    document.getElementById('fileInput').click()
}

function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function(e) {
        const fileType = file.type
        if (fileType === 'image/png') {
            spawnItemFromUpload(e.target.result)
        } else {
            compressImage(e.target.result, 1000, 0.8).then(compressedBase64 => {
                spawnItemFromUpload(compressedBase64)
            })
        }
    }
    reader.readAsDataURL(file)
}

function compressImage(srcBase64, maxSize, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = function() {
            let width = img.width
            let height = img.height
            if (width > height) {
                if (width > maxSize) {
                    height = Math.round(height * (maxSize / width))
                    width = maxSize
                }
            } else {
                if (height > maxSize) {
                    width = Math.round(width * (maxSize / height))
                    height = maxSize
                }
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
            resolve(compressedBase64)
        }
        img.src = srcBase64
    })
}

function spawnItemFromUpload(imageSrc) {
    const wrapper = document.getElementById('itemPlaygroundWrapper')
    const img = document.createElement('img')
    img.src = imageSrc
    img.className = 'draggable imagePlayground'
    img.style.position = 'absolute'
    img.style.objectFit = 'contain'
    img.style.width = '150px'
    img.style.height = '150px'
    img.style.zIndex = 1
    img.dataset.x = 10
    img.dataset.y = 10
    img.dataset.rotation = 0
    applyTransforms(img)
    wrapper.appendChild(img)
    saveSingleItem(img)
    makeDraggable(img)
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Shift') shiftPressed = true
    if (!selectedImage) return
    if (rotating) return
    if (event.key === 'ArrowLeft') {
        rotationDirection = -1
        startRotation()
    }
    if (event.key === 'ArrowRight') {
        rotationDirection = 1
        startRotation()
    }
})

document.addEventListener('keyup', function(event) {
    if (event.key === 'Shift') shiftPressed = false
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        stopRotation()
    }
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
    if (shiftPressed) {
        if (!snapCooldown) {
            rotateItem(selectedImage)
        }
    } else {
        const rotationSpeed = 180
        const angleDelta = rotationDirection * rotationSpeed * delta
        applyRotation(selectedImage, angleDelta)
    }
    requestAnimationFrame(rotateFrame)
}

function rotateItem(img) {
    let currentRotation = parseFloat(img.dataset.rotation) || 0
    let targetRotation = Math.round(currentRotation / 90) * 90

    if (rotationDirection > 0) {
        if (targetRotation <= currentRotation) {
            targetRotation += 90
        }
    } else {
        if (targetRotation >= currentRotation) {
            targetRotation -= 90
        }
    }

    targetRotation = (targetRotation + 360) % 360

    img.dataset.rotation = targetRotation
    applyTransforms(img)
    saveSingleItem(img)
    snapCooldown = true
    setTimeout(() => { snapCooldown = false }, 150)
}

function applyRotation(img, angleDelta) {
    let currentRotation = parseFloat(img.dataset.rotation) || 0
    let newRotation = (currentRotation + angleDelta) % 360
    img.dataset.rotation = newRotation
    applyTransforms(img)
    saveSingleItem(img)
}
