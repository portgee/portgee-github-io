function applyMovingGradient(element) {
    const colors = element.getAttribute('data-colors')?.split(',') || ['#ff00c8', '#1472ff', '#00ffd5', '#ff00c8'];
    const angleAttr = element.getAttribute('data-angle') || '270';
    const speed = parseFloat(element.getAttribute('data-speed')) || 6;
    const backgroundSize = element.getAttribute('data-background-size') || '800% 800%';
    const easing = element.getAttribute('data-easing') || 'ease';

    const gradientId = 'gradientAnim_' + Math.random().toString(36).substring(2, 9);
    const style = document.createElement('style');

    if (angleAttr.toLowerCase() === 'rotate') {
        let angle = 0;
        setInterval(() => {
            angle = (angle + 1) % 360;
            element.style.background = `linear-gradient(${angle}deg, ${colors.join(',')})`;
            element.style.backgroundSize = backgroundSize;
            element.style.webkitBackgroundClip = 'text';
            element.style.webkitTextFillColor = 'transparent';
        }, speed * 3);
    } else {
        const angle = parseFloat(angleAttr) || 270;
        style.innerHTML = `
            @keyframes ${gradientId} {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);

        element.style.background = `linear-gradient(${angle}deg, ${colors.join(',')})`;
        element.style.backgroundSize = backgroundSize;
        element.style.animation = `${gradientId} ${speed}s ${easing} infinite`;
        element.style.webkitBackgroundClip = 'text';
        element.style.webkitTextFillColor = 'transparent';
    }
}

document.querySelectorAll('.animatedText').forEach(applyMovingGradient);
window.applyMovingGradient = applyMovingGradient
