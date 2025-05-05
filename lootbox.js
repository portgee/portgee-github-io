const lootboxArea = document.getElementById('lootboxArea')

const items = [
  { name: 'Cute Skirt', rarity: 'common', img: 'cute_skirt.png' },
  { name: 'Fluffy Ears', rarity: 'common', img: 'fluffy_ears.png' },
  { name: 'Bunny Slippers', rarity: 'common', img: 'bunny_slippers.png' },
  { name: 'Heart Choker', rarity: 'common', img: 'heart_choker.png' },
  { name: 'Pink Hoodie', rarity: 'common', img: 'pink_hoodie.png' },
  { name: 'Mini Skirt', rarity: 'common', img: 'mini_skirt.png' },
  { name: 'Oversized Sweater', rarity: 'common', img: 'oversized_sweater.png' },
  { name: 'Star Hairclip', rarity: 'common', img: 'star_hairclip.png' },
  { name: 'Frilly Socks', rarity: 'common', img: 'frilly_socks.png' },
  { name: 'Paw Gloves', rarity: 'common', img: 'paw_gloves.png' },
  { name: 'Cat Tail', rarity: 'common', img: 'cat_tail.png' },
  { name: 'Lace Arm Warmers', rarity: 'common', img: 'lace_arm_warmers.png' },
  { name: 'Strawberry Clip', rarity: 'common', img: 'strawberry_clip.png' },
  { name: 'Crop Top', rarity: 'common', img: 'crop_top.png' },
  { name: 'Fluffy Scarf', rarity: 'common', img: 'fluffy_scarf.png' },
  { name: 'Moon Earrings', rarity: 'common', img: 'moon_earrings.png' },
  { name: 'Cute Glasses', rarity: 'common', img: 'cute_glasses.png' },
  { name: 'Starry Tights', rarity: 'common', img: 'starry_tights.png' },
  { name: 'Monster Energy', rarity: 'rare', img: 'monster_energy.png' },
  { name: 'Pink Stockings', rarity: 'rare', img: 'pink_stockings.jpg' },
  { name: 'Thigh High Boots', rarity: 'rare', img: 'thigh_high_boots.png' },
  { name: 'Bunny Outfit', rarity: 'rare', img: 'bunny_outfit.png' },
  { name: 'Silky Gloves', rarity: 'rare', img: 'silky_gloves.png' },
  { name: 'Neko Ears Headband', rarity: 'rare', img: 'neko_ears_headband.png' },
  { name: 'Cat Collar', rarity: 'rare', img: 'cat_collar.png' },
  { name: 'Fluffy Tail Plug', rarity: 'rare', img: 'fluffy_tail_plug.png' },
  { name: 'Garter Belt', rarity: 'rare', img: 'garter_belt.png' },
  { name: 'Femboy Panties', rarity: 'epic', img: 'femboy_panties.png' },
  { name: 'Catboy Hoodie', rarity: 'epic', img: 'catboy_hoodie.png' },
  { name: 'Cinnamoroll Plushie', rarity: 'epic', img: 'cinnamoroll_plushie.png' },
  { name: 'Fishnets', rarity: 'epic', img: 'fishnets.png' },
  { name: 'Blahaj', rarity: 'legendary', img: 'blahaj.gif' },
  { name: 'Dildo', rarity: 'legendary', img: 'dildo.png' }
]

const rarityColors = {
  common: '#ffc0cb',
  rare: '#ff69b4',
  epic: '#db4bc4',
  legendary: '#bf00ff'
}

let inventory = {}
let busy = false

function createLootboxUI() {
  lootboxArea.innerHTML = `
    <div style="background:linear-gradient(to bottom,#ffe4f7,#ffe1f2);padding:20px;border-radius:20px;max-width:800px;margin:20px auto;box-shadow:0 0 20px #ff69b4;">
      <h2 style="font-family:Comic Sans MS, cursive;text-align:center;color:#ff69b4;">Femboy Lootbox</h2>
      <div id="rollContainer" style="overflow:hidden;height:120px;width:720px;background:white;border:3px solid #ff69b4;border-radius:15px;margin:20px auto;position:relative;">
        <div id="itemStrip" style="display:flex;position:absolute;left:0;top:0;height:100%;transition:left 4s cubic-bezier(0.25, 1, 0.5, 1);"></div>
      </div>
      <div style="text-align:center;margin-top:15px;">
        <button id="openCrate" style="padding:15px 40px;background:#ff69b4;border:none;border-radius:30px;color:white;font-size:22px;font-weight:bold;cursor:pointer;box-shadow:0 5px #bf00ff;transition:transform 0.2s,box-shadow 0.2s;">Open Lootbox 💖</button>
      </div>
      <h2 style="font-family:Comic Sans MS, cursive;text-align:center;color:#ff69b4;margin-top:40px;">Inventory</h2>
      <div id="inventory" style="display:flex;flex-wrap:wrap;gap:15px;justify-content:center;padding:10px;"></div>
    </div>
  `
  document.getElementById('openCrate').addEventListener('click', openCrate)
}

