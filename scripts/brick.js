function brickClicked() {
    const brick = document.createElement('div')
    brick.style.position = 'fixed'
    brick.style.top = '0'
    brick.style.left = '0'
    brick.style.width = '100vw'
    brick.style.height = '100vh'
    brick.style.backgroundImage = 'url("assets/brickWall.jpg")'
    brick.style.backgroundSize = 'cover'
    brick.style.backgroundPosition = 'center'
    brick.style.zIndex = '9999'
    brick.style.display = 'flex'
    brick.style.alignItems = 'center'
    brick.style.justifyContent = 'center'
    brick.style.transition = 'opacity 2s'
    document.body.appendChild(brick)

    const dialogContainer = document.createElement('div')
    dialogContainer.style.position = 'absolute'
    dialogContainer.style.bottom = '40px'
    dialogContainer.style.left = '50%'
    dialogContainer.style.transform = 'translateX(-50%)'
    dialogContainer.style.background = 'rgba(255, 255, 255, 0.9)'
    dialogContainer.style.padding = '20px'
    dialogContainer.style.border = '3px solid #333'
    dialogContainer.style.borderRadius = '15px'
    dialogContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)'
    dialogContainer.style.fontFamily = 'monospace'
    dialogContainer.style.fontSize = '20px'
    dialogContainer.style.minWidth = '400px'
    dialogContainer.style.minHeight = '150px'
    dialogContainer.style.textAlign = 'left'
    dialogContainer.style.zIndex = '10000'
    dialogContainer.style.display = 'flex'
    dialogContainer.style.flexDirection = 'column'
    dialogContainer.style.alignItems = 'flex-start'
    brick.appendChild(dialogContainer)

    const dialogText = document.createElement('div')
    dialogText.style.wordBreak = 'break-word'
    dialogText.style.marginBottom = '20px'
    dialogContainer.appendChild(dialogText)

    const optionsContainer = document.createElement('div')
    optionsContainer.style.display = 'flex'
    optionsContainer.style.flexDirection = 'column'
    optionsContainer.style.gap = '10px'
    dialogContainer.appendChild(optionsContainer)
    
    const dialogue = [
        { text: '...', options: ['Hello? Can you hear me?', 'What a nice wall you are.', 'Am I losing my mind?'] },
        { text: '...', options: ['Maybe if I knock...', 'I bet you\'re a secret door.', 'Is this wall judging me?'] },
        { text: '...', options: ['Tell me your secrets wall.', 'Blink if you\'re sentient.', 'Stay silent if you\'re guilty.'] },
        { text: '...', options: ['I\'ll name you... Sir Bricksalot.', 'I\'m arguing with a wall. New low.', 'Are you even real?'] },
        { text: '...', options: ['Good talk.', 'You\'re better at listening than my friends.', 'This wall has better social skills than me.'] },
        { text: 'End of conversation.', options: [] }
    ]
    

    let currentLine = 0
    let currentChar = 0
    let typing = false
    let awaitingResponse = false

    function typeText(line, callback) {
        typing = true
        dialogText.textContent = ''
        currentChar = 0
        const interval = setInterval(() => {
            dialogText.textContent += line[currentChar]
            currentChar++
            if (currentChar >= line.length) {
                clearInterval(interval)
                typing = false
                if (callback) callback()
            }
        }, 40)
    }

    function showOptions(options) {
        optionsContainer.innerHTML = ''
        options.forEach(optionText => {
            const btn = document.createElement('button')
            btn.textContent = optionText
            btn.style.fontFamily = 'monospace'
            btn.style.fontSize = '16px'
            btn.style.padding = '10px 20px'
            btn.style.borderRadius = '8px'
            btn.style.border = '2px solid #555'
            btn.style.background = '#f0f0f0'
            btn.style.cursor = 'pointer'
            btn.style.transition = 'background 0.3s, transform 0.1s'
            btn.onmouseover = () => btn.style.background = '#ddd'
            btn.onmouseout = () => btn.style.background = '#f0f0f0'
            btn.onmousedown = () => btn.style.transform = 'scale(0.95)'
            btn.onmouseup = () => btn.style.transform = 'scale(1)'
            btn.onclick = () => {
                if (awaitingResponse) return
                awaitingResponse = true
                dialogText.textContent = ''
                optionsContainer.innerHTML = ''
                setTimeout(() => {
                    nextLine()
                    awaitingResponse = false
                }, 800)
            }
            optionsContainer.appendChild(btn)
        })
    }

    function nextLine() {
        if (typing) return
        if (currentLine < dialogue.length) {
            typeText(dialogue[currentLine].text, () => {
                if (dialogue[currentLine].options.length > 0) {
                    showOptions(dialogue[currentLine].options)
                } else {
                    setTimeout(() => {
                        currentLine++
                        nextLine()
                    }, 800)
                }
            })
            currentLine++
        } else {
            brick.style.opacity = '0'
            setTimeout(() => {
                brick.remove()
            }, 2000)
        }
    }

    typeText('Press any key to start talking...', () => {
        window.addEventListener('keydown', function startConversation() {
            window.removeEventListener('keydown', startConversation)
            nextLine()
        })
    })
}

document.getElementById('hiddenBrick').addEventListener('click', brickClicked)
