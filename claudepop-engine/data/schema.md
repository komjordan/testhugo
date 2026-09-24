# Format des données de paroles (lyrics timeline)

Le moteur charge un fichier JSON décrivant la chronologie des paroles. Ce fichier
n'est jamais fourni par le dépôt pour la chanson réelle — vous le créez vous-même
localement à partir de vos propres droits (cf. `docs/PREVIEW-LOCAL.md`).

## Structure

```json
{
  "title": "Titre du morceau",
  "bpm": 120,
  "durationSec": 180,
  "sections": [
    {
      "id": "intro-1",
      "type": "hero",
      "start": 0.0,
      "end": 3.2,
      "text": "PREMIÈRE LIGNE",
      "emphasis": "high"
    },
    {
      "id": "verse-1-line-1",
      "type": "line",
      "start": 3.2,
      "end": 6.8,
      "text": "Une phrase du couplet",
      "emphasis": "normal"
    },
    {
      "id": "chorus-1-hook",
      "type": "chant",
      "start": 24.0,
      "end": 28.0,
      "text": "LE HOOK DU REFRAIN",
      "emphasis": "high"
    }
  ]
}
```

## Champs

- `start` / `end` : secondes, flottants, relatifs au début de la piste audio.
- `type` : nom du "scene renderer" à utiliser pour cette réplique. Types fournis
  par défaut : `hero`, `line`, `chant`, `build`, `outro`. Vous pouvez enregistrer
  vos propres types dans `src/scenes/`.
- `text` : texte français à afficher (déjà traduit/synchronisé par vos soins).
- `emphasis` : `low` | `normal` | `high` — influence la taille, la vitesse
  d'apparition et l'intensité du mascotte/particules.

## Règle de découpage

Une réplique ne doit jamais dépasser ~45 caractères sur une seule ligne à l'écran
(sécurité de lisibilité mobile). Le moteur retourne à la ligne automatiquement,
mais préférez déjà découper vos phrases longues en plusieurs objets `section`
successifs plutôt que de compter sur le retour à la ligne automatique.
