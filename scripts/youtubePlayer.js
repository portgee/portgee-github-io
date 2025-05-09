const videoIds = [
    "yA_h7zM0bcU",
    "vOt2u7WcV9A",
    "DaDa2LnqwIg",
    "eji-E3u7VRs",
    "2t1NMRse6aI",
    "kQoVIfrms2I",
    "ZNGqBDRJgvo",
    "3im2QtZuBEw",
    "fPjrzzSfCLk",
    "VWVtIg5cdDU",
    "kagoEGKHZvU",
    "-12Cmdypuvk",
    "Kc4wBKAMEVQ",
    "khNi_6PnvaE",
    "AS4q9yaWJkI",
    "hKsWAKuUn4E",
    "jmh079nN6Jg",
    "aGvVbV1NEP8",
    "M32NcztJfaY",
    "xLatvilg68w",
    "_rSkB86ih7w",
    "IRtLyIWBRpA",
    "IkbrbDhGOJA",
    "-bt0IP16PZI",
    "SDt2OOdWR-Y",
    "JeXFDfVCcq4",
    "2hyD8v0FZFc",
    "S7p0ZpuZ-j0",
    "_X-u0CtiToc",
    "ZA6stXgqEFg",
    "JUe0sOn5kDY",
    "lOP_yrVuBpo",
    "TUEZFuPbdZ4",
    "Kv5-7kTp9m8",
    "1WD6Xlm4vvY",
    "f0-lBdCbHm4",
    "V9baXCr--yw",
    "cRFSbeHXFwk",
    "cDTciaRNuBY",
    "j6ihnPpvlzM",
    "SZcilh-cZXE",
    "BMd9TA-OKWs",
    "k_WT2x9we0Q",
    "h1_rC9_A8Pc",
    "2CVeEAobs4I",
    "_eXtaiPQgqA",
    "kbNdx0yqbZE",
    "bI3542HJRzY",
    "MDqvUzdOR0Q",
    "JqOYeX3jhoA",
    "by_dL99tndw",
    "TWshSiGS2ws",
    "PygmgjKQafg",
    "LaEgpNBt-bQ",
    "R6Uh1Qqflzc",
    "vg1ofaFeM-M",
    "MDqvUzdOR0Q",
    "rHGqpqSvoYg",
    "F9w19EzgNZ4",
    "2b1IexhKPz4",
    "qQT_TVWIlPs",
    "AH8fvO_dgOs",
    "Sz_IUYCzJpo",
    "klIxS5o65C4",
    "bIuXGJaJZyM",
    "4w8qND6bdhU",
    "DDZtUUVJ0yc",
    "Kybi1q3rjdk",
    "izToCCeLnNA",
    "LS2IShlCb54",
    "iXaM-ZXpT8s",
    "_AjJZEcMdww",
    "O2GxrLWbwlY",
    "9UjVQPtOpgs",
    "uB_kB8YIDyk",
    "dDlljvDSLSg",
    "1Esz9ONM9X8",
    "_pKPFpX7Cqk",
    "rKkKdLQxBFs",
    "8EfHnLBfHfg",
    "KRVFPPYcJUc",
    "GPFSl6wOoWo",
    "zTbRr1dH9Fo",
    "VpWPn7-5qRA",
    "OHcNQHbWrFY",
    "QyTb39DQ6l4",
    "4SFY9h3tBK4",
    "SoKLSIXccgU",
    "YmD-Qv5XRrs",
    "3dWZUupPnZU",
    "FwV2PC5A86I",
    "bLJhz8dIRCc",
    "gtodYcC1nrc",
    "E9mIzgDVTG8",
    "glbmprjG3zw",
    "5BKIzI-YqQc",
    "H7Ruj4AnpSo",
  ];
  
  
  let currentIndex = Math.floor(Math.random() * videoIds.length);
  let player;
  let isPlaying = false;
  let progressUpdater;
  let volume = 50;
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
      height: "100%",
      width: "100%",
      videoId: videoIds[currentIndex],
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  }
  
  function onPlayerReady() {
    const playBtn = document.getElementById("playPause");
    const volumeSlider = document.getElementById("volumeSlider");
    const progressBar = document.getElementById("progressBar");
    const previewTime = document.getElementById("previewTime");
  
    player.setVolume(volume);
  
    playBtn.addEventListener("click", togglePlay);
  
    volumeSlider.addEventListener("input", (e) => {
      volume = parseInt(e.target.value);
      player.setVolume(volume);
    });
  
    progressBar.addEventListener("input", (e) => {
      const duration = player.getDuration();
      const seekTime = duration * (e.target.value / 100);
      player.seekTo(seekTime, true);

      if (previewTime != null) {
      previewTime.textContent = formatTime(seekTime);
      }
    });
  
    progressUpdater = setInterval(() => {
      if (player && player.getDuration) {
        const current = player.getCurrentTime();
        const duration = player.getDuration();
        const progress = (current / duration) * 100;

        progressBar.value = progress;
        progressBar.style.setProperty('--progress', `${progress}%`);

        if (previewTime != null) {

        if (current != null) {
          previewTime.textContent = formatTime(current);
        } else {
          previewTime.textContent = "00:00";
        }

      }
      }
    }, 500);
  
    updateNowPlaying();
  }
  
  function togglePlay() {
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }
  
  function playNextVideo() {
    currentIndex = (currentIndex + 1) % videoIds.length;
    const newId = videoIds[currentIndex];
  
    player.loadVideoById({ videoId: newId, startSeconds: 0 });
    player.setVolume(volume);
  
    const checkReady = setInterval(() => {
      const data = player.getVideoData();
      if (data && data.title) {
        updateNowPlaying();
        clearInterval(checkReady);
      }
    }, 200);
  }
  
  function updateNowPlaying() {
    const data = player.getVideoData();
    const title = data?.title || "Unknown Title";
    const coverImg = document.getElementById("coverArt");
    const currentVideoId = videoIds[currentIndex];
  
    document.getElementById("trackInfo").textContent = `Now Playing: ${title}`;
    coverImg.src = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
  }
  
  function onPlayerStateChange(event) {
    const btn = document.getElementById("playPause");
    const vinyl = document.getElementById("vinyl");
  
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      btn.textContent = "⏸️";
      vinyl.classList.add("playing");
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      btn.textContent = "▶️";
      vinyl.classList.remove("playing");
    } else if (event.data === YT.PlayerState.ENDED) {
      vinyl.classList.remove("playing");
      playNextVideo();
    }
  }
  