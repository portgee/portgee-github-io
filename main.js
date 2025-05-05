function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
function toggleMusic() {
const music = document.getElementById('background-music');
if (music) {
    music.muted = !music.muted;
}
}

function togglePet() {
const oneko = document.getElementById('oneko');
if (oneko) {
    oneko.style.display = (oneko.style.display === 'none') ? 'block' : 'none';
}
}

function clearItems() {
const playground = document.getElementById('itemPlayground');
if (playground) {
    playground.innerHTML = '';
}
}