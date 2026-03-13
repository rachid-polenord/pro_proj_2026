/* ============================================================
   APP.JS – Fiches de suivi (Phase 1)
   Fonctions : showFiche, printFiche
   Init : updateAll, showFiche('enfants')
   ============================================================ */

// ——— Phase 1 fiche logic ———

const ficheEnfants = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; font-size:13px; background:#fff; color:#002b45; }
  .fiche { height:100%; padding:14px; display:flex; flex-direction:column; gap:10px; }
  input[type="text"] { border:none; border-bottom:1px solid #bbb; padding:2px 4px; font-size:13px; width:100%; }
  input[type="text"]:focus { outline:none; border-color:#0d6efd; }
  .section { background:#f8fbff; border-radius:10px; padding:8px 10px; }
  .section-title { font-weight:700; margin-bottom:6px; color:#0d6efd; font-size:13px; }
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
</style></head><body>
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
    </div>
  </div>
  <div class="section">
    <div class="section-title">Disposition de l'espace</div>
    <div class="line"><span>Circulation</span><div class="choices"><label><input type="checkbox"> Suffisante</label><label><input type="checkbox"> Limitée</label><label><input type="checkbox"> Insuffisante</label></div></div>
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
</div></body></html>`;

const ficheCollegues = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; font-size:13px; background:#fff; color:#002b45; }
  .fiche { height:100%; padding:14px; display:flex; flex-direction:column; gap:10px; }
  input[type="text"] { border:none; border-bottom:1px solid #bbb; padding:2px 4px; font-size:13px; width:100%; }
  input[type="text"]:focus { outline:none; border-color:#28a745; }
  .section { background:#f0fff4; border-radius:10px; padding:8px 10px; }
  .section-title { font-weight:700; margin-bottom:6px; color:#28a745; font-size:13px; }
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
</style></head><body>
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
    </div>
  </div>
  <div class="section">
    <div class="section-title">Disposition de l'espace</div>
    <div class="line"><span>Circulation</span><div class="choices"><label><input type="checkbox"> Suffisante</label><label><input type="checkbox"> Limitée</label><label><input type="checkbox"> Bloquée</label></div></div>
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
</div></body></html>`;

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

// ——— Init ———
updateAll();
showFiche('enfants');
