const lootboxArea = document.getElementById('lootboxArea')

const items = [
  { name: 'Cute Skirt', rarity: 'common', img: 'cute_skirt.webp' },
  { name: 'Fluffy Ears', rarity: 'common', img: 'fluffy_ears.webp' },
  { name: 'Bunny Slippers', rarity: 'common', img: 'bunny_slippers.webp' },
  { name: 'Heart Choker', rarity: 'common', img: 'heart_choker.webp' },
  { name: 'Pink Hoodie', rarity: 'common', img: 'pink_hoodie.webp' },
  { name: 'Mini Skirt', rarity: 'common', img: 'mini_skirt.webp' },
  { name: 'Oversized Sweater', rarity: 'common', img: 'oversized_sweater.webp' },
  { name: 'Star Hairclip', rarity: 'common', img: 'star_hairclip.webp' },
  { name: 'Frilly Socks', rarity: 'common', img: 'frilly_socks.webp' },
  { name: 'Paw Gloves', rarity: 'common', img: 'paw_gloves.webp' },
  { name: 'Cat Tail', rarity: 'common', img: 'cat_tail.webp' },
  { name: 'Lace Arm Warmers', rarity: 'common', img: 'lace_arm_warmers.webp' },
  { name: 'Strawberry Clip', rarity: 'common', img: 'strawberry_clip.webp' },
  { name: 'Crop Top', rarity: 'common', img: 'crop_top.webp' },
  { name: 'Fluffy Scarf', rarity: 'common', img: 'fluffy_scarf.webp' },
  { name: 'Moon Earrings', rarity: 'common', img: 'moon_earrings.webp' },
  { name: 'Cute Glasses', rarity: 'common', img: 'cute_glasses.webp' },
  { name: 'Starry Tights', rarity: 'common', img: 'starry_tights.webp' },
  { name: 'Monster Energy', rarity: 'rare', img: 'monster_energy.webp' },
  { name: 'Pink Stockings', rarity: 'rare', img: 'pink_stockings.jpg' },
  { name: 'Thigh High Boots', rarity: 'rare', img: 'thigh_high_boots.webp' },
  { name: 'Bunny Outfit', rarity: 'rare', img: 'bunny_outfit.webp' },
  { name: 'Silky Gloves', rarity: 'rare', img: 'silky_gloves.webp' },
  { name: 'Neko Ears Headband', rarity: 'rare', img: 'neko_ears_headband.webp' },
  { name: 'Cat Collar', rarity: 'rare', img: 'cat_collar.webp' },
  { name: 'Fluffy Tail Plug', rarity: 'rare', img: 'fluffy_tail_plug.webp' },
  { name: 'Garter Belt', rarity: 'rare', img: 'garter_belt.webp' },
  { name: 'Femboy Panties', rarity: 'epic', img: 'femboy_panties.webp' },
  { name: 'Catboy Hoodie', rarity: 'epic', img: 'catboy_hoodie.webp' },
  { name: 'Cinnamoroll Plushie', rarity: 'epic', img: 'cinnamoroll_plushie.webp' },
  { name: 'Fishnets', rarity: 'epic', img: 'fishnets.webp' },
  { name: 'Blahaj', rarity: 'legendary', img: 'blahaj.webp' },
  { name: 'Dildo', rarity: 'legendary', img: 'dildo.webp' }
]

const rarityColors = {
  common: '#ffc0cb',
  rare: '#ff69b4',
  epic: '#db4bc4',
  legendary: '#bf00ff',
  mythical: '#00fff2'
}

let inventory = {}
let busy = false
let lastWinningIndex = null
let lastItemWidth = null

