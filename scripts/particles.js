const particleSettings = {
  images: ['assets/blossom.png'],
  emissionRate: 3,
  startSize: { min: 5, max: 20 },
  endSize: 0,
  startOpacity: 1,
  endOpacity: 0,
  speed: { min: 0.5, max: 1 },
  spread: 360,
  rotationSpeed: { min: -2, max: 2 },
  lifeTime: 0.5
};

const eventConfig = {
  minTime: 60,
  maxTime: 180,
  cooldownTime: 30,
  events: {
    rain: 'rain',
    cloudy: 'cloudy',
    thunderstorm: 'thunderstorm'
  }
};

const particles = [];
const customRainParticles = [];
const customCloudParticles = [];
const lightningBolts = [];
const cloudImages = [];
const cloudImageSources = ['assets/event/cloud1.png'];
let cloudImagesLoaded = 0;
let rainSound = new Audio('assets/audio/rain.mp3');
rainSound.volume = 0.5;
rainSound.loop = true;
const thunderSounds = [
  new Audio('assets/audio/thunder1.mp3'),
  new Audio('assets/audio/thunder2.mp3')
];
thunderSounds.volume = 0.5;
let lastEvent = 'none';
let isOnCooldown = false;
let thunderstormActive = false;
let lightningTimer = 0;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

document.body.appendChild(canvas);
canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.zIndex = 9999;
canvas.style.pointerEvents = 'none';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * (particleSettings.startSize.max - particleSettings.startSize.min) + particleSettings.startSize.min;
    this.startSize = this.size;
    this.endSize = particleSettings.endSize;
    const angle = Math.random() * particleSettings.spread * (Math.PI / 180);
    const speed = Math.random() * (particleSettings.speed.max - particleSettings.speed.min) + particleSettings.speed.min;
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;
    this.opacity = particleSettings.startOpacity;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * (particleSettings.rotationSpeed.max - particleSettings.rotationSpeed.min) + particleSettings.rotationSpeed.min;
    this.lifeTime = particleSettings.lifeTime;
    this.age = 0;
    this.image = new Image();
    this.image.src = particleSettings.images[Math.floor(Math.random() * particleSettings.images.length)];
  }

  update(deltaTime) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.age += deltaTime;
    const t = this.age / this.lifeTime;
    this.opacity = particleSettings.startOpacity + t * (particleSettings.endOpacity - particleSettings.startOpacity);
    this.size = this.startSize + t * (this.endSize - this.startSize);
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

for (let src of cloudImageSources) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    cloudImagesLoaded++;
  };
  cloudImages.push(img);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createParticles(e) {
  const xPos = e.x;
  const yPos = e.y;
  for (let i = 0; i < particleSettings.emissionRate; i++) {
    particles.push(new Particle(xPos, yPos));
  }
}

function scheduleNextEvent() {
  const time = randomBetween(eventConfig.minTime, eventConfig.maxTime) * 1000;
  setTimeout(pickEvent, time);
}

function pickEvent() {
  if (isOnCooldown) {
    setEvent('none');
    scheduleNextEvent();
    return;
  }
  const eventKeys = Object.keys(eventConfig.events);
  const randomIndex = Math.floor(Math.random() * (eventKeys.length + 2));
  if (randomIndex >= eventKeys.length) {
    setEvent('none');
    scheduleNextEvent();
    return;
  }
  const eventName = eventKeys[randomIndex];
  if (eventName === lastEvent) {
    setEvent('none');
    scheduleNextEvent();
    return;
  }
  triggerEvent(eventName);
}

function triggerEvent(eventName) {
  setEvent(eventName);
  lastEvent = eventName;
  isOnCooldown = true;
  setTimeout(() => {
    isOnCooldown = false;
  }, eventConfig.cooldownTime * 1000);
  scheduleNextEvent();
}

