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

  body.style.backgroundImage = moon.classList.contains("hidden")
    ? 'url("assets/backgrounds/light-background.gif")'
    : 'url("assets/backgrounds/dark-background.gif")';

  // mainGui.style.backgroundColor = moon.classList.contains("hidden") ? '#0400ffa8' : '#9493ffa8';
}

