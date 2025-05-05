function createIcon(name, iconUrl, programContent) {
    const icon = document.createElement('div')
    icon.className = 'icon'
    icon.onclick = () => openWindow(name, programContent)

    const img = document.createElement('img')
    img.src = iconUrl

    const label = document.createElement('div')
    label.innerText = name

    icon.appendChild(img)
    icon.appendChild(label)

    document.getElementById('virtualDesktop').appendChild(icon)
}

function openWindow(title, content) {
    const win = document.createElement('div')
    win.className = 'window'

    const header = document.createElement('div')
    header.className = 'window-header'
    header.innerHTML = `<span>${title}</span>`

    const closeBtn = document.createElement('button')
    closeBtn.className = 'close-btn'
    closeBtn.innerHTML = '✖'
    closeBtn.onclick = () => win.remove()

    header.appendChild(closeBtn)
    win.appendChild(header)

    const body = document.createElement('div')
    body.className = 'window-body'

    if (typeof content === 'string') {
        body.innerHTML = content
    } else if (content instanceof HTMLElement) {
        body.appendChild(content)
    }

    win.appendChild(body)

    if (title === 'Calculator') {
        win.style.width = '350px'
        win.style.height = '450px'
    }

    document.getElementById('virtualDesktop').appendChild(win)

    dragElement(win)
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    const header = elmnt.querySelector('.window-header')
    if (!header) return

    header.onmousedown = dragMouseDown

    function dragMouseDown(e) {
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createIcon('Notepad', 'https://cdn-icons-png.flaticon.com/512/716/716784.png', '<div contenteditable="true" style="width:100%;height:100%;background:#23272a;color:white;border:none;outline:none;resize:none;font-family:Poppins;padding:10px;overflow:auto;">Type here...</div>')
    createIcon('Calculator', 'https://cdn-icons-png.flaticon.com/512/3039/3039436.png', createCalculatorApp())
    createIcon('Gallery', 'https://cdn-icons-png.flaticon.com/512/2950/2950701.png', createGalleryApp())
})


function createCalculatorApp() {
    const calculator = document.createElement('div')
    calculator.style.display = 'flex'
    calculator.style.flexDirection = 'column'
    calculator.style.alignItems = 'center'
    calculator.style.justifyContent = 'center'
    calculator.style.height = '100%'
    calculator.style.padding = '10px'
    calculator.style.fontFamily = 'Poppins'

    const display = document.createElement('input')
    display.type = 'text'
    display.style.width = '90%'
    display.style.marginBottom = '10px'
    display.style.padding = '10px'
    display.style.fontSize = '18px'
    display.style.textAlign = 'right'
    display.style.background = '#2c2f33'
    display.style.color = 'white'
    display.style.border = '1px solid #7289da'
    display.style.borderRadius = '5px'
    display.readOnly = true

    const buttons = [
        ['7','8','9','/'],
        ['4','5','6','*'],
        ['1','2','3','-'],
        ['0','.','=','+'],
        ['C']
    ]

    const buttonsContainer = document.createElement('div')
    buttonsContainer.style.display = 'grid'
    buttonsContainer.style.gridTemplateColumns = 'repeat(4, 1fr)'
    buttonsContainer.style.gap = '10px'
    buttonsContainer.style.width = '90%'

    buttons.flat().forEach(text => {
        const btn = document.createElement('button')
        btn.innerText = text
        btn.style.padding = '15px'
        btn.style.fontSize = '16px'
        btn.style.border = 'none'
        btn.style.borderRadius = '5px'
        btn.style.background = '#7289da'
        btn.style.color = 'white'
        btn.style.cursor = 'pointer'
        btn.style.transition = 'background 0.2s'
        btn.onmouseover = () => btn.style.background = '#5b6fa9'
        btn.onmouseout = () => btn.style.background = '#7289da'
        btn.onclick = () => handleCalculatorInput(text, display)
        buttonsContainer.appendChild(btn)
    })

    calculator.appendChild(display)
    calculator.appendChild(buttonsContainer)

    return calculator
}

function handleCalculatorInput(input, display) {
    if (input === '=') {
        try {
            display.value = eval(display.value)
        } catch {
            display.value = 'Error'
        }
    } else if (input === 'C') {
        display.value = ''
    } else {
        display.value += input
    }
}

const images = [
    'assets/itemPlayground/blahaj.gif',
    'assets/itemPlayground/bow.png',
    'assets/itemPlayground/deathScythe.gif',
    'assets/itemPlayground/diamond.png',
    'assets/itemPlayground/disc.png',
    'assets/itemPlayground/empressOfLight.gif',
    'assets/itemPlayground/heartCrystal.gif',
    'assets/itemPlayground/kitty.png',
    'assets/itemPlayground/miku.png',
    'assets/itemPlayground/milk.png',
    'assets/itemPlayground/monster.png',
    'assets/itemPlayground/mushrooms.gif',
    'assets/itemPlayground/pumpkinGuy.png',
    'assets/itemPlayground/reimore.png',
    'assets/itemPlayground/sylveon.png'
]

function createGalleryApp() {
    const galleryContainer = document.createElement('div')
    galleryContainer.style.display = 'flex'
    galleryContainer.style.flexDirection = 'column'
    galleryContainer.style.alignItems = 'center'
    galleryContainer.style.justifyContent = 'flex-start'
    galleryContainer.style.height = '100%'
    galleryContainer.style.padding = '10px'
    galleryContainer.style.fontFamily = 'Poppins'
    galleryContainer.style.overflowY = 'auto'

    const uploadButton = document.createElement('input')
    uploadButton.type = 'file'
    uploadButton.accept = 'image/*'
    uploadButton.style.marginBottom = '10px'
    uploadButton.style.cursor = 'pointer'

    const gallery = document.createElement('div')
    gallery.style.display = 'flex'
    gallery.style.flexWrap = 'wrap'
    gallery.style.gap = '10px'
    gallery.style.justifyContent = 'center'
    gallery.style.alignItems = 'center'
    gallery.style.width = '100%'

    images.forEach(src => {
        addGalleryImage(gallery, src)
    })

    uploadButton.addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                addGalleryImage(gallery, e.target.result)
            }
            reader.readAsDataURL(file)
        } else {
            alert('Only image files are allowed.')
        }
    })

    galleryContainer.appendChild(uploadButton)
    galleryContainer.appendChild(gallery)

    return galleryContainer
}

function addGalleryImage(gallery, src) {
    const img = document.createElement('img')
    img.src = src
    img.style.maxWidth = '100px'
    img.style.maxHeight = '100px'
    img.style.borderRadius = '8px'
    img.style.objectFit = 'cover'
    img.style.cursor = 'pointer'
    img.onclick = () => openImageFullscreen(src)
    gallery.appendChild(img)
}

function openImageFullscreen(src) {
    const popup = document.createElement('div')
    popup.style.position = 'fixed'
    popup.style.top = '0'
    popup.style.left = '0'
    popup.style.width = '100vw'
    popup.style.height = '100vh'
    popup.style.background = 'rgba(0,0,0,0.8)'
    popup.style.display = 'flex'
    popup.style.alignItems = 'center'
    popup.style.justifyContent = 'center'
    popup.style.zIndex = '1000'
    popup.style.cursor = 'pointer'

    const img = document.createElement('img')
    img.src = src
    img.style.maxWidth = '90%'
    img.style.maxHeight = '90%'
    img.style.borderRadius = '10px'
    img.style.boxShadow = '0 0 20px rgba(0,0,0,0.7)'
    popup.appendChild(img)

    popup.onclick = () => popup.remove()
    document.body.appendChild(popup)
}
