import { PALETTE } from './palette.js';
import { Bloom } from './mascot.js';
import { ParticleField } from './particles.js';
import { drawHero } from './scenes/hero.js';
import { drawLine } from './scenes/line.js';
import { drawChant } from './scenes/chant.js';
import { drawBuild } from './scenes/build.js';
import { drawOutro } from './scenes/outro.js';

const SCENE_RENDERERS = {
  hero: drawHero,
  line: drawLine,
  chant: drawChant,
  build: drawBuild,
  outro: drawOutro
};

const ENERGY_BY_EMPHASIS = { low: 0.25, normal: 0.5, high: 1.0 };

export class ClaudePopEngine {
  constructor(canvas, { palette = PALETTE } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.palette = palette;
    this.mascot = new Bloom({ palette });
    this.particles = new ParticleField(36, palette);
    this.timeline = { sections: [] };
    this.lastFrameTime = null;

    // Horloge externe : soit pilotée par un <audio>, soit par un temps injecté
    // manuellement (utilisé par le rendu hors-ligne / headless).
    this.clock = { getTime: () => 0 };
  }

  loadTimeline(timeline) {
    this.timeline = timeline;
    this.timeline.sections = [...timeline.sections].sort((a, b) => a.start - b.start);
  }

  setClock(getTime) {
    this.clock = { getTime };
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._w = rect.width;
    this._h = rect.height;
  }

  _currentCue(t) {
    return this.timeline.sections.find((s) => t >= s.start && t < s.end) || null;
  }

  renderFrame(t) {
    const ctx = this.ctx;
    const w = this._w || this.canvas.width;
    const h = this._h || this.canvas.height;
    const dt = this.lastFrameTime === null ? 0 : t - this.lastFrameTime;
    this.lastFrameTime = t;

    const cue = this._currentCue(t);
    const energy = cue ? ENERGY_BY_EMPHASIS[cue.emphasis] ?? 0.5 : 0.15;

    // Fond papier
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, this.palette.bgTop);
    grad.addColorStop(1, this.palette.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this._drawGrid(ctx, w, h);

    this.particles.update(Math.max(0, dt), energy);
    this.particles.draw(ctx, w, h, energy);

    // Mascotte, ancrée en haut, discrète pendant les scènes "hero"/"chant" pleines,
    // plus présente pendant "line"/"build"/"outro".
    const mascotVisible = cue ? cue.type !== 'hero' : true;
    if (mascotVisible) {
      const r = Math.min(w, h) * 0.09;
      this.mascot.draw(ctx, { x: w * 0.14, y: h * 0.18, radius: r, t, energy });
    }

    if (cue) {
      const renderer = SCENE_RENDERERS[cue.type] || drawLine;
      renderer(ctx, {
        w, h, cue,
        localT: t - cue.start,
        cueDuration: cue.end - cue.start,
        palette: this.palette,
        energy
      });
    }
  }

  _drawGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = this.palette.gridLine;
    ctx.lineWidth = 1;
    const step = Math.max(w, h) / 14;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  }

  start() {
    const loop = () => {
      this.resize();
      this.renderFrame(this.clock.getTime());
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
