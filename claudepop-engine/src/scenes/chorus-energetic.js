import { drawChorusEnvironment } from '../environments.js';
import { easeOutBack } from './text-fx.js';

// Refrain énergique : Bloom + deux personnages secondaires en formation,
// grand hook typographique, caméra en punch-ins successifs sur les temps forts.
export function drawChorusEnergetic(ctx, { w, h, cue, localT, cueDuration, palette, energy, t, camera, mascot, companions }) {
  const punch = Math.max(0, Math.sin((localT / cueDuration) * Math.PI * 4)) ** 8;
  camera.setKeyframes([
    { t: 0, x: 0, y: 0, zoom: 1 + punch * 0.03, rot: 0 },
    { t: cueDuration, x: 0, y: 0, zoom: 1 + punch * 0.03, rot: 0 }
  ]);
  camera.setShake(1.5 * energy);

  ctx.save();
  camera.apply(ctx, w, h, localT, t);
  drawChorusEnvironment(ctx, w, h, t, palette, energy);

  const groundY = h * 0.72;
  const radius = Math.min(w, h) * 0.085;

  companions.spark.draw(ctx, { x: w * 0.24, y: groundY, size: radius * 0.85, t, energy, phase: 0.4 });
  companions.glow.draw(ctx, { x: w * 0.76, y: groundY, size: radius * 0.85, t, energy, phase: 1.1 });
  mascot.draw(ctx, {
    x: w * 0.5, y: groundY - radius * 0.2, radius, t, energy,
    pose: t % 1.6 < 0.8 ? 'dance-a' : 'dance-b', expr: 'excited'
  });

  // Hook géant, auto-fit, avec double ombre sérigraphie
  const enter = Math.min(1, localT / 0.25);
  const scale = easeOutBack(enter) * (1 + punch * 0.04);
  let fontSize = Math.min(w * 0.15, h * 0.16);
  ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  const measured = ctx.measureText(cue.text).width;
  const maxTextWidth = w * 0.9;
  if (measured > maxTextWidth) {
    fontSize *= maxTextWidth / measured;
    ctx.font = `900 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(w / 2, h * 0.2);
  ctx.scale(scale, scale);
  ctx.fillStyle = palette.accentB;
  ctx.fillText(cue.text, fontSize * 0.06, fontSize * 0.07);
  ctx.fillStyle = palette.accentC;
  ctx.fillText(cue.text, fontSize * 0.03, fontSize * 0.035);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(cue.text, 0, 0);
  ctx.restore();

  ctx.restore();
}
