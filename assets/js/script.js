const versionMeta = document.querySelector('meta[name="site-version"]');
const dateMeta = document.querySelector('meta[name="build-date"]');

const BUILD_VERSION = versionMeta?.content || "unknown";
const BUILD_DATE = dateMeta?.content || "";

console.log(`Bussy Botanicals build: ${BUILD_VERSION} | ${BUILD_DATE}`);

// Disabled at launch: the 50% waitlist offer no longer applies. Re-enable with a real promo code.
const ENABLE_COUPON_CAMPAIGN = false;

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const form = document.getElementById('waitlistForm');
let formNote = document.getElementById('formNote');
const audioToggle = document.getElementById('audioToggle');
const mobileAudioPrompt = document.getElementById('mobileAudioPrompt');
const mobileAudioTrigger = document.getElementById('mobileAudioTrigger');
const audioPreferenceKey = 'bbAudioMuted';

const couponOverlay = document.getElementById('couponOverlay');
const couponJoinButton = document.getElementById('couponJoinButton');
const couponDismissButton = document.getElementById('couponDismissButton');
const couponCloseButton = document.getElementById('couponCloseButton');
const couponModalElement = couponOverlay?.querySelector('.coupon-modal') || null;
const couponDismissedKey = 'bbCouponDismissed';
const couponPill = document.getElementById('couponPill');

window.resetExperience = () => {
  try {
    localStorage.clear();
  } catch (error) {
    // ignore storage failures
  }
  window.location.reload();
};

const readCouponDismissedFlag = () => {
  try {
    return localStorage.getItem(couponDismissedKey) === 'true';
  } catch (error) {
    return false;
  }
};

const writeCouponDismissedFlag = () => {
  try {
    localStorage.setItem(couponDismissedKey, 'true');
  } catch (error) {
    // ignore persistence errors silently
  }
};

if (!ENABLE_COUPON_CAMPAIGN) {
  couponOverlay?.setAttribute('hidden', 'true');
  couponPill?.setAttribute('hidden', 'true');
}

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

// Mobile sticky "Buy on Amazon" bar: shown once the hero is out of view, hidden again near the final CTA / footer.
const mobileBuy = document.getElementById('mobileBuy');
if (mobileBuy && 'IntersectionObserver' in window) {
  const blockers = [
    document.querySelector('.hero'),
    document.getElementById('product'),
    document.querySelector('.site-footer')
  ].filter(Boolean);
  const visibleBlockers = new Set();
  const blockerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleBlockers.add(entry.target);
      } else {
        visibleBlockers.delete(entry.target);
      }
    });
    const show = visibleBlockers.size === 0;
    mobileBuy.classList.toggle('is-visible', show);
    mobileBuy.inert = !show;
  });
  blockers.forEach((el) => blockerObserver.observe(el));
}

if (ENABLE_COUPON_CAMPAIGN && couponOverlay) {
  const couponDelayMs = 10000;
  let couponTimerId = null;
  let couponTimerArmed = false;
  let couponHasDismissed = readCouponDismissedFlag();
  let couponIsOpen = false;

  couponPill?.removeAttribute('hidden');

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

  const openCouponOverlay = (forceShow = false) => {
    if ((couponHasDismissed && !forceShow) || couponIsOpen) return;
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
    { name: 'keydown', options: { once: true } },
    { name: 'wheel', options: { once: true, passive: true } }
  ].forEach(({ name, options }) => {
    window.addEventListener(name, startCouponTimer, options);
  });

  couponJoinButton?.addEventListener('click', () => {
    writeCouponDismissedFlag();
    closeCouponOverlay(true);
    const waitlistSection = document.getElementById('signup');
    waitlistSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  couponDismissButton?.addEventListener('click', () => {
    writeCouponDismissedFlag();
    closeCouponOverlay(true);
  });

  couponCloseButton?.addEventListener('click', () => closeCouponOverlay(false));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && couponIsOpen) {
      event.preventDefault();
      closeCouponOverlay(false);
    }
  });

  couponPill?.addEventListener('click', () => {
    openCouponOverlay(true);
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
    const submitLabel = submitButton?.textContent;
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
        promoteNoteToHeading("You're in! \nWe'll be cumming to your inbox soon.");
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
        submitButton.textContent = submitLabel;
      }
    }
  });
}

const siteAudio = document.getElementById('siteAudio');

// Site music.
// Computers: try to play right away. Browsers block sound until the visitor's first click or key press
// (scrolling doesn't count), so if the first attempt is blocked we start on that first interaction.
// Phones/tablets: never auto-start; show the "Play the Bussy Song" button instead.
// The speaker button mutes for the current page view only (nothing is remembered between visits).
if (siteAudio) {
  const defaultVolume = 0.35;
  const touchQuery = window.matchMedia ? window.matchMedia('(max-width: 640px), (hover: none) and (pointer: coarse)') : null;
  const isTouchDevice = Boolean(touchQuery?.matches);

  // Older versions remembered mute in localStorage, which left some visitors permanently silent. Clear it.
  try {
    localStorage.removeItem(audioPreferenceKey);
  } catch (error) {
    // ignore storage failures silently
  }

  let userMuted = false;
  siteAudio.volume = defaultVolume;
  siteAudio.muted = false;

  const isAudible = () => !siteAudio.paused && !siteAudio.muted;

  const updateAudioToggle = () => {
    if (!audioToggle) return;
    const on = isAudible();
    audioToggle.dataset.muted = on ? 'false' : 'true';
    audioToggle.setAttribute('aria-pressed', on ? 'false' : 'true');
    audioToggle.setAttribute('aria-label', on ? 'Mute site audio' : 'Play site audio');
    audioToggle.setAttribute('title', on ? 'Mute audio' : 'Play audio');
  };

  const play = () => {
    siteAudio.muted = false;
    const attempt = siteAudio.play();
    if (attempt?.catch) {
      attempt.catch(() => {}); // blocked until a user gesture; retried below
    }
  };

  const removeMobileAudioPrompt = () => {
    if (!mobileAudioPrompt) return;
    mobileAudioPrompt.hidden = true;
    mobileAudioPrompt.setAttribute('aria-hidden', 'true');
    mobileAudioPrompt.remove();
  };

  ['play', 'pause', 'volumechange'].forEach((type) => siteAudio.addEventListener(type, updateAudioToggle));
  siteAudio.addEventListener('play', removeMobileAudioPrompt);
  updateAudioToggle();

  if (isTouchDevice) {
    siteAudio.preload = 'none';
    if (mobileAudioPrompt && mobileAudioTrigger) {
      mobileAudioPrompt.hidden = false;
      mobileAudioPrompt.setAttribute('aria-hidden', 'false');
      mobileAudioTrigger.addEventListener('click', () => {
        userMuted = false;
        siteAudio.currentTime = 0;
        play();
      });
    }
  } else {
    removeMobileAudioPrompt();
    siteAudio.preload = 'auto';
    play();

    const gestures = ['pointerdown', 'pointerup', 'keydown'];
    const onGesture = (event) => {
      if (userMuted || !siteAudio.paused) return;
      if (event.target instanceof Element && event.target.closest('#audioToggle')) return; // handled below
      play();
    };
    const stopListening = () => gestures.forEach((type) => document.removeEventListener(type, onGesture, true));
    gestures.forEach((type) => document.addEventListener(type, onGesture, true));
    siteAudio.addEventListener('playing', stopListening, { once: true });
  }

  audioToggle?.addEventListener('click', () => {
    if (isAudible()) {
      userMuted = true;
      siteAudio.pause();
    } else {
      userMuted = false;
      play();
    }
  });
}