function setEvent(eventName) {
  if (weatherMode === false) {return;}

  const display = document.getElementById('eventBarText');
  if (display) {
    display.textContent = eventName === 'none' ? 'Event: None' : 'Event: ' + capitalize(eventName);
  }
  clearWeatherEffects();
  if (eventName === 'rain') {
    startRain();
  } else if (eventName === 'cloudy') {
    startCloudy();
  } else if (eventName === 'thunderstorm') {
    startThunderstorm();
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearWeatherEffects() {
  stopRain();
  stopCloudy();
  stopThunderstorm();
}

function startRain() {
  customRainParticles.length = 0;
  for (let i = 0; i < 300; i++) {
    customRainParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 4 + 4,
      opacity: Math.random() * 0.5 + 0.5
    });
  }
  rainSound.currentTime = 0;
  rainSound.play();
}

function stopRain() {
  customRainParticles.length = 0;
  rainSound.pause();
  rainSound.currentTime = 0;
}

function updateRain(deltaTime) {
  ctx.strokeStyle = 'rgba(173,216,230,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < customRainParticles.length; i++) {
    const p = customRainParticles[i];
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + p.length);
    p.y += p.speed;
    if (p.y > canvas.height) {
      p.y = -p.length;
      p.x = Math.random() * canvas.width;
    }
  }
  ctx.stroke();
}

function startCloudy() {
  customCloudParticles.length = 0;
  for (let i = 0; i < 40; i++) {
    customCloudParticles.push({
      x: -Math.random() * 500,
      y: Math.random() * 150,
      size: Math.random() * 200 + 300,
      speed: Math.random() * 0.2 + 0.1,
      opacity: Math.random() * 0.2 + 0.7,
      image: cloudImages[Math.floor(Math.random() * cloudImages.length)]
    });
  }
}

function stopCloudy() {
  customCloudParticles.length = 0;
}

function updateCloudy(deltaTime) {
  if (cloudImagesLoaded !== cloudImageSources.length) return;
  for (let i = 0; i < customCloudParticles.length; i++) {
    const p = customCloudParticles[i];
    ctx.globalAlpha = p.opacity;
    ctx.drawImage(p.image, p.x, p.y, p.size, p.size * 0.6);
    ctx.globalAlpha = 1;
    p.x += p.speed;
    if (p.x > canvas.width + p.size) {
      p.x = -p.size - Math.random() * 500;
      p.y = Math.random() * 150;
      p.size = Math.random() * 200 + 300;
      p.speed = Math.random() * 0.2 + 0.1;
      p.opacity = Math.random() * 0.2 + 0.7;
      p.image = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    }
  }
}

function startThunderstorm() {
  startCloudy();
  startRain();
  thunderstormActive = true;
  lightningTimer = randomBetween(2000, 5000);
}

function stopThunderstorm() {
  thunderstormActive = false;
  lightningBolts.length = 0;
}

function updateThunderstorm(deltaTime) {
  if (!thunderstormActive) return;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let bolt of lightningBolts) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bolt[0].x, bolt[0].y);
    for (let point of bolt) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
  lightningTimer -= deltaTime * 1000;
  if (lightningTimer <= 0) {
    spawnLightning();
    lightningTimer = randomBetween(3000, 6000);
  }
}

function spawnLightning() {
  const bolt = [];
  let x = randomBetween(canvas.width * 0.2, canvas.width * 0.8);
  let y = 0;
  bolt.push({ x, y });
  while (y < canvas.height) {
    x += randomBetween(-20, 20);
    y += randomBetween(20, 40);
    bolt.push({ x, y });
  }
  lightningBolts.push(bolt);
  setTimeout(() => {
    thunderSounds[Math.floor(Math.random() * thunderSounds.length)].play();
  }, randomBetween(200, 500));
  setTimeout(() => {
    lightningBolts.shift();
  }, 300);
}

let lastTime = 0;

function mainAnimate(time) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (customRainParticles.length > 0) updateRain(deltaTime);
  if (customCloudParticles.length > 0) updateCloudy(deltaTime);
  if (thunderstormActive) updateThunderstorm(deltaTime);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update(deltaTime);
    particles[i].draw();
    if (particles[i].age >= particles[i].lifeTime) {
      particles.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(mainAnimate);
}

window.addEventListener('mousemove', createParticles);
scheduleNextEvent();
requestAnimationFrame(mainAnimate);
