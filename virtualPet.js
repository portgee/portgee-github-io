const variants = ["classic", "dog", "tora", "maia", "vaporwave"]
const selectedVariant = variants[Math.floor(Math.random() * variants.length)]

const oneko = document.getElementById('oneko')
oneko.style.backgroundImage = `url('assets/virtualPet/oneko-${selectedVariant}.gif')`

let nekoPosX = 32
let nekoPosY = 32
let mousePosX = 0
let mousePosY = 0
let frameCount = 0
const nekoSpeed = 12

const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    scratchWallN: [[0, 0], [0, -1]],
    scratchWallS: [[-7, -1], [-6, -2]],
    scratchWallE: [[-2, -2], [-2, -3]],
    scratchWallW: [[-4, 0], [-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]]
}

document.addEventListener('mousemove', e => {
    mousePosX = e.clientX
    mousePosY = e.clientY
})

function getSprite(name, frame) {
    return spriteSets[name][frame % spriteSets[name].length]
}

function setSprite(name, frame) {
    const sprite = getSprite(name, frame)
    oneko.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`
}

function frame() {
    frameCount += 1

    const diffX = nekoPosX - mousePosX
    const diffY = nekoPosY - mousePosY
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2)

    if (distance < nekoSpeed || distance < 48) {
        setSprite('idle', 0)
        return
    }

    let direction = ''
    if (diffY / distance > 0.5) direction += 'N'
    if (diffY / distance < -0.5) direction += 'S'
    if (diffX / distance > 0.5) direction += 'W'
    if (diffX / distance < -0.5) direction += 'E'
    setSprite(direction, frameCount)

    nekoPosX -= (diffX / distance) * nekoSpeed
    nekoPosY -= (diffY / distance) * nekoSpeed

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16)
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16)

    oneko.style.left = `${nekoPosX - 16}px`
    oneko.style.top = `${nekoPosY - 16}px`
}

setInterval(frame, 100)