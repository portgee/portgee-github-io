const characters = ["⭐", "🌟", "✨", "💫", ":freddyPlushie:", "🪐", "🌙", ":AstolfoPlushie:", ":catplush:"];

function createEmojiImg(name, url) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = `:${name}:`;
  img.className = 'emoji-inline';
  img.style.position = 'fixed';
  img.style.width = (Math.random() * 40 + 25) + 'px';
  img.style.height = 'auto';
  img.style.zIndex = 1;
  return img;
}

async function spawnItem() {
  const map = await loadEmojiMap();
  const itemVal = characters[Math.floor(Math.random() * characters.length)];
  const isCustomEmoji = /^:([a-zA-Z0-9_]+):$/.test(itemVal);
  const item = isCustomEmoji
    ? createEmojiImg(itemVal.slice(1, -1), map[itemVal.slice(1, -1)])
    : document.createElement('div');

item.className = 'backgroundItem';
  if (!isCustomEmoji) {
    item.textContent = itemVal;
    item.style.fontSize = (Math.random() * 40 + 25) + 'px';
    item.style.fontFamily = 'Poppins';
    item.style.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
  }

  item.style.position = 'fixed';
  item.style.top = Math.random() * window.innerHeight + 'px';
  item.style.left = Math.random() * window.innerWidth + 'px';

  document.body.appendChild(item);
  setTimeout(() => item.remove(), 3000);
}

setInterval(spawnItem, 50);