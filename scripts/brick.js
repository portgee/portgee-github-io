let bibleAudio = null
let bibleAudioReady = false

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !bibleAudioReady) {
        bibleAudio = new Audio('./assets/audio/bible.mp3')
        bibleAudio.loop = true
        bibleAudio.muted = true
        bibleAudio.play().then(() => {
            bibleAudioReady = true
            console.log('Bible audio preloaded')
        }).catch(err => console.error('Preload failed:', err))
    }
})

function brickClicked() {
    const brick = document.createElement('div')
    brick.style.position = 'fixed'
    brick.style.top = '0'
    brick.style.left = '0'
    brick.style.width = '100vw'
    brick.style.height = '100vh'
    brick.style.backgroundImage = 'url("./assets/brickWall.jpg")'
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
        { text: '...', options: ['Tell me your secrets, wall.', 'Blink if you\'re sentient.', 'Stay silent if you\'re guilty.'] },
        { text: '...', options: ['I\'ll name you... Sir Bricksalot.', 'I\'m arguing with a wall. New low.', 'Are you even real?'] },
        { text: '...', options: ['Good talk.', 'You\'re better at listening than my friends.', 'This wall has better social skills than me.'] },
        { text: 'End of conversation.', options: [] }
    ]

    let currentLine = 0
    let currentChar = 0
    let typing = false
    let awaitingResponse = false

    function typeText(line, callback, customSpeed = 40) {
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
        }, customSpeed)
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
                if (optionText === 'Is this wall judging me?') {
                    if (bibleAudio && bibleAudioReady) {
                        bibleAudio.muted = false
                        bibleAudio.currentTime = 0
                        bibleAudio.play()
                    }
                    dialogText.textContent = ''
                    optionsContainer.innerHTML = ''
                    setTimeout(() => {
                        const chineseBibleText =
                        '起初，神创造天地。\n' +
                        '地是空虚混沌，渊面黑暗。神的灵运行在水面上。\n' +
                        '神说：“要有光”，就有了光。\n' +
                        '神看光是好的，就把光暗分开了。\n' +
                        '神称光为昼，称暗为夜。有晚上，有早晨，这是头一日。\n\n' +
                        '神说：“诸水之间要有空气，将水分为上下。”神就造出空气，将空气以下的水、空气以上的水分开了。事就这样成了。\n' +
                        '神称空气为天。有晚上，有早晨，是第二日。\n\n' +
                        '神说：“天下的水要聚在一处，使旱地露出来。”事就这样成了。\n' +
                        '神称旱地为地，称水的聚处为海。神看着是好的。\n' +
                        '神说：“地要发生青草和结种子的菜蔬，并结果子的树木，各从其类，果子都包着核。”事就这样成了。\n' +
                        '于是地发生了青草和结种子的菜蔬，各从其类，并结果子的树木，各从其类，果子都包着核。神看着是好的。\n' +
                        '有晚上，有早晨，是第三日。\n\n' +
                        '神说：“天上要有光体，可以分昼夜，作记号，定节令、日子、年岁，并要发光在天空，普照在地上。”事就这样成了。\n' +
                        '于是神造了两个大光，大的管昼，小的管夜，又造众星。\n' +
                        '就把这些光摆列在天空，普照在地上，管理昼夜，分别明暗。神看着是好的。\n' +
                        '有晚上，有早晨，是第四日。\n\n' +
                        '神说：“水要多多滋生有生命的物，要有鸟飞在地面以上，天空之中。”\n' +
                        '神就造出大鱼和水中所滋生各样有生命的动物，各从其类，又造各样飞鸟，各从其类。神看着是好的。\n' +
                        '神就赐福给这一切，说：“滋生繁多，充满海中的水；鸟也要多生在地上。”\n' +
                        '有晚上，有早晨，是第五日。\n\n' +
                        '神说：“地要生出活物来，各从其类：牲畜、昆虫、野兽，各从其类。”事就这样成了。\n' +
                        '于是神造出野兽，各从其类；牲畜，各从其类；地上一切爬行的动物，各从其类。神看着是好的。\n\n' +
                        '神说：“我们要照着我们的形象，按着我们的样式造人，使他们管理海里的鱼、空中的鸟、地上的牲畜和全地，并地上所爬的一切昆虫。”\n' +
                        '神就照着自己的形象造人，乃是照着祂的形象造男造女。\n' +
                        '神就赐福给他们，又对他们说：“要生养众多，遍满地面，治理这地；也要管理海里的鱼、空中的鸟，和地上各样行动的活物。”\n\n' +
                        '神说：“看哪，我将遍地上一切结种子的菜蔬和一切树上所结有核的果子全赐给你们作食物。\n' +
                        '至于地上一切的走兽、空中一切的飞鸟、并各样爬在地上有生命的物，我将青草赐给它们作食物。”事就这样成了。\n\n' +
                        '神看着一切所造的都甚好。有晚上，有早晨，是第六日。'
                        typeText(chineseBibleText, () => {
                            setTimeout(() => {
                                nextLine()
                            }, 100)
                        }, 100)
                    }, 500)
                } else {
                    if (awaitingResponse) return
                    awaitingResponse = true
                    dialogText.textContent = ''
                    optionsContainer.innerHTML = ''
                    setTimeout(() => {
                        nextLine()
                        awaitingResponse = false
                    }, 800)
                }
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

    typeText('Press anywhere to start talking...', () => {
        function startConversation() {
            window.removeEventListener('keydown', startConversation)
            window.removeEventListener('touchstart', startConversation)
            nextLine()
        }
        window.addEventListener('keydown', startConversation)
        window.addEventListener('touchstart', startConversation)
    })
    
}

document.getElementById('hiddenBrick').addEventListener('click', brickClicked)
