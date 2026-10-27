# Nutrix v15 — architecture

```
public/          Front-end (HTML/CSS/JS), servi par le CDN de Vercel
api/             Back-end : UNE fonction Vercel par route (chacune monte en charge séparément)
  health.js            GET  /api/health            (?test=gemini[&code=…] → teste chaque modèle)
  off/search.js        GET  /api/off/search?q=     (Open Food Facts + cache)
  off/product/[code].js GET /api/off/product/<code-barres>
  ai/chat.js           POST /api/ai/chat           (stream:true → réponse en direct)
  ai/photo.js          POST /api/ai/photo          (étiquette / repas dans le chat)
  ai/vision.js         POST /api/ai/vision         (Studio + recettes Chef)
  ai/image.js          GET|POST /api/ai/image      (Photo IA)
  ai/transcribe.js     POST /api/ai/transcribe     (voix → texte)
  ai/dishphoto.js      GET|POST /api/ai/dishphoto  (photos des plats marocains)
lib/             Code partagé par toutes les routes
  models.js      UN modèle par fonction (+ modèle de secours)
  gemini.js      appels Gemini : adaptation des paramètres, secours, relances, diagnostic
  guard.js       code d'accès + limites par personne
  store.js       limites + cache : mémoire, ou Redis partagé (Upstash) si configuré
  http.js        réponses JSON, CORS
  off.js, vision.js   logique des routes OFF et Studio/Photo IA
server.js        serveur local (npm start) — mêmes routes que Vercel
```

## Variables Vercel
| Variable | Rôle |
|---|---|
| `GEMINI_API_KEY` | clé Gemini (obligatoire) |
| `GEMINI_MODEL_CHAT` `…_VISION` `…_VOICE` `…_CHEF` `…_DISHSEARCH` `…_DISHJUDGE` `…_IMAGE` | modèle de CHAQUE fonction (défauts : flash-lite pour chat/vision/voice/dish, 3.5-flash pour chef, nano-banana-2.1 pour image) |
| `GEMINI_FALLBACK_MODEL` (ou `GEMINI_FALLBACK_<FONCTION>`) | modèle de secours |
| `GROQ_API_KEY` | **IA de secours gratuite (texte seulement)** : si Gemini est saturé (429) ou en erreur, le chat et les recettes Chef passent par Groq. Clé gratuite sur console.groq.com, sans carte |
| `GROQ_MODEL` | défaut `llama-3.3-70b-versatile` |
| `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` | **Images de secours gratuites** (FLUX) quand Gemini est saturé (Photo IA des plats, Studio) |
| (Groq) voix | avec `GROQ_API_KEY`, la transcription vocale passe aussi par Groq Whisper si Gemini échoue |
| `LLM_FALLBACK_KEY` / `LLM_FALLBACK_URL` / `LLM_FALLBACK_MODEL` | autre fournisseur compatible OpenAI (Cerebras, OpenRouter…) |
| `NUTRIX_ACCESS_CODE` | code sirri demandé avant d'utiliser l'IA |
| `AI_DAILY_LIMIT` | demandes IA par personne et par jour |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_URL/TOKEN`) | limites + cache partagés entre toutes les instances (recommandé en production) |
| `GEMINI_THINKING` | `low` (défaut), `medium`, `high` : réflexion des modèles Gemini 3+ |

Anciennes variables toujours acceptées : `GEMINI_MODEL` (chef), `GEMINI_FAST_MODEL`, `GEMINI_CHAT_MODEL`, `GEMINI_VISION_MODEL`, `GEMINI_IMAGE_MODEL`.

## Tests
`/api/health?test=gemini` : temps de réponse de chaque fonction. `/?warm=1` : prépare les photos des 85 plats marocains.

## Disjoncteur Gemini
Quand un modèle répond 429, il est mis de côté ~40 s (par instance) : les demandes suivantes ne consomment plus de quota et passent tout de suite au secours gratuit (Groq / Cloudflare) s'il est configuré. `/api/health?test=gemini` indique aussi quels secours sont actifs (`backup`).

## Darija (traduction complète)

Quand l'utilisateur choisit « دارجة », `public/nutrix-darija.js` (chargé à la demande, ~95 Ko) traduit toute l'interface :
dictionnaire `window.NX_ARY_MAP` (≈1 670 phrases) + moteur `window.NXTR.text()` (chiffres `#`, dates, jours, fragments, ingrédients courants).
Le moteur de `nutrix-layers.js` observe le DOM (texte, placeholder, title, aria-label, alt) et traduit aussi les textes générés dynamiquement.
Changer de langue recharge la page pour que tout (y compris le contenu JS dynamique) suive. Les noms de marque (Nutrix, Open Food Facts, Nutri-Score, NOVA…) et les données produits venant d'Open Food Facts restent tels quels.
Pour ajouter une phrase : ajouter `"Texte français":"ترجمة"` dans `NX_ARY_MAP`.
