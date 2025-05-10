let emojiMap = null;

async function loadEmojiMap() {
  if (emojiMap) return emojiMap;
  const res = await fetch('files/emojiMap.json');
  emojiMap = await res.json();
  return emojiMap;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createEmojiImg(name, url) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = `:${name}:`;
  img.className = 'emoji-inline';
  return img;
}

function replaceContentInContentEditable(el, map) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const container = range.startContainer;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const regex = /:([a-zA-Z0-9_]+):/g;
    let match;
    const matches = [];
    while ((match = regex.exec(node.textContent)) !== null) {
      const name = match[1];
      if (map[name]) {
        matches.push({ index: match.index, length: match[0].length, name });
      }
    }

    if (matches.length > 0) {
      let lastIndex = 0;
      const frag = document.createDocumentFragment();
      const text = node.textContent;

      for (const match of matches) {
        const before = text.slice(lastIndex, match.index);
        if (before) frag.appendChild(document.createTextNode(before));
        frag.appendChild(createEmojiImg(match.name, map[match.name]));
        lastIndex = match.index + match.length;
      }

      const after = text.slice(lastIndex);
      if (after) frag.appendChild(document.createTextNode(after));

      const parent = node.parentNode;
      parent.replaceChild(frag, node);
    }
  }
}

function replaceInInputs(el, map) {
  const regex = /:([a-zA-Z0-9_]+):/g;
  el.value = el.value.replace(regex, (match, name) => {
    return map[name] ? '🔹' : match; // placeholder for emoji
  });
}

function handleTyping(map) {
  document.body.addEventListener('input', e => {
    const el = e.target;
    if (el.isContentEditable) {
      replaceContentInContentEditable(el, map);
    } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      replaceInInputs(el, map);
    }
  });
}

function replaceStaticTextNodes(map) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const regex = /:([a-zA-Z0-9_]+):/g;
  const nodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentNode && !node.parentNode.closest('script, style, textarea')) {
      nodes.push(node);
    }
  }

  for (const node of nodes) {
    let match;
    const matches = [];
    const text = node.textContent;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1];
      if (map[name]) {
        matches.push({ index: match.index, length: match[0].length, name });
      }
    }

    if (matches.length > 0) {
      let lastIndex = 0;
      const frag = document.createDocumentFragment();
      for (const match of matches) {
        const before = text.slice(lastIndex, match.index);
        if (before) frag.appendChild(document.createTextNode(before));
        frag.appendChild(createEmojiImg(match.name, map[match.name]));
        lastIndex = match.index + match.length;
      }
      const after = text.slice(lastIndex);
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    }
  }
}

async function startEmojiLiveReplacement() {
  const map = await loadEmojiMap();
  replaceStaticTextNodes(map);
  handleTyping(map);
}

function replaceEmojisInElement(el, map) {
  const regex = /:([a-zA-Z0-9_]+):/g;
  let match;
  const matches = [];
  const text = el.innerText;

  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    if (map[name]) {
      matches.push({ index: match.index, length: match[0].length, name });
    }
  }

  if (matches.length > 0) {
    let lastIndex = 0;
    const frag = document.createDocumentFragment();

    for (const match of matches) {
      const before = text.slice(lastIndex, match.index);
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(createEmojiImg(match.name, map[match.name]));
      lastIndex = match.index + match.length;
    }

    const after = text.slice(lastIndex);
    if (after) frag.appendChild(document.createTextNode(after));

    el.innerHTML = '';
    el.appendChild(frag);
  }
}


startEmojiLiveReplacement();
window.replaceEmojisInElement = replaceEmojisInElement
