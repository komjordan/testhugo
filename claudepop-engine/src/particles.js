// Champ de particules "papier découpé" — petits polygones qui dérivent et
// réagissent à l'intensité de la section en cours. Purement génératif.
export class ParticleField {
  constructor(count, palette) {
    this.palette = palette;
    this.items = Array.from({ length: count }, () => this._spawn());
  }

  _spawn() {
    return {
      x: Math.random(),
      y: Math.random(),
      size: 4 + Math.random() * 10,
      speed: 0.02 + Math.random() * 0.05,
      drift: (Math.random() - 0.5) * 0.02,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.6,
      hueIdx: Math.floor(Math.random() * 3)
    };
  }

  update(dt, energy) {
    for (const p of this.items) {
      p.y -= p.speed * dt * (0.5 + energy);
      p.x += p.drift * dt;
      p.rot += p.spin * dt;
      if (p.y < -0.05) {
        Object.assign(p, this._spawn());
        p.y = 1.05;
      }
    }
  }

  draw(ctx, w, h, energy) {
    const colors = [this.palette.accentA, this.palette.accentB, this.palette.accentC];
    for (const p of this.items) {
      ctx.save();
      ctx.translate(p.x * w, p.y * h);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.35 + energy * 0.35;
      ctx.fillStyle = colors[p.hueIdx];
      const s = p.size * (0.7 + energy * 0.6);
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(s / 2, s / 2);
      ctx.lineTo(-s / 2, s / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}
