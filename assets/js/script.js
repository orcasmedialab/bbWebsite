const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const form = document.getElementById('waitlistForm');
const formNote = document.getElementById('formNote');
const audioToggle = document.getElementById('audioToggle');
const audioPreferenceKey = 'bbAudioMuted';

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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const email = emailInput?.value?.trim();

    if (!email) {
      formNote.textContent = 'Please enter an email address.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Joining...';
    formNote.textContent = 'Submitting...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        form.reset();
        formNote.textContent = "You're in! Your bussy's big day is cumming.";
      } else {
        const data = await response.json().catch(() => null);

        if (data && data.errors && data.errors.length > 0) {
          formNote.textContent = data.errors.map(err => err.message).join(', ');
        } else {
          formNote.textContent = 'Something went wrong. Please try again.';
        }
      }
    } catch (error) {
      formNote.textContent = 'Network error. Please try again.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Join waitlist';
    }
  });
}

const siteAudio = document.getElementById('siteAudio');

if (siteAudio) {
  const defaultVolume = 0.35;

  const readStoredMutePreference = () => {
    try {
      const storedValue = localStorage.getItem(audioPreferenceKey);
      return storedValue === null ? null : storedValue === 'true';
    } catch (error) {
      return null;
    }
  };

  const writeStoredMutePreference = (isMuted) => {
    try {
      localStorage.setItem(audioPreferenceKey, isMuted ? 'true' : 'false');
    } catch (error) {
      // ignore storage failures silently
    }
  };

  siteAudio.volume = defaultVolume;
  const storedMuted = readStoredMutePreference();
  if (storedMuted !== null) {
    siteAudio.muted = storedMuted;
  }

  const tryPlay = () => {
    const playback = siteAudio.play();
    if (playback?.catch) {
      playback.catch(() => {});
    }
  };

  const startPlaybackIfAllowed = () => {
    if (!siteAudio.muted) {
      tryPlay();
    }
  };

  const updateAudioToggle = () => {
    if (!audioToggle) return;
    const muted = siteAudio.muted || siteAudio.volume === 0;
    audioToggle.dataset.muted = muted ? 'true' : 'false';
    audioToggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
    audioToggle.setAttribute('aria-label', muted ? 'Unmute site audio' : 'Mute site audio');
    audioToggle.setAttribute('title', muted ? 'Unmute audio' : 'Mute audio');
    writeStoredMutePreference(muted);
  };

  if (document.readyState === 'complete') {
    startPlaybackIfAllowed();
  } else {
    window.addEventListener('load', startPlaybackIfAllowed, { once: true });
  }

  async function initPlayback() {
    try {
      await startPlaybackIfAllowed();
    } catch {
      ['click', 'keydown', 'touchstart'].forEach((eventName) => {
        const handler = () => {
          startPlaybackIfAllowed();
        };
        document.addEventListener(eventName, handler, { once: true, passive: true });
      });
    }
  }

  initPlayback();

  if (audioToggle) {
    updateAudioToggle();

    audioToggle.addEventListener('click', () => {
      const currentlyMuted = siteAudio.muted || siteAudio.volume === 0;

      if (currentlyMuted) {
        siteAudio.muted = false;
        if (siteAudio.volume === 0) {
          siteAudio.volume = defaultVolume;
        }
        startPlaybackIfAllowed();
      } else {
        siteAudio.muted = true;
      }

      updateAudioToggle();
    });

    siteAudio.addEventListener('volumechange', updateAudioToggle);
  }
}
