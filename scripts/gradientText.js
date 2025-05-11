function supportsBackgroundClipText() {
  const testEl = document.createElement('div')
  testEl.style.webkitBackgroundClip = 'text'
  return testEl.style.webkitBackgroundClip === 'text'
}

let sharedGradientStyleInjected = false

function applyMovingGradient(element) {
  const colors = element.getAttribute('data-colors')?.split(',') || ['#ff00c8', '#1472ff', '#00ffd5', '#ff00c8']
  const angleAttr = element.getAttribute('data-angle') || '270'
  const speed = parseFloat(element.getAttribute('data-speed')) || 6
  const backgroundSize = element.getAttribute('data-background-size') || '200% 200%' // Reduced
  const easing = element.getAttribute('data-easing') || 'ease'

  const useClipText = supportsBackgroundClipText()

  if (angleAttr.toLowerCase() === 'rotate') {
    if (!element._rotateIntervalSet) {
      let angle = 0
      element._rotateIntervalSet = true
      setInterval(() => {
        angle = (angle + 1) % 360
        element.style.background = `linear-gradient(${angle}deg, ${colors.join(',')})`
        element.style.backgroundSize = backgroundSize
        if (useClipText) {
          element.style.webkitBackgroundClip = 'text'
          element.style.webkitTextFillColor = 'transparent'
        }
      }, speed * 5)
    }
  } else {
    if (!sharedGradientStyleInjected) {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes sharedGradientAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `
      document.head.appendChild(style)
      sharedGradientStyleInjected = true
    }

    const angle = parseFloat(angleAttr) || 270
    element.style.background = `linear-gradient(${angle}deg, ${colors.join(',')})`
    element.style.backgroundSize = backgroundSize
    element.style.animation = `sharedGradientAnim ${speed}s ${easing} infinite`
    if (useClipText) {
      element.style.webkitBackgroundClip = 'text'
      element.style.webkitTextFillColor = 'transparent'
    }
  }
}

window.applyMovingGradient = applyMovingGradient

window.addEventListener('load', () => {
  requestIdleCallback(() => {
    document.querySelectorAll('.animatedText').forEach(el => {
      applyMovingGradient(el)
    })
  }, { timeout: 1000 })
})
