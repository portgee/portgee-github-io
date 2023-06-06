function toggleTheme() {
  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const body = document.querySelector("body");
  const textStyle = document.getElementById("#textStyle");
  const about = document.getElementById("#aboutMe");

  moon.classList.toggle("hidden");
  sun.classList.toggle("hidden");

  textStyle.style.color = moon.classList.contains("hidden")
    ? "black"
    : "white"
  
  about.style.backgroundColor = moon.classList.contains("hidden")
    ? "#947BEC"
    : "black"

  body.style.backgroundImage = moon.classList.contains("hidden")
    ? 'url("assets/light-background.gif")'
    : 'url("assets/dark-background.gif")';
}