function createLootboxUI() {
  lootboxArea.innerHTML = `
    <div style="background:linear-gradient(to bottom,#ffe4f7,#ffe1f2);padding:20px;border-radius:20px;max-width:800px;margin:20px auto;box-shadow:0 0 20px #ff69b4;">
      <h1 style="font-family:Comic Sans MS, cursive;text-align:center;color:#ff69b4;">Femboy Lootbox</h1>
      <div id="rollContainer" style="overflow:hidden;height:100px;width:90%;background:white;border:3px solid #ff69b4;border-radius:15px;margin:20px auto;position:relative;">
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
  else if (chance < 0.995) pool = items.filter(i => i.rarity === 'legendary')
  else pool = items.filter(i => i.rarity === 'mythical')
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : items[Math.floor(Math.random() * items.length)]
}

function openCrate() {
  if (busy) return
  busy = true
  const openButton = document.getElementById('openCrate')
  const strip = document.getElementById('itemStrip')
  const rollContainer = document.getElementById('rollContainer')
  openButton.disabled = true
  openButton.style.opacity = 0.6
  strip.innerHTML = ''
  strip.style.transition = 'none'
  strip.style.left = '0px'

  const extraBefore = 20, extraAfter = 10
  const rollItems = Array.from({ length: extraBefore }, () => items[Math.floor(Math.random() * items.length)])
  const winningItem = getRandomItem()
  rollItems.push(winningItem, ...Array.from({ length: extraAfter }, () => items[Math.floor(Math.random() * items.length)]))

  for (const it of rollItems) {
    const div = document.createElement('div')
    Object.assign(div.style, {
      background: rarityColors[it.rarity] || '#ccc',
      width: '100px',
      height: '100px',
      margin: '0 3px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '0'
    })
    const img = document.createElement('img')
    Object.assign(img, {
      src: 'assets/lootbox/' + it.img,
      style: 'width:80px;height:80px;border-radius:10px;display:block'
    })
    div.appendChild(img)
    strip.appendChild(div)
  }

  requestAnimationFrame(() => {
    const itemWidth = strip.firstChild.offsetWidth + 6
    lastItemWidth = itemWidth
    const spinDuration = 3.5 + Math.random() * 1.5
    strip.style.transition = `left ${spinDuration}s cubic-bezier(0.25, 1, 0.5, 1)`
    const centerOffset = (rollContainer.offsetWidth / 2) - (itemWidth / 2)
    lastWinningIndex = extraBefore
    const finalLeft = (lastWinningIndex * itemWidth - centerOffset) * -1
    strip.style.left = `${finalLeft}px`

    setTimeout(() => {
      addToInventory(winningItem)
      busy = false
      openButton.disabled = false
      openButton.style.opacity = 1
    }, spinDuration * 1000)
  })
}

function addToInventory(item) {
  if (!item || !item.name) return
  if (!inventory[item.name]) {
    inventory[item.name] = { ...item, amount: 1 }
  } else {
    inventory[item.name].amount++
  }
  saveInventory()
  updateInventory()
}

function updateInventory() {
  const inv = document.getElementById('inventory')
  inv.innerHTML = ''
  const order = { common: 1, rare: 2, epic: 3, legendary: 4 }
  const sorted = Object.values(inventory).sort((a, b) =>
    order[a.rarity] !== order[b.rarity]
      ? order[a.rarity] - order[b.rarity]
      : a.name.localeCompare(b.name)
  )
  for (const entry of sorted) {
    const div = document.createElement('button')
    Object.assign(div.style, {
      background: `linear-gradient(135deg, ${rarityColors[entry.rarity]}, #ffe4f7)`,
      width: '100px',
      height: '100px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      boxShadow: '0 0 10px #ff69b4',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    })
    div.onmouseover = () => {
      div.style.transform = 'scale(1.1)'
      div.style.boxShadow = '0 0 20px #ff69b4'
    }
    div.onmouseout = () => {
      div.style.transform = 'scale(1)'
      div.style.boxShadow = '0 0 10px #ff69b4'
    }
    div.onclick = () => openImageFullscreen('assets/lootbox/' + entry.img)

    const img = document.createElement('img')
    Object.assign(img, {
      src: 'assets/lootbox/' + entry.img,
      style: 'width:60px;height:60px;border-radius:12px;display:block'
    })

    const amount = document.createElement('div')
    amount.innerText = 'x' + entry.amount
    amount.style = 'font-size:14px;color:white'

    div.appendChild(img)
    div.appendChild(amount)
    inv.appendChild(div)
  }
}

function saveInventory() {
  CookieManager.set('inventory', JSON.stringify(inventory), { path: '/', expires: 31536000 })
}

function loadInventory() {
  const data = CookieManager.get('inventory')
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed === 'object') inventory = parsed
    } catch {}
    updateInventory()
  }
}

createLootboxUI()
loadInventory()

window.addEventListener('resize', () => {
  if (lastWinningIndex === null || lastItemWidth === null) return
  const strip = document.getElementById('itemStrip')
  const rollContainer = document.getElementById('rollContainer')
  const centerOffset = (rollContainer.offsetWidth / 2) - (lastItemWidth / 2)
  const finalLeft = (lastWinningIndex * lastItemWidth - centerOffset) * -1
  strip.style.transition = 'none'
  strip.style.left = `${finalLeft}px`
})