/* ============================================================
   MAIN.JS – Navigation + Fiches iframe
   Tout est encapsulé dans DOMContentLoaded pour éviter
   tout conflit ou problème de chargement.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     NAVIGATION
     PC    : clic (flèches + pastilles), molette, clavier
     Mobile: swipe horizontal
     ========================================================== */

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

  /* ==========================================================
     FICHES IFRAME – Phase 1
     showFiche(type) : 'enfants' ou 'collegues'
     printFiche()    : imprime l'iframe active
     ========================================================== */

  /* ----------------------------------------------------------
     ██████╗ BLOC MODALE APERÇU – DISPOSITION
     ----------------------------------------------------------
     Ce bloc est AUTONOME et MODULABLE.
     Pour modifier les images : voir MODAL_IMAGES ci-dessous.
     Pour modifier le style de la modale : voir MODAL_STYLES.
     Pour modifier le comportement : voir MODAL_LOGIC.

     La modale est injectée directement dans le srcdoc des fiches
     via la fonction generateModalBlock() qui retourne :
       1. MODAL_STYLES  → balise <style> à insérer dans <head>
       2. MODAL_HTML    → overlay + modale à insérer dans <body>
       3. MODAL_SCRIPT  → logique JS à insérer en fin de <body>
       4. MODAL_BUTTONS → les 3 boutons "Aperçu" à insérer
                          dans la section "Disposition testée"
     ---------------------------------------------------------- */

    // ── MODAL_IMAGES : chemins des 3 photos de disposition ──
    // Modifier uniquement ces 3 lignes pour changer les images.
    const MODAL_IMAGES = {
      longueur : 'images/calendrier.jpg',
      haut     : 'images/calendrier.jpg',
      bas      : 'images/calendrier.jpg'
    };

    // ── MODAL_STYLES : CSS de la modale ──
    // Modifier ce bloc pour changer l'apparence de la modale.
    const MODAL_STYLES = `
      /* === MODALE APERÇU === */
      .apercu-btn {
        margin-left: 10px;
        padding: 2px 8px;
        font-size: 11px;
        border: 1px solid #aaa;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        vertical-align: middle;
      }
      .apercu-btn:hover { background: #e8f0fe; }

      #modalOverlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 9999;
        justify-content: center;
        align-items: center;
      }
      #modalOverlay.open { display: flex; }

      #modalBox {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        max-width: 780px;
        width: 95%;
        box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        position: relative;
        text-align: center;
      }
      #modalTitle {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 12px;
        color: #002b45;
      }
      #modalImgs {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      #modalImgs figure {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      #modalImgs img {
        width: 220px;
        height: 180px;
        object-fit: cover;
        object-position: center;
        border-radius: 8px;
        border: 1px solid #ddd;
        display: block;
      }
      #modalImgs figcaption {
        font-size: 11px;
        color: #555;
      }
      #modalClose {
        position: absolute;
        top: 8px;
        right: 10px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #555;
        line-height: 1;
      }
      #modalClose:hover { color: #000; }
      /* === FIN MODALE APERÇU === */
    `;

    // ── MODAL_HTML : structure HTML de l'overlay + modale ──
    // La modale affiche les 3 photos de disposition en une seule vue.
    const MODAL_HTML = `
      <!-- === MODALE APERÇU === -->
      <div id="modalOverlay">
        <div id="modalBox">
          <button id="modalClose" title="Fermer">&#x2715;</button>
          <div id="modalTitle">Aperçu des dispositions</div>
          <div id="modalImgs">
            <figure>
              <img src="${MODAL_IMAGES.longueur}" alt="Table en longueur">
              <figcaption>Table en longueur</figcaption>
            </figure>
            <figure>
              <img src="${MODAL_IMAGES.haut}" alt="2 par table (en haut)">
              <figcaption>2 par table (en haut)</figcaption>
            </figure>
            <figure>
              <img src="${MODAL_IMAGES.bas}" alt="2 par table (en bas)">
              <figcaption>2 par table (en bas)</figcaption>
            </figure>
          </div>
        </div>
      </div>
      <!-- === FIN MODALE APERÇU === -->
    `;

    // ── MODAL_SCRIPT : logique JS de la modale ──
    // openModal()  : ouvre la modale
    // closeModal() : ferme la modale
    const MODAL_SCRIPT = `
      /* === LOGIQUE MODALE APERÇU === */
      (function() {
        function openModal() {
          document.getElementById('modalOverlay').classList.add('open');
        }
        function closeModal() {
          document.getElementById('modalOverlay').classList.remove('open');
        }

        // Fermeture via bouton ✕
        document.getElementById('modalClose').addEventListener('click', closeModal);

        // Fermeture via clic sur l'overlay (hors modale)
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
          if (e.target === this) closeModal();
        });

        // Fermeture via touche Échap
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') closeModal();
        });

        // Exposition globale pour le bouton onclick
        window.openModal = openModal;
      })();
      /* === FIN LOGIQUE MODALE APERÇU === */
    `;

    // ── MODAL_BUTTONS : UN SEUL bouton "Aperçu" ──
    function getModalButtons() {
      return `<button class="apercu-btn" onclick="openModal()">Aperçu des dispositions</button>`;
    }

    // ── generateModalBlock() : retourne toutes les parties à injecter ──
    function generateModalBlock() {
      return {
        styles  : MODAL_STYLES,
        html    : MODAL_HTML,
        script  : MODAL_SCRIPT,
        buttons : getModalButtons()
      };
    }

  /* ----------------------------------------------------------
     FIN BLOC MODALE APERÇU
     ---------------------------------------------------------- */


  /* ----------------------------------------------------------
     Construction des fiches avec injection de la modale
     ---------------------------------------------------------- */

  function buildFiche(accentColor, bgColor, circulationLabels) {
    const modal = generateModalBlock();
    const [circ3] = circulationLabels; // label spécifique selon fiche

    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; font-size:13px; background:#fff; color:#002b45; }
  .fiche { height:100%; padding:14px; display:flex; flex-direction:column; gap:10px; }
  input[type="text"] { border:none; border-bottom:1px solid #bbb; padding:2px 4px; font-size:13px; width:100%; }
  input[type="text"]:focus { outline:none; border-color:${accentColor}; }
  .section { background:${bgColor}; border-radius:10px; padding:8px 10px; }
  .section-title { font-weight:700; margin-bottom:6px; color:${accentColor}; font-size:13px; }
  .line { display:grid; grid-template-columns:160px 1fr; align-items:center; gap:10px; margin-bottom:4px; }
  .line label { font-weight:600; white-space:nowrap; }
  .inline { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .choices { display:grid; grid-template-columns:repeat(3,120px); gap:10px; font-size:12px; }
  .choices label { display:flex; align-items:center; }
  .choices input[type="checkbox"] { margin-right:6px; }
  .header-row { display:flex; align-items:flex-start; gap:20px; margin-bottom:8px; }
  .header-row .field-pair { display:flex; align-items:center; gap:6px; flex:1; }
  .header-row .field-pair label { font-size:12px; font-weight:600; white-space:nowrap; min-width:60px; }
  .header-row .field-pair input { flex:1; font-size:12px; }
  .header-participants { margin-top:8px; }
  .header-participants > label { display:block; font-size:12px; font-weight:600; margin-bottom:4px; }
  .participants-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 10px; }
  .participants-grid input { font-size:12px; }

  ${modal.styles}
</style></head><body>

${modal.html}

<div class="fiche">
  <div class="section">
    <div class="header-row">
      <div class="field-pair"><label>Date</label><input type="text"></div>
      <div class="field-pair"><label>Activité</label><input type="text"></div>
    </div>
    <div class="header-participants">
      <label>Participants</label>
      <div class="participants-grid">
        <input type="text" placeholder="P1"><input type="text" placeholder="P2">
        <input type="text" placeholder="P3"><input type="text" placeholder="P4">
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Disposition testée</div>
    <div class="inline">
      <label><input type="checkbox"> Table en longueur</label>
      <label><input type="checkbox"> 2 par table (en haut)</label>
      <label><input type="checkbox"> 2 par table (en bas)</label>
      ${modal.buttons}
    </div>
  </div>
  <div class="section">
    <div class="section-title">Disposition de l'espace</div>
    <div class="line"><span>Circulation</span><div class="choices"><label><input type="checkbox"> Suffisante</label><label><input type="checkbox"> Limitée</label><label><input type="checkbox"> ${circulationLabels[0]}</label></div></div>
    <div class="line"><span>Accès ordinateurs</span><div class="choices"><label><input type="checkbox"> Facile</label><label><input type="checkbox"> Difficile</label><label><input type="checkbox"> Impraticable</label></div></div>
    <div class="line"><span>Sécurité</span><div class="choices"><label><input type="checkbox"> OK</label><label><input type="checkbox"> À améliorer</label><label><input type="checkbox"> Problème</label></div></div>
    <div class="line"><label>Commentaire</label><input type="text"></div>
  </div>
  <div class="section">
    <div class="section-title">Matériel &amp; installation</div>
    <div class="line"><span>Déplacement PC</span><div class="choices"><label><input type="checkbox"> Facile</label><label><input type="checkbox"> Difficile</label><label><input type="checkbox"> Impossible</label></div></div>
    <div class="line"><span>Raccordements</span><div class="choices"><label><input type="checkbox"> OK</label><label><input type="checkbox"> À améliorer</label><label><input type="checkbox"> Problème</label></div></div>
    <div class="line"><span>Équipements</span><div class="choices"><label><input type="checkbox"> Suffisants</label><label><input type="checkbox"> Limités</label><label><input type="checkbox"> Insuffisants</label></div></div>
    <div class="line"><label>Commentaire</label><input type="text"></div>
  </div>
  <div class="section">
    <div class="section-title">Observations</div>
    <div class="line"><label>Points positifs</label><input type="text"></div>
    <div class="line"><label>Difficultés rencontrées</label><input type="text"></div>
    <div class="line"><label>Suggestions</label><input type="text"></div>
  </div>
</div>

<script>${modal.script}<\/script>
</body></html>`;
  }

  // ——— Génération des deux fiches ———
  const ficheEnfants  = buildFiche('#0d6efd', '#f8fbff', ['Insuffisante']);
  const ficheCollegues = buildFiche('#28a745', '#f0fff4', ['Bloquée']);

  /* ----------------------------------------------------------
     showFiche / printFiche
     ---------------------------------------------------------- */

  function showFiche(type) {
    const iframe = document.getElementById('ficheIframe');
    if (!iframe) return;
    iframe.srcdoc = type === 'enfants' ? ficheEnfants : ficheCollegues;
    document.getElementById('btnEnfants').classList.toggle('active', type === 'enfants');
    document.getElementById('btnCollegues').classList.toggle('active', type === 'collegues');
  }

  function printFiche() {
    const iframe = document.getElementById('ficheIframe');
    if (iframe) iframe.contentWindow.print();
  }

  // Exposer les fonctions appelées via onclick dans le HTML
  window.showFiche = showFiche;
  window.printFiche = printFiche;

  // ——— Init ———
  updateAll();
  showFiche('enfants');

}); // fin DOMContentLoaded
