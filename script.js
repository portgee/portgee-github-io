function toggleTheme() {
  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const body = document.querySelector("body");
  const about = document.getElementById("aboutMe")

  moon.classList.toggle("hidden");
  sun.classList.toggle("hidden");
  about.style.backgroundColor = moon.classList.contains("hidden")
    ? "#947BEC"
    : "black"

  body.style.backgroundImage = moon.classList.contains("hidden")
    ? 'url("assets/light-background.gif")'
    : 'url("assets/dark-background.gif")';
}
