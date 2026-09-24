# Claude Pop — moteur de typographie cinétique (prototype)

Moteur JS (Canvas 2D) pour un clip lyrique animé, avec paroles françaises
synchronisées et un rendu vidéo assemblable localement. Direction artistique
originale (papier/éditorial, mascotte florale/solaire "Bloom" dessinée pour ce
projet) — indépendante du projet de référence cité dans la demande initiale.

## Ce que ce dossier contient

- `src/engine.js` : boucle de rendu, timeline, gestion des scènes.
- `src/scenes/*` : 5 "scene renderers" (hero, line, chant, build, outro).
- `src/mascot.js` : personnage "Bloom", design original.
- `src/particles.js` : fond génératif.
- `data/schema.md` + `data/demo-lyrics.json` : format des paroles et un jeu de
  données de démonstration (texte de test générique, **pas** les paroles d'une
  chanson existante).
- `index.html` / `app.js` / `style.css` : prévisualisation dans le navigateur,
  avec chargement de fichiers **locaux uniquement**.
- `render/render.mjs` : rendu hors-ligne (Playwright + ffmpeg) vers un MP4.

## Ce que ce dossier NE contient PAS

- Aucune piste audio protégée par des droits.
- Aucune parole de chanson existante (transcrite, traduite ou autre).
- Le dossier `local-assets/` est ignoré par git : c'est là que vous pouvez
  déposer vos propres fichiers (audio, JSON de paroles) sans jamais les
  committer.

## Prévisualisation dans le navigateur

```bash
cd claudepop-engine
python3 -m http.server 8080
# puis ouvrez http://localhost:8080
```

Dans la page :
1. Cliquez "Charger un audio local" → sélectionnez votre fichier (mp3/wav/m4a).
   Il est chargé en mémoire via `URL.createObjectURL`, jamais uploadé.
2. Cliquez "Charger des paroles (.json)" → votre fichier au format décrit dans
   `data/schema.md`, ou "Charger la démo intégrée" pour tester avec le jeu de
   données de démonstration.
3. "Lecture" démarre la piste ; le moteur se synchronise sur `audio.currentTime`.

## Rendu vidéo local

```bash
cd claudepop-engine
npm install          # installe Playwright (une fois)
npx playwright install chromium   # si Chromium n'est pas déjà présent

npm run render -- \
  --lyrics /chemin/vers/vos-paroles.json \
  --audio  /chemin/vers/votre-audio.mp3 \
  --fps 30 --width 1080 --height 1920 \
  --out out/clip.mp4
```

Le script :
1. Ouvre `index.html` dans Chromium headless.
2. Injecte votre timeline de paroles.
3. Avance image par image (pas en temps réel) et capture chaque frame du canvas.
4. Assemble les frames + votre fichier audio avec `ffmpeg` en un seul MP4.

Aucune étape ne télécharge ni ne publie quoi que ce soit : tout se passe sur
votre machine, à partir de vos propres fichiers.

## Prototype de démonstration (15–20s)

`demo/demo-bed.mp3` est une piste synthétisée programmatiquement pour ce
projet (générateurs de formes d'onde, aucun échantillon tiers) — uniquement
pour vérifier que le pipeline audio→rendu fonctionne. Elle n'est pas destinée
à être utilisée dans le clip final.

```bash
npm run render -- --lyrics data/demo-lyrics.json --audio demo/demo-bed.mp3 --out out/demo.mp4
```

## Étendre le moteur pour la chanson complète

Une fois vos droits vérifiés :
1. Transcrivez/traduisez vos paroles dans un fichier JSON suivant
   `data/schema.md`, en le gardant dans `local-assets/` (jamais commité).
2. Ajustez la palette (`src/palette.js`) et les scènes si besoin pour coller à
   la progression de votre morceau (nouvelles sections, nouveaux types de
   scène dans `src/scenes/`).
3. Lancez `npm run render` avec votre audio et vos paroles complètes.
