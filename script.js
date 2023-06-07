let themeTog = 0;
let particleColors = ['rgb(204,147,253)', 'rgb(148,158,252)', 'rgb(178,122,248)'];

function toggleTheme() {
  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const body = document.querySelector("body");
  const textStyle = document.getElementsByClassName("textStyle");
  const sideBar = document.getElementById("sideBar");
  const aboutMe = document.getElementById("aboutMe");

  if (themeTog === 1) {
    themeTog = 0;
    particleColors = ['rgb(204,147,253)', 'rgb(148,158,252)', 'rgb(178,122,248)'];
  } else {
    themeTog = 1;
    particleColors = particleColors.map(color => darkenColor(color));
  }

  moon.classList.toggle("hidden");
  sun.classList.toggle("hidden");

  for (let i = 0; i < textStyle.length; i++) {
    textStyle[i].style.color = moon.classList.contains("hidden") ? "black" : "white";
  }

  aboutMe.style.backgroundColor = moon.classList.contains("hidden") ? "#947BEC" : "#0d0d0d";

  sideBar.style.backgroundColor = moon.classList.contains("hidden") ? "#947BEC" : "#0d0d0d";

  body.style.backgroundImage = moon.classList.contains("hidden")
    ? 'url("assets/light-background.gif")'
    : 'url("assets/dark-background.gif")';
}

function darkenColor(color) {
  const rgbComponents = color.replace(/[^\d,]/g, '').split(',');
  const darkenedComponents = rgbComponents.map(component => Math.floor(parseInt(component) * 0.7));
  return `rgb(${darkenedComponents.join(',')})`;
}

const particles = [];
const particleCount = 12;
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
    this.opacity = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.01;
    if (this.size > 0.2) this.size -= 0.1;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function createParticles(e) {
  const xPos = e.x;
  const yPos = e.y;

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(xPos, yPos));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].size <= 0.2 || particles[i].opacity <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

document.body.appendChild(canvas);

canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.zIndex = -1;
canvas.style.pointerEvents = 'none';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', createParticles);

animateParticles();
