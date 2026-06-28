// Micro-interaction: Subtle parallax/follow effect for profile picture glow
document.addEventListener('mousemove', (e) => {
  const glow = document.getElementById('avatar-glow');
  if (glow) {
    const rect = glow.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    glow.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
  }
});

// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
  themeToggle.textContent = 'light_mode';
}
themeToggle.addEventListener('click', () => {
  const isDark = html.classList.toggle('dark');
  themeToggle.textContent = isDark ? 'light_mode' : 'dark_mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Swap nav title when profile header scrolls out of view
const navTitle = document.getElementById('nav-title');
const profileHeader = document.getElementById('profile-header');
new IntersectionObserver(([entry]) => {
  navTitle.style.opacity = '0';
  setTimeout(() => {
    navTitle.textContent = entry.isIntersecting ? 'The Spot' : 'χ Hong';
    navTitle.style.opacity = '1';
  }, 150);
}, { threshold: 0 }).observe(profileHeader);

// χ tooltip — touch support
const chiTip = document.getElementById('chi-tip');
let chiTipTimer;
document.getElementById('chi-tip-trigger').addEventListener('click', (e) => {
  e.stopPropagation();
  chiTip.style.opacity = '1';
  clearTimeout(chiTipTimer);
  chiTipTimer = setTimeout(() => chiTip.style.opacity = '', 2500);
});
document.addEventListener('click', () => {
  clearTimeout(chiTipTimer);
  chiTip.style.opacity = '';
});

// Share button
const shareBtn = document.getElementById('share-btn');
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
const syncShareIcon = () => { shareBtn.textContent = isMobile() ? 'share' : 'link'; };
syncShareIcon();
window.addEventListener('resize', syncShareIcon);
shareBtn.addEventListener('click', async () => {
  if (isMobile() && navigator.share) {
    navigator.share({ title: document.title, url: location.href });
  } else {
    await navigator.clipboard.writeText(location.href);
    shareBtn.textContent = 'check';
    setTimeout(syncShareIcon, 2000);
  }
});

// Character References modal
const charRefModal = document.getElementById('char-ref-modal');
const openModal = () => {
  charRefModal.classList.remove('opacity-0', 'pointer-events-none');
  charRefModal.classList.add('opacity-100');
};
const closeModal = () => {
  charRefModal.classList.add('opacity-0', 'pointer-events-none');
  charRefModal.classList.remove('opacity-100');
};
document.getElementById('char-ref-card').addEventListener('click', openModal);
document.getElementById('char-ref-close').addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
charRefModal.addEventListener('click', (e) => { if (!e.target.closest('.bg-surface-container-lowest')) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Colour chips — hover to show hex, click to copy
const chipFeedback = document.getElementById('chip-feedback');
let chipFeedbackTimer;
document.querySelectorAll('.color-chip').forEach(chip => {
  const hex = chip.dataset.hex;
  chip.addEventListener('mouseenter', () => { chip.title = hex; });
  chip.addEventListener('click', async () => {
    await navigator.clipboard.writeText(hex);
    clearTimeout(chipFeedbackTimer);
    chipFeedback.textContent = `Copied ${hex}`;
    chipFeedbackTimer = setTimeout(() => { chipFeedback.textContent = 'Click to copy hex'; }, 1800);
  });
});

// Hover energy effect for cards
document.querySelectorAll('.group.block').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const arrow = card.querySelector('.slide-arrow');
    if (arrow) arrow.style.transform = 'translateX(4px)';
  });
  card.addEventListener('mouseleave', () => {
    const arrow = card.querySelector('.slide-arrow');
    if (arrow) arrow.style.transform = 'translateX(0px)';
  });
});

// Name Cards carousel modal
// Each entry is one version: { front, back, caption }
const NAME_CARDS = [
  { front: './assets/namecard_001_front.png', back: './assets/namecard_001_back.png', caption: 'Version 1<br><span class="text-sm">Character art by <a href="https://featheri-roo.carrd.co" class="text-primary underline" target="_blank" rel="noopener">@featheri_roo</a></span>' },
];

(() => {
  const modal   = document.getElementById('name-card-modal');
  const track   = document.getElementById('name-card-track');
  const dotsEl  = document.getElementById('name-card-dots');
  const counter = document.getElementById('name-card-counter');
  const prevBtn = document.getElementById('name-card-prev');
  const nextBtn = document.getElementById('name-card-next');
  let current = 0;

  const cards = NAME_CARDS.length ? NAME_CARDS : [{ front: '', back: '', caption: 'No images yet' }];
  const total = cards.length;

  // Single virtual slide
  const slide = document.createElement('div');
  slide.className = 'w-full flex flex-col gap-3 transition-opacity duration-150';
  track.appendChild(slide);

  // Dots
  const dots = cards.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'w-2 h-2 rounded-full transition-colors duration-200 bg-outline-variant';
    d.setAttribute('aria-label', `Go to slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
    return d;
  });

  const renderSlide = ({ front, back, caption }) => {
    slide.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'flex gap-3 items-center';

    [{ src: front, label: 'Front' }, { src: back, label: 'Back' }].forEach(({ src, label }) => {
      const wrap = document.createElement('div');
      wrap.className = 'flex-1 min-w-0 flex flex-col gap-1 items-center';
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = label;
        img.className = 'w-full object-contain rounded-lg max-h-[45vh]';
        wrap.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'flex items-center justify-center w-full h-40 bg-surface-container rounded-lg text-on-surface-variant';
        ph.innerHTML = '<span class="material-symbols-outlined text-[40px] opacity-30">image</span>';
        wrap.appendChild(ph);
      }
      const lbl = document.createElement('p');
      lbl.className = 'font-label-caps text-label-caps text-on-surface-variant';
      lbl.textContent = label;
      wrap.appendChild(lbl);
      row.appendChild(wrap);
    });

    slide.appendChild(row);

    if (caption) {
      const cap = document.createElement('p');
      cap.className = 'font-body-md text-body-md text-on-surface-variant text-center';
      cap.innerHTML = caption;
      slide.appendChild(cap);
    }
  };

  const goTo = (i) => {
    current = (i + total) % total;
    slide.style.opacity = '0';
    setTimeout(() => {
      renderSlide(cards[current]);
      slide.style.opacity = '1';
    }, 100);
    counter.textContent = `${current + 1} / ${total}`;
    dots.forEach((d, idx) => {
      d.classList.toggle('bg-primary', idx === current);
      d.classList.toggle('bg-outline-variant', idx !== current);
    });
    prevBtn.style.display = total <= 1 ? 'none' : '';
    nextBtn.style.display = total <= 1 ? 'none' : '';
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  const openNameCardModal = () => {
    current = -1;
    goTo(0);
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
  };
  const closeNameCardModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
  };

  document.getElementById('name-card-card').addEventListener('click', openNameCardModal);
  document.getElementById('name-card-close').addEventListener('click', (e) => { e.stopPropagation(); closeNameCardModal(); });
  modal.addEventListener('click', (e) => { if (!e.target.closest('.bg-surface-container-lowest')) closeNameCardModal(); });
  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('opacity-0')) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });
})();
