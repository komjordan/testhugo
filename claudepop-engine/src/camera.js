// Caméra virtuelle 2D : position/zoom/rotation animés par keyframes, appliqués
// comme une transform Canvas avant chaque scène. Permet des dollys, punch-ins,
// filatures et secousses sans dupliquer cette logique dans chaque scène.

function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export class Camera {
  constructor() {
    this.keyframes = [{ t: 0, x: 0, y: 0, zoom: 1, rot: 0 }];
    this.shakeAmt = 0;
  }

  // keyframes : [{t, x, y, zoom, rot}] avec t en secondes LOCALES à la scène (0..durée).
  setKeyframes(kfs) {
    this.keyframes = kfs.length ? kfs : [{ t: 0, x: 0, y: 0, zoom: 1, rot: 0 }];
  }

  setShake(amount) { this.shakeAmt = amount; }

  _sample(localT) {
    const kfs = this.keyframes;
    if (localT <= kfs[0].t) return kfs[0];
    for (let i = 0; i < kfs.length - 1; i++) {
      const a = kfs[i], b = kfs[i + 1];
      if (localT >= a.t && localT <= b.t) {
        const span = Math.max(1e-6, b.t - a.t);
        const p = easeInOutCubic(Math.min(1, Math.max(0, (localT - a.t) / span)));
        return {
          x: lerp(a.x, b.x, p),
          y: lerp(a.y, b.y, p),
          zoom: lerp(a.zoom, b.zoom, p),
          rot: lerp(a.rot, b.rot, p)
        };
      }
    }
    return kfs[kfs.length - 1];
  }

  // Applique la transform sur ctx pour un cadre w×h, centré. À encadrer par
  // ctx.save()/ctx.restore() côté appelant.
  apply(ctx, w, h, localT, beatT = 0) {
    const s = this._sample(localT);
    const shakeX = this.shakeAmt ? (Math.sin(beatT * 53.1) * this.shakeAmt) : 0;
    const shakeY = this.shakeAmt ? (Math.cos(beatT * 47.7) * this.shakeAmt) : 0;
    ctx.translate(w / 2, h / 2);
    ctx.rotate(s.rot);
    ctx.scale(s.zoom, s.zoom);
    ctx.translate(-w / 2 + s.x + shakeX, -h / 2 + s.y + shakeY);
  }
}
