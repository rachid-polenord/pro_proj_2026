/* ============================================================
   NAV.JS – Navigation complète et robuste
   PC    : clic (flèches + pastilles), molette, clavier
   Mobile: swipe horizontal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const TOTAL = 6;
  let current = 0;
  let isAnimating = false;
  let lastWheelTime = 0;

  // ——— Navigation ———

  function goTo(index) {
    if (index === current || isAnimating) return;
    if (index < 0 || index >= TOTAL) return;

    isAnimating = true;
    current = index;
    updateAll();

    setTimeout(() => { isAnimating = false; }, 600);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // ——— Update UI ———

  function updateAll() {
    const track = document.getElementById('slidesTrack');
    track.style.transform = `translateX(-${current * 100}vw)`;

    const pct = (current / (TOTAL - 1)) * 100;
    document.getElementById('progressBar').style.width = pct + '%';

    document.querySelectorAll('.nav-step').forEach((el, i) => {
      el.classList.remove('active', 'done');
      if (i === current) el.classList.add('active');
      else if (i < current) el.classList.add('done');
    });

    for (let i = 0; i < TOTAL - 1; i++) {
      const conn = document.getElementById('conn-' + i);
      if (conn) conn.classList.toggle('filled', i < current);
    }

    document.getElementById('btnPrev').disabled = current === 0;
    document.getElementById('btnNext').disabled = current === TOTAL - 1;
  }

  // ——— Clic boutons flèches ———

  document.getElementById('btnPrev').addEventListener('click', prev);
  document.getElementById('btnNext').addEventListener('click', next);

  // ——— Clic pastilles nav ———

  document.querySelectorAll('.nav-step').forEach((el) => {
    el.addEventListener('click', () => {
      const index = parseInt(el.getAttribute('data-index'));
      goTo(index);
    });
  });

  // ——— Molette (PC uniquement) ———

  function onWheel(e) {
    if (window.innerWidth <= 768) return;
    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    if (now - lastWheelTime < 900) return;
    lastWheelTime = now;

    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (delta > 0) next();
    else if (delta < 0) prev();
  }

  document.addEventListener('wheel', onWheel, { passive: false });
  document.getElementById('slidesTrack').addEventListener('wheel', onWheel, { passive: false });

  // ——— Clavier (PC uniquement) ———

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); prev(); }
  });

  // ——— Swipe tactile (mobile) ———

  let touchStartX = 0;
  let touchStartY = 0;
  let touchDirection = null;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDirection = null;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!touchDirection) {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 8 || dy > 8) {
        touchDirection = dx > dy ? 'horizontal' : 'vertical';
      }
    }
    if (touchDirection === 'horizontal') e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (touchDirection !== 'horizontal') return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { dx > 0 ? next() : prev(); }
    touchDirection = null;
  }, { passive: true });

  // ——— Init ———
  updateAll();

}); // fin DOMContentLoaded
