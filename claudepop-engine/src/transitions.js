// Transitions entre cues : rendues en superposant deux passes (sortante puis
// entrante) via un masque animé, pour éviter les coupes sèches entre scènes
// de composition très différente.

export const TRANSITION_WINDOW = 0.35; // secondes de recouvrement de part et d'autre d'une coupe

// "paper-tear" : déchirure diagonale qui balaie l'écran.
export function paperTear(ctx, w, h, progress, palette) {
  const edgeX = w * (progress * 1.3 - 0.15);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(edgeX - h * 0.25, 0);
  ctx.lineTo(edgeX + h * 0.25, h);
  ctx.lineTo(w + h, h);
  ctx.lineTo(w + h, 0);
  ctx.closePath();
  ctx.fillStyle = palette.paper;
  ctx.fill();
  // liseré encre le long de la déchirure
  ctx.lineWidth = 6;
  ctx.strokeStyle = palette.ink;
  ctx.beginPath();
  ctx.moveTo(edgeX - h * 0.25, 0);
  ctx.lineTo(edgeX + h * 0.25, h);
  ctx.stroke();
  ctx.restore();
}

// "iris" : cercle qui se ferme/ouvre, centré sur le point donné.
export function iris(ctx, w, h, progress, palette, cx = w / 2, cy = h / 2) {
  const maxR = Math.hypot(w, h);
  const r = maxR * (1 - progress);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2, true);
  ctx.fillStyle = palette.ink;
  ctx.fill('evenodd');
  ctx.restore();
}

// "flash-cut" : blanc bref, pour ponctuer une coupe sur un temps fort.
export function flashCut(ctx, w, h, progress) {
  const a = Math.sin(progress * Math.PI);
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
