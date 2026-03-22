const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const form = document.getElementById('waitlistForm');
const formNote = document.getElementById('formNote');

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
  siteAudio.volume = 0.35;

  const tryPlay = () => {
    const playback = siteAudio.play();
    if (playback?.catch) {
      playback.catch(() => {});
    }
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
}
