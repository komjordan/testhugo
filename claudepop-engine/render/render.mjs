#!/usr/bin/env node
// Rendu hors-ligne du moteur, image par image, puis assemblage avec ffmpeg.
//
// Usage :
//   node render/render.mjs --lyrics path/vers/paroles.json \
//                           --audio path/vers/audio.mp3 \
//                           --duration 180 --fps 30 --out out/clip.mp4
//
// L'audio et les paroles sont fournis par VOUS au moment du rendu, en local.
// Ce script ne télécharge et ne publie rien ; il ne fait qu'assembler des
// fichiers déjà présents sur votre machine.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, readFile as readFileAsync } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, createReadStream } from 'node:fs';
import http from 'node:http';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png'
};

function serveDir(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      const filePath = path.join(dir, urlPath === '/' ? '/index.html' : urlPath);
      if (!filePath.startsWith(dir)) { res.writeHead(403); res.end(); return; }
      const ext = path.extname(filePath);
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      const stream = createReadStream(filePath);
      stream.on('error', () => { res.writeHead(404); res.end(); });
      stream.pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { fps: 30, width: 1080, height: 1920, out: 'out/clip.mp4' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1];
      out[key] = val;
      i++;
    }
  }
  return out;
}

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.lyrics || !args.audio) {
    console.error('Usage: node render/render.mjs --lyrics <fichier.json> --audio <fichier> --duration <sec> [--fps 30] [--out out/clip.mp4]');
    process.exit(1);
  }

  const lyricsPath = path.resolve(args.lyrics);
  const audioPath = path.resolve(args.audio);
  if (!existsSync(lyricsPath)) throw new Error(`Paroles introuvables: ${lyricsPath}`);
  if (!existsSync(audioPath)) throw new Error(`Audio introuvable: ${audioPath}`);

  const fps = Number(args.fps);
  const width = Number(args.width);
  const height = Number(args.height);
  const outPath = path.resolve(args.out);
  await mkdir(path.dirname(outPath), { recursive: true });

  // Durée : soit fournie, soit lue depuis le JSON (fin de la dernière réplique).
  const { readFile } = await import('node:fs/promises');
  const timeline = JSON.parse(await readFile(lyricsPath, 'utf8'));
  const duration = Number(args.duration) || timeline.durationSec ||
    Math.max(...timeline.sections.map((s) => s.end));

  const frameDir = await mkdtemp(path.join(tmpdir(), 'claudepop-frames-'));
  console.log(`Dossier de frames temporaire: ${frameDir}`);
  console.log(`Rendu de ${duration}s à ${fps}fps (${Math.ceil(duration * fps)} images)...`);

  const server = await serveDir(root);
  const port = server.address().port;

  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (err) => console.log('[pageerror]', err.message));
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  await page.waitForFunction(() => window.__claudePop && window.__claudePop.engine);

  // Injecte la timeline directement (pas besoin de l'input file en mode headless)
  // et stoppe la boucle temps réel de la page : en rendu hors-ligne, seul
  // renderAt(t) doit dessiner, sinon la boucle live (calée sur audio.currentTime,
  // qui reste à 0 hors lecture) écrase nos frames avant la capture.
  await page.evaluate((tl) => {
    window.__claudePop.engine.loadTimeline(tl);
    window.__claudePop.engine.resize();
    window.__claudePop.engine.stop();
  }, timeline);

  const totalFrames = Math.ceil(duration * fps);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    await page.evaluate((tt) => window.__claudePop.renderAt(tt), t);
    const frameFile = path.join(frameDir, `f_${String(i).padStart(6, '0')}.png`);
    await page.locator('#stage').screenshot({ path: frameFile });
    if (i % Math.max(1, Math.floor(fps)) === 0) {
      process.stdout.write(`\r  ${i}/${totalFrames} images`);
    }
  }
  process.stdout.write('\n');
  await browser.close();
  server.close();

  console.log('Assemblage vidéo + audio avec ffmpeg...');
  await run('ffmpeg', [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(frameDir, 'f_%06d.png'),
    '-i', audioPath,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    outPath
  ]);

  await rm(frameDir, { recursive: true, force: true });
  console.log(`Terminé: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
