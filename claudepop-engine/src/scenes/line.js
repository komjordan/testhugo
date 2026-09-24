import { wordsRevealed, easeOutExpo } from './text-fx.js';

// Scène "line" : une phrase de couplet, révélée mot par mot, ancrée en bas de
// cadre pour laisser la place au personnage.
export function drawLine(ctx, { w, h, cue, localT, palette }) {
  const words = cue.text.split(' ');
  const revealed = wordsRevealed(words, localT, 0.5);
  const fontSize = Math.min(w * 0.052, h * 0.07);

  ctx.save();
  ctx.font = `700 ${fontSize}px "Archivo Black", "Helvetica Neue", sans-serif`;
  ctx.textBaseline = 'alphabetic';

  const widths = revealed.map((r) => ctx.measureText(r.text + ' ').width);
  const totalW = widths.reduce((a, b) => a + b, 0);
  let x = w / 2 - totalW / 2;
  const y = h * 0.78;

  revealed.forEach((r, i) => {
    if (r.visible) {
      const wordW = widths[i];
      const pop = r.justIn ? 1 - easeOutExpo(Math.min(1, (localT * words.length) % 1)) : 0;
      ctx.save();
      ctx.translate(x + wordW / 2, y - pop * fontSize * 0.4);
      ctx.globalAlpha = 1 - pop * 0.5;
      ctx.textAlign = 'center';
      ctx.fillStyle = palette.ink;
      ctx.fillText(r.text, 0, 0);
      ctx.restore();
    }
    x += widths[i];
  });
  ctx.restore();
}
