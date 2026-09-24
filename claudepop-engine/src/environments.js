// Décors — formes géométriques originales en couches (façon papier découpé),
// avec parallax léger piloté par la caméra. Aucune texture/asset externe :
// tout est dessiné procéduralement.

function paperNoise(ctx, w, h, seed, alpha = 0.04) {
  // Grain papier léger, déterministe par frame (pas de flicker aléatoire pur).
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#1c1a17';
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 60; i++) {
    const x = rnd() * w, y = rnd() * h, r = 1 + rnd() * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// "Studio d'écriture" — bureau/atelier stylisé, plans en profondeur, pour les
// scènes narratives.
export function drawStudioEnvironment(ctx, w, h, t, palette) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#f6ecd9');
  grad.addColorStop(1, '#e7d3ad');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Arche de fond (collage géométrique)
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#ecb96b';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.42, w * 0.62, h * 0.5, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();

  // Rangée de colonnes / meubles stylisés en fond, léger parallax vertical
  const cols = 6;
  for (let i = 0; i < cols; i++) {
    const cx = (i + 0.5) / cols * w;
    const sway = Math.sin(t * 0.6 + i) * w * 0.004;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = palette.accentB;
    ctx.fillRect(cx - w * 0.012 + sway, h * 0.18, w * 0.024, h * 0.5);
    ctx.restore();
  }

  // Bureau / plan proche
  ctx.fillStyle = palette.paper;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  ctx.quadraticCurveTo(w * 0.5, h * 0.72, w, h * 0.78);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Objets posés (formes simples : carnet, tasse, lampe stylisés)
  drawPropBook(ctx, w * 0.24, h * 0.8, w * 0.1, palette);
  drawPropLamp(ctx, w * 0.78, h * 0.68, w * 0.09, palette, t);

  paperNoise(ctx, w, h, Math.floor(t * 4));
}

function drawPropBook(ctx, x, y, size, palette) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.08);
  ctx.fillStyle = palette.accentA;
  ctx.fillRect(-size / 2, -size * 0.3, size, size * 0.3);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-size / 2, -size * 0.3, size, size * 0.3);
  ctx.restore();
}

function drawPropLamp(ctx, x, y, size, palette, t) {
  const glow = 0.5 + Math.sin(t * 2) * 0.15;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -size * 0.9);
  ctx.stroke();
  ctx.fillStyle = palette.accentC;
  ctx.globalAlpha = glow;
  ctx.beginPath();
  ctx.arc(0, -size * 0.95, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = palette.ink;
  ctx.beginPath();
  ctx.arc(0, -size * 0.95, size * 0.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// Environnement "architecture typographique" — grandes formes géométriques en
// mouvement pour les séquences de typographie spectacle.
export function drawTypoEnvironment(ctx, w, h, t, palette) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#efe3cd');
  grad.addColorStop(1, '#dfc79a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Bandes diagonales animées façon composition éditoriale
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let i = -2; i < 8; i++) {
    const offset = ((t * 40 + i * 220) % (w + h)) - h;
    ctx.fillStyle = i % 2 === 0 ? palette.accentB : palette.accentA;
    ctx.beginPath();
    ctx.moveTo(offset, h);
    ctx.lineTo(offset + h, 0);
    ctx.lineTo(offset + h + 40, 0);
    ctx.lineTo(offset + 40, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  paperNoise(ctx, w, h, Math.floor(t * 4) + 500);
}

// Environnement "chorus énergique" — rayons pulsés + flashs de couleur, pour
// les refrains à plusieurs personnages.
export function drawChorusEnvironment(ctx, w, h, t, palette, energy) {
  ctx.fillStyle = palette.ink;
  ctx.fillRect(0, 0, w, h);

  const rays = 20;
  ctx.save();
  ctx.translate(w / 2, h * 0.4);
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + t * 0.4;
    const len = Math.max(w, h) * (0.9 + Math.sin(t * 3 + i) * 0.06 * energy);
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = i % 2 === 0 ? palette.accentA : palette.accentC;
    ctx.globalAlpha = 0.5 + energy * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, -len * 0.045);
    ctx.lineTo(len, len * 0.045);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Flash de couleur sur les temps forts (approx. via battement sinusoïdal)
  const flash = Math.max(0, Math.sin(t * 6.28 * 2.1)) ** 12;
  if (flash > 0.05) {
    ctx.save();
    ctx.globalAlpha = flash * 0.25 * (0.4 + energy);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
