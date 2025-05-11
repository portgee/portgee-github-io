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
  const backgroundSize = element.getAttribute('data-background-size') || '800% 800%'
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
      }, speed * 3)
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
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        applyMovingGradient(entry.target)
        obs.unobserve(entry.target)
      }
    })
  }, { rootMargin: '0px 0px 200px 0px' })

  document.querySelectorAll('.animatedText').forEach(el => observer.observe(el))
})
