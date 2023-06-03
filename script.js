function toggleTheme() {
  const sun = document.querySelector('.sun');
  const moon = document.querySelector('.moon');
  const body = document.querySelector('body');
 
  if (moon.classList.contains('hidden')) {
    moon.classList.remove('hidden');
    sun.classList.add('hidden');
    body.style.backgroundImage = 'url("assets/dark-background.gif")';
  } else {
    moon.classList.add('hidden');
    sun.classList.remove('hidden');
    body.style.backgroundImage = 'url("assets/light-background.gif")';
  }
}