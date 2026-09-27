// Motion, kept deliberately small:
//   1. Hero entrance: photo curtain-reveal + headline words rising into place.
//   2. Scroll-lit statement: words brighten one by one as the statement scrolls through view.
//   Plus gentle fade-up reveals on scroll and a smooth FAQ open/close.
// Only runs when the inline <head> script added `motion-ok` (JS on, no reduced-motion preference).
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('motion-ok')) return;
  window.bbMotionReady = true;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // ---------- 1. Hero entrance ----------
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroImage = hero.querySelector('.hero-media img');
    const imageReady = heroImage && heroImage.decode ? heroImage.decode().catch(() => {}) : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 1200));
    Promise.race([imageReady, timeout]).then(() => {
      requestAnimationFrame(() => hero.classList.add('is-in'));
    });
  }

  // ---------- 2. Scroll-lit statement ----------
  const statement = document.querySelector('[data-scroll-words]');
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    const spans = words.map((word, index) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      statement.append(span);
      if (index < words.length - 1) statement.append(' ');
      return span;
    });

    let queued = false;
    const paint = () => {
      queued = false;
      const rect = statement.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = viewport * 0.85; // text top here -> nothing lit
      const end = viewport * 0.4;    // text bottom here -> everything lit
      const progress = clamp((start - rect.top) / (rect.height + start - end), 0, 1);
      const lit = progress * spans.length;
      spans.forEach((span, index) => {
        span.style.opacity = (0.16 + 0.84 * clamp(lit - index, 0, 1)).toFixed(3);
      });
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    paint();
  }

  // ---------- Reveal on scroll ----------
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    [...group.children].forEach((child, index) => {
      child.style.setProperty('--reveal-delay', `${index * 90}ms`);
    });
  });

  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group] > *');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- FAQ: animate height instead of snapping open/closed ----------
  document.querySelectorAll('.faq-list details').forEach((details) => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.faq-answer');
    if (!summary || !answer || !answer.animate) return;
    let animation = null;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      animation?.cancel();
      const closing = details.classList.contains('is-closing');

      if (details.open && !closing) {
        details.classList.add('is-closing');
        animation = answer.animate(
          [{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 350, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
        );
        animation.onfinish = () => {
          details.open = false;
          details.classList.remove('is-closing');
          animation = null;
        };
      } else {
        details.classList.remove('is-closing');
        details.open = true;
        animation = answer.animate(
          [{ height: '0px', opacity: 0 }, { height: `${answer.offsetHeight}px`, opacity: 1 }],
          { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        animation.onfinish = () => { animation = null; };
      }
    });
  });
})();
