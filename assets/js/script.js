const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const form = document.getElementById('waitlistForm');
let formNote = document.getElementById('formNote');
const audioToggle = document.getElementById('audioToggle');
const mobileAudioPrompt = document.getElementById('mobileAudioPrompt');
const mobileAudioTrigger = document.getElementById('mobileAudioTrigger');
const mobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 640px)') : null;
const audioPreferenceKey = 'bbAudioMuted';

const couponOverlay = document.getElementById('couponOverlay');
const couponJoinButton = document.getElementById('couponJoinButton');
const couponDismissButton = document.getElementById('couponDismissButton');
const couponCloseButton = document.getElementById('couponCloseButton');
const couponModalElement = couponOverlay?.querySelector('.coupon-modal') || null;

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

if (couponOverlay) {
  const couponDelayMs = 10000;
  let couponTimerId = null;
  let couponTimerArmed = false;
  let couponHasDismissed = false;
  let couponIsOpen = false;

  const clearCouponTimer = () => {
    if (couponTimerId !== null) {
      window.clearTimeout(couponTimerId);
      couponTimerId = null;
    }
  };

  const closeCouponOverlay = (markDismissed = true) => {
    if (!couponOverlay) return;
    clearCouponTimer();
    if (couponIsOpen) {
      couponIsOpen = false;
      couponOverlay.hidden = true;
      couponOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('coupon-locked');
    }
    if (markDismissed) {
      couponHasDismissed = true;
    }
  };

  const openCouponOverlay = () => {
    if (couponHasDismissed || couponIsOpen) return;
    couponIsOpen = true;
    clearCouponTimer();
    couponOverlay.hidden = false;
    couponOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('coupon-locked');
    const focusTarget = couponModalElement || couponJoinButton || couponCloseButton;
    try {
      focusTarget?.focus({ preventScroll: true });
    } catch (error) {
      focusTarget?.focus();
    }
  };

  const startCouponTimer = () => {
    if (couponTimerArmed || couponHasDismissed) return;
    couponTimerArmed = true;
    couponTimerId = window.setTimeout(() => {
      couponTimerId = null;
      openCouponOverlay();
    }, couponDelayMs);
  };

  [
    { name: 'click', options: { once: true, passive: true } },
    { name: 'touchstart', options: { once: true, passive: true } },
    { name: 'keydown', options: { once: true } }
  ].forEach(({ name, options }) => {
    window.addEventListener(name, startCouponTimer, options);
  });

  couponJoinButton?.addEventListener('click', () => {
    closeCouponOverlay(true);
    const waitlistSection = document.getElementById('signup');
    waitlistSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const dismissCoupon = () => closeCouponOverlay(true);
  couponDismissButton?.addEventListener('click', dismissCoupon);
  couponCloseButton?.addEventListener('click', dismissCoupon);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && couponIsOpen) {
      event.preventDefault();
      dismissCoupon();
    }
  });
}

if (form) {
  const setFormNoteText = (message) => {
    if (formNote) {
      formNote.textContent = message;
    }
  };

  const promoteNoteToHeading = (message) => {
    if (!formNote) return;
    if (formNote.tagName.toLowerCase() === 'h3') {
      formNote.textContent = message;
      return;
    }

    const heading = document.createElement('h3');
    heading.id = formNote.id || 'formNoteHeading';
    const baseClass = formNote.className || '';
    heading.className = `${baseClass} form-note-heading`.trim();
    heading.textContent = message;
    formNote.replaceWith(heading);
    formNote = heading;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailLabel = form.querySelector('label[for="email"]');
    const emailInput = document.getElementById('email');
    const submitButton = document.getElementById('submitButton');
    const email = emailInput?.value?.trim();
    let signupSucceeded = false;

    if (!email || !submitButton) {
      setFormNoteText('Please enter an email address.');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Joining...';
    setFormNoteText('Submitting...');

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
        if (emailLabel) {
          emailLabel.hidden = true;
        }
        emailInput.hidden = true;
        const successBadge = document.createElement('div');
        successBadge.className = 'trust-item signup-success-pill';
        successBadge.textContent = 'Submitted successfully';
        successBadge.setAttribute('role', 'status');
        submitButton.replaceWith(successBadge);
        form.classList.add('is-success');
        signupSucceeded = true;
        promoteNoteToHeading("You're in! \nYour bussy's big day is cumming.");
      } else {
        const data = await response.json().catch(() => null);

        if (data && data.errors && data.errors.length > 0) {
          setFormNoteText(data.errors.map(err => err.message).join(', '));
        } else {
          setFormNoteText('Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      setFormNoteText('Network error. Please try again.');
    } finally {
      if (!signupSucceeded) {
        submitButton.disabled = false;
        submitButton.textContent = 'Join waitlist';
      }
    }
  });
}

const siteAudio = document.getElementById('siteAudio');

if (siteAudio) {
  const defaultVolume = 0.35;

  const showMobileAudioPrompt = () => {
    if (!mobileAudioPrompt) return;
    mobileAudioPrompt.hidden = false;
    mobileAudioPrompt.setAttribute('aria-hidden', 'false');
  };

  const removeMobileAudioPrompt = () => {
    if (!mobileAudioPrompt) return;
    mobileAudioPrompt.hidden = true;
    mobileAudioPrompt.setAttribute('aria-hidden', 'true');
    if (mobileAudioPrompt.parentElement) {
      mobileAudioPrompt.parentElement.removeChild(mobileAudioPrompt);
    }
  };

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

  const registerDeferredPlaybackAttempt = () => {
    ['click', 'keydown', 'touchstart'].forEach((eventName) => {
      const handler = () => {
        startPlaybackIfAllowed();
      };
      document.addEventListener(eventName, handler, { once: true, passive: true });
    });
  };

  const bootstrapAutoPlayback = () => {
    if (document.readyState === 'complete') {
      startPlaybackIfAllowed();
    } else {
      window.addEventListener('load', startPlaybackIfAllowed, { once: true });
    }
    registerDeferredPlaybackAttempt();
  };

  const shouldGateMobileAudio = Boolean(mobileViewportQuery?.matches && mobileAudioPrompt && mobileAudioTrigger);

  if (!shouldGateMobileAudio) {
    bootstrapAutoPlayback();
  } else {
    siteAudio.autoplay = false;
    siteAudio.pause();
    siteAudio.currentTime = 0;
    showMobileAudioPrompt();
  }

  if (shouldGateMobileAudio && mobileAudioTrigger) {
    mobileAudioTrigger.addEventListener('click', () => {
      removeMobileAudioPrompt();
      siteAudio.currentTime = 0;
      siteAudio.muted = false;
      if (siteAudio.volume === 0) {
        siteAudio.volume = defaultVolume;
      }
      updateAudioToggle();
      startPlaybackIfAllowed();
    });
  }

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
