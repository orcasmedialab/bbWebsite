const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const form = document.getElementById('waitlistForm');
const formNote = document.getElementById('formNote');
const audioToggle = document.getElementById('audioToggle');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email')?.value?.trim();

    if (!email) {
      formNote.textContent = 'Please enter an email address.';
      return;
    }

    formNote.textContent = `Nice. ${email} is queued for launch updates in this demo.`;
    form.reset();
  });
}

const siteAudio = document.getElementById('siteAudio');

if (siteAudio) {
  const defaultVolume = 0.35;
  siteAudio.volume = defaultVolume;

  const tryPlay = () => {
    const playback = siteAudio.play();
    if (playback?.catch) {
      playback.catch(() => {});
    }
  };

  const updateAudioToggle = () => {
    if (!audioToggle) return;
    const muted = siteAudio.muted || siteAudio.volume === 0;
    audioToggle.dataset.muted = muted ? 'true' : 'false';
    audioToggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
    audioToggle.setAttribute('aria-label', muted ? 'Unmute site audio' : 'Mute site audio');
    audioToggle.setAttribute('title', muted ? 'Unmute audio' : 'Mute audio');
  };

  if (document.readyState === 'complete') {
    tryPlay();
  } else {
    window.addEventListener('load', tryPlay, { once: true });
  }

  ['click', 'keydown', 'touchstart'].forEach((eventName) => {
    const handler = () => {
      tryPlay();
      document.removeEventListener(eventName, handler);
    };
    document.addEventListener(eventName, handler, { once: true, passive: true });
  });

  if (audioToggle) {
    updateAudioToggle();

    audioToggle.addEventListener('click', () => {
      const currentlyMuted = siteAudio.muted || siteAudio.volume === 0;

      if (currentlyMuted) {
        siteAudio.muted = false;
        if (siteAudio.volume === 0) {
          siteAudio.volume = defaultVolume;
        }
        tryPlay();
      } else {
        siteAudio.muted = true;
      }

      updateAudioToggle();
    });

    siteAudio.addEventListener('volumechange', updateAudioToggle);
  }
}