function getRandomItem() {
  const chance = Math.random()
  let pool = []
  if (chance < 0.6) pool = items.filter(i => i.rarity === 'common')
  else if (chance < 0.85) pool = items.filter(i => i.rarity === 'rare')
  else if (chance < 0.98) pool = items.filter(i => i.rarity === 'epic')
  else pool = items.filter(i => i.rarity === 'legendary')
  if (!pool.length) pool = items
  return pool[Math.floor(Math.random() * pool.length)]
}

function openCrate() {
  if (busy) return
  busy = true
  const openButton = document.getElementById('openCrate')
  openButton.disabled = true
  openButton.style.opacity = 0.6
  const strip = document.getElementById('itemStrip')
  strip.innerHTML = ''
  strip.style.transition = 'none'
  strip.style.left = '0px'
  const itemWidth = 106
  const visibleItems = 6
  const extraBefore = 20
  const extraAfter = 10
  const rollItems = []
  for (let i = 0; i < extraBefore; i++) {
    rollItems.push(items[Math.floor(Math.random() * items.length)])
  }
  const winningItem = getRandomItem()
  if (!winningItem) {
    busy = false
    openButton.disabled = false
    openButton.style.opacity = 1
    return
  }
  rollItems.push(winningItem)
  for (let i = 0; i < extraAfter; i++) {
    rollItems.push(items[Math.floor(Math.random() * items.length)])
  }
  for (const it of rollItems) {
    const div = document.createElement('div')
    div.style.background = rarityColors[it.rarity] || '#ccc'
    div.style.width = '100px'
    div.style.height = '100px'
    div.style.margin = '0 3px'
    div.style.borderRadius = '12px'
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    const img = document.createElement('img')
    img.src = 'assets/lootbox/' + it.img
    img.style.width = '80px'
    img.style.height = '80px'
    img.style.borderRadius = '10px'
    div.appendChild(img)
    strip.appendChild(div)
  }
  setTimeout(() => {
    strip.style.transition = 'left 4s cubic-bezier(0.25, 1, 0.5, 1)'
    const winningIndex = extraBefore
    const finalIndex = winningIndex - Math.floor(visibleItems / 2)
    strip.style.left = `-${finalIndex * itemWidth}px`
  }, 50)
  setTimeout(() => {
    addToInventory(winningItem)
    busy = false
    openButton.disabled = false
    openButton.style.opacity = 1
  }, 4000)
}

function addToInventory(item) {
  if (!item || !item.name) return
  if (!inventory[item.name]) {
    inventory[item.name] = { name: item.name, img: item.img, rarity: item.rarity, amount: 1 }
  } else {
    inventory[item.name].amount += 1
  }
  saveInventory()
  updateInventory()
}

function updateInventory() {
  const inv = document.getElementById('inventory')
  inv.innerHTML = ''
  const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
  const sorted = Object.values(inventory).sort((a, b) => {
    if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
      return rarityOrder[a.rarity] - rarityOrder[b.rarity]
    }
    return a.name.localeCompare(b.name)
  })
  for (const entry of sorted) {
    if (!entry || !entry.name || !entry.img || !entry.rarity) continue
    const div = document.createElement('button')
    div.style.background = `linear-gradient(135deg, ${rarityColors[entry.rarity]}, #ffe4f7)`
    div.style.width = '100px'
    div.style.height = '100px'
    div.style.borderRadius = '20px'
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    div.style.flexDirection = 'column'
    div.style.boxShadow = '0 0 10px #ff69b4'
    div.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'
    div.onmouseover = () => {
      div.style.transform = 'scale(1.1)'
      div.style.boxShadow = '0 0 20px #ff69b4'
    }
    div.onmouseout = () => {
      div.style.transform = 'scale(1)'
      div.style.boxShadow = '0 0 10px #ff69b4'
    }
    div.onclick = () => {
      openImageFullscreen('assets/lootbox/' + entry.img)
    }
    const img = document.createElement('img')
    img.src = 'assets/lootbox/' + entry.img
    img.style.width = '60px'
    img.style.height = '60px'
    img.style.borderRadius = '12px'
    const amount = document.createElement('div')
    amount.innerText = 'x' + entry.amount
    amount.style.fontSize = '14px'
    amount.style.color = 'white'
    div.appendChild(img)
    div.appendChild(amount)
    inv.appendChild(div)
  }
}

function saveInventory() {
  document.cookie = 'inventory=' + encodeURIComponent(JSON.stringify(inventory)) + '; path=/; max-age=31536000'
}

function loadInventory() {
  const cookies = document.cookie.split('; ')
  const inventoryCookie = cookies.find(row => row.startsWith('inventory='))
  if (inventoryCookie) {
    const data = decodeURIComponent(inventoryCookie.split('=')[1])
    try {
      const parsed = JSON.parse(data)
      if (typeof parsed === 'object' && parsed !== null) inventory = parsed
    } catch {}
    updateInventory()
  }
}

createLootboxUI()
loadInventory()
