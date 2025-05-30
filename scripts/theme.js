let themeValue = 0;
particleColors = ['rgb(204,147,253)', 'rgb(148,158,252)', 'rgb(178,122,248)'];

function toggleTheme() {
  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const body = document.querySelector("body");
  const mainGui = document.querySelector(".mainGui");

  themeValue = (themeValue === 1) ? 0 : 1;
  
  moon.classList.toggle("hidden");
  sun.classList.toggle("hidden");

  const isLight = moon.classList.contains("hidden");

  body.style.backgroundImage = isLight
    ? 'url("assets/backgrounds/light-background.webp")'
    : 'url("assets/backgrounds/dark-background.webp")';

  document.querySelectorAll('.mainGui').forEach(el => {
    el.style.borderColor = isLight ? '#615eff' : '#7900d6';
  });

  const favicon = document.getElementById("favicon");
  favicon.href = isLight
    ? "assets/objects/sun.webp"
    : "assets/objects/moon.webp";
}

