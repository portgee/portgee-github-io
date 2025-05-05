let notificationQueue = [];
let notificationShowing = false;

const SettingsManager = {
  defaults: {
    toggleValBackground: true,
    weatherMode: true
  },
  settings: {},
  listeners: {},
  load() {
    const cookie = CookieManager.get('settings');
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        this.settings = { ...this.defaults, ...parsed };
      } catch {
        this.settings = { ...this.defaults };
      }
    } else {
      this.settings = { ...this.defaults };
    }
  },
  save() {
    CookieManager.set('settings', JSON.stringify(this.settings), { path: '/', expires: 31536000 });
  },
  proxy() {
    this.settings = new Proxy(this.settings, {
      set: (obj, prop, value) => {
        if (obj[prop] !== value) {
          obj[prop] = value;
          this.save();
          this.applyChange(prop, value);
        }
        return true;
      }
    });
  },
  applyChange(prop, value) {
    const listener = this.listeners[prop];
    if (Array.isArray(listener)) {
      listener.forEach(fn => fn(value));
    } else if (typeof listener === 'function') {
      listener(value);
    }
  },
  onChange(prop, callback) {
    if (!this.listeners[prop]) this.listeners[prop] = [];
    if (!Array.isArray(this.listeners[prop])) this.listeners[prop] = [this.listeners[prop]];
    this.listeners[prop].push(callback);
  },
  injectGlobals() {
    Object.keys(this.defaults).forEach(key => {
      if (!(key in window)) {
        Object.defineProperty(window, key, {
          get: () => this.settings[key],
          set: (val) => { this.settings[key] = val },
          configurable: true
        });
      }
    });
  },
  initialize() {
    this.load();
    this.proxy();
    this.injectGlobals();
    this.applyAll();
  },
  applyAll() {
    Object.keys(this.settings).forEach(key => {
      this.applyChange(key, this.settings[key]);
    });
  }
};

function toggleBackground(forceState) {
  if (typeof forceState === 'boolean') {
    SettingsManager.settings.toggleValBackground = forceState;
  }

  if (SettingsManager.settings.toggleValBackground === true) {
    showNotification("Background particles enabled", "lime", 2000);
  } else {
    showNotification("Background particles disabled", "red", 2000);
  }

  return;
}

function toggleWeather(forceState) {
  if (typeof forceState === 'boolean') {
    SettingsManager.settings.weatherMode = forceState;
  }
  if (SettingsManager.settings.weatherMode === true) {
    showNotification("Weather enabled", "lime", 2000);
  } else {
    if (typeof setEvent === 'function') {
      setEvent("none");
    }
    showNotification("Weather disabled", "red", 2000);
  }

  return;
}

SettingsManager.onChange('toggleValBackground', toggleBackground);
SettingsManager.onChange('weatherMode', toggleWeather);

SettingsManager.initialize();

function toggleWeatherSetting() {
  SettingsManager.settings.weatherMode = !SettingsManager.settings.weatherMode;
}

function toggleBackgroundSetting() {
  SettingsManager.settings.toggleValBackground = !SettingsManager.settings.toggleValBackground;
}

function showNotification(message, color = 'white', time = 2000) {
  notificationQueue.push({ message, color, time });
  if (!notificationShowing) {
    processQueue();
  }
}

function processQueue() {
  if (notificationQueue.length === 0) {
    notificationShowing = false;
    return;
  }
  notificationShowing = true;
  const { message, color, time } = notificationQueue.shift();
  const notif = document.createElement('div');
  notif.className = 'notificationDiv mainGui';
  notif.innerText = message;
  notif.style.color = color;
  notif.style.transition = 'top 0.7s ease';
  document.body.appendChild(notif);
  void notif.offsetWidth;
  notif.style.top = '-60px';
  setTimeout(() => {
    notif.style.top = '-200px';
    setTimeout(() => {
      notif.remove();
      processQueue();
    }, 500);
  }, time);
}

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

function clearItems() {
  const playground = document.getElementById('itemPlayground');
  if (playground) {
    playground.innerHTML = '';
  }
}
