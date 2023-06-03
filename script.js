function toggleTheme() {
  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const body = document.querySelector("body");

  moon.classList.toggle("hidden");
  sun.classList.toggle("hidden");
  body.style.backgroundImage = moon.classList.contains("hidden")
    ? 'url("assets/light-background.gif")'
    : 'url("assets/dark-background.gif")';
}
