const config = {
    minSize: 50,
    maxSize: 500,
    normalScaleFactor: 1.05,
    fastScaleFactor: 1.1
}

let currentZIndex = 1

const dbName = 'playgroundDB'
const storeName = 'itemsStore'

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
        zIndex: parseInt(img.style.zIndex) || 1
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
        img.style.zIndex = savedData.zIndex
        img.dataset.x = savedData.x
        img.dataset.y = savedData.y
        img.dataset.dbId = savedData.id
        img.style.transform = `translate(${savedData.x}px, ${savedData.y}px)`
    } else {
        img.style.width = '150px'
        img.style.height = '150px'
        img.style.zIndex = 1
        img.dataset.x = 10
        img.dataset.y = 10
        img.style.transform = 'translate(10px, 10px)'
        saveSingleItem(img)
    }

    wrapper.appendChild(img)

    makeDraggable(img)
}

function makeDraggable(img) {
    let isDragging = false
    const wrapper = document.getElementById('itemPlaygroundWrapper')

    interact(img).draggable({
        listeners: {
            start(event) {
                isDragging = true
                bringToFront(event.target)
            },
            move(event) {
                const target = event.target
                const width = target.offsetWidth
                const height = target.offsetHeight
                let x = (parseFloat(target.dataset.x) || 0) + event.dx
                let y = (parseFloat(target.dataset.y) || 0) + event.dy
                if (x < 0) x = 0
                if (y < 0) y = 0
                if (x + width > wrapper.clientWidth) x = wrapper.clientWidth - width
                if (y + height > wrapper.clientHeight) y = wrapper.clientHeight - height
                target.style.transform = `translate(${x}px, ${y}px)`
                target.dataset.x = x
                target.dataset.y = y
            },
            end(event) {
                const target = event.target
                const deleteZone = document.getElementById('deleteZone')
                const deleteZoneRect = deleteZone.getBoundingClientRect()
                const pointerX = event.client.x
                const pointerY = event.client.y

                if (pointerX >= deleteZoneRect.left &&
                    pointerX <= deleteZoneRect.right &&
                    pointerY >= deleteZoneRect.top &&
                    pointerY <= deleteZoneRect.bottom) {
                    deleteItem(target)
                } else {
                    saveSingleItem(target)
                }

                isDragging = false
            }
        },
        inertia: true
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

    img.addEventListener('mousedown', function () {
        bringToFront(img)
    })
}


function bringToFront(target) {
    currentZIndex++
    target.style.zIndex = currentZIndex
    saveSingleItem(target)
}

async function deleteItem(target) {
    console.log('Deleting item:', target)
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
    img.style.transform = 'translate(10px, 10px)'
    wrapper.appendChild(img)

    saveSingleItem(img)

    makeDraggable(img)
}
