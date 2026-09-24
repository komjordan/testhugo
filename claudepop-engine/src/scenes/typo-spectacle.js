import { drawTypoEnvironment } from '../environments.js';
import { easeOutBack } from './text-fx.js';

// Séquence de typographie spectacle : lettres géantes à extrusion (couches
// décalées), entrée en cascade par lettre, caméra en punch-in progressif.
export function drawTypoSpectacle(ctx, { w, h, cue, localT, cueDuration, palette, energy, t, camera }) {
  camera.setKeyframes([
    { t: 0, x: 0, y: 0, zoom: 1, rot: 0 },
    { t: cueDuration, x: 0, y: 0, zoom: 1.12, rot: 0 }
  ]);
  camera.setShake(energy > 0.7 ? 2.5 : 0);

  ctx.save();
  camera.apply(ctx, w, h, localT, t);
  drawTypoEnvironment(ctx, w, h, t, palette);

  const letters = cue.text.split('');
  let fontSize = Math.min(w * 0.17, h * 0.13);
  ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  const widths = letters.map((l) => ctx.measureText(l).width);
  let totalW = widths.reduce((a, b) => a + b, 0);
  const maxW = w * 0.9;
  if (totalW > maxW) {
    const s = maxW / totalW;
    fontSize *= s;
    ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
    for (let i = 0; i < widths.length; i++) widths[i] *= s;
    totalW = maxW;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let x = w / 2 - totalW / 2;
  const y = h * 0.46;
  const perLetter = Math.min(0.06, (cueDuration * 0.5) / letters.length);

  letters.forEach((letter, i) => {
    const start = i * perLetter;
    const local = Math.max(0, Math.min(1, (localT - start) / 0.4));
    const scale = easeOutBack(local);
    const dropY = (1 - local) * -h * 0.15;
    const lw = widths[i];

    ctx.save();
    ctx.globalAlpha = local;
    ctx.translate(x + lw / 2, y + dropY);
    ctx.scale(scale, scale);

    // Extrusion : couches décalées façon sérigraphie superposée
    const layers = 4;
    for (let l = layers; l >= 0; l--) {
      const off = l * fontSize * 0.035;
      ctx.fillStyle = l === 0 ? palette.ink : (l % 2 === 0 ? palette.accentB : palette.accentA);
      ctx.fillText(letter, -lw / 2 + off, off);
    }
    ctx.restore();

    x += lw;
  });

  ctx.restore();
}
