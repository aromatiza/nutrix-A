'use strict';
/* NutriX Data — base marocaine (Supabase) remplie par la tâche planifiée et VALIDÉE par l'équipe
   sur https://data-site-gold.vercel.app. Seules les lignes au statut « valide » sont lisibles
   (règles RLS côté Supabase) : rien de ce qui est « à valider » n'arrive dans l'app.

   La clé ci-dessous est la clé PUBLIQUE « anon » de Supabase (faite pour être visible dans un
   navigateur) : elle ne permet que la lecture des données validées. On peut la remplacer par les
   variables Vercel NUTRIX_DATA_URL et NUTRIX_DATA_ANON_KEY. Ne jamais mettre ici la clé service_role. */
const BASE = (process.env.NUTRIX_DATA_URL || 'https://bbpehxuhhvnjfpyaromn.supabase.co').replace(/\/$/, '');
const KEY = process.env.NUTRIX_DATA_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicGVoeHVoaHZuamZweWFyb21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMDY3NTcsImV4cCI6MjExMDU4Mjc1N30.-NcNP_0UH3JcE-2hRhFqsTc5r6SEHtgVuGMibEEd2vQ';

const cache = new Map();
const TTL_PRODUCT = 5 * 60 * 1000, TTL_DISHES = 10 * 60 * 1000;

async function rest(path, ms = 4500) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(BASE + '/rest/v1/' + path, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Accept: 'application/json' }, signal: ac.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(t); }
}
const num = v => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v))) ? undefined : Number(v);

/** Produit validé par code-barres, au format Open Food Facts (pour réutiliser tout l'affichage du scanner). */
async function product(code) {
  if (!/^\d{8,14}$/.test(String(code))) return null;
  const key = 'p:' + code, c = cache.get(key);
  if (c && Date.now() - c.t < TTL_PRODUCT) return c.v;
  const sel = 'barcode,name,brand,quantity,image_url,ingredients_text,energy_kcal,protein_g,carbs_g,sugars_g,fat_g,sat_fat_g,fiber_g,salt_g,nutriscore_grade,nutriscore_score,scores_source,nova_group,nova_source,values_source,product_additives(additives(e_code))';
  const rows = await rest('products?select=' + encodeURIComponent(sel) + '&status=eq.valide&barcode=eq.' + code + '&limit=1');
  let v = null;
  if (Array.isArray(rows) && rows[0]) {
    const p = rows[0];
    const adds = (p.product_additives || []).map(x => x.additives && x.additives.e_code).filter(Boolean).map(e => 'en:' + String(e).toLowerCase());
    const notes = [];
    if (p.scores_source === 'calcul') notes.push('Nutri-Score calculé');
    if (p.nova_source === 'estimation_ia') notes.push('NOVA estimé par IA');
    if (p.values_source === 'photo_etiquette_ia') notes.push('valeurs lues sur l’étiquette par IA');
    v = {
      status: 1, code: String(code),
      product: {
        code: String(code), product_name: p.name, brands: p.brand || '', quantity: p.quantity || '',
        image_front_url: p.image_url || '', ingredients_text: p.ingredients_text || '',
        nutriments: {
          'energy-kcal_100g': num(p.energy_kcal), proteins_100g: num(p.protein_g), carbohydrates_100g: num(p.carbs_g),
          sugars_100g: num(p.sugars_g), fat_100g: num(p.fat_g), 'saturated-fat_100g': num(p.sat_fat_g),
          fiber_100g: num(p.fiber_g), salt_100g: num(p.salt_g)
        },
        nutriscore_grade: p.nutriscore_grade || '', nutrition_grades: p.nutriscore_grade || '',
        nutriscore_score: num(p.nutriscore_score), nova_group: num(p.nova_group),
        additives_tags: adds, additives_n: adds.length, countries_tags: ['en:morocco'],
        _source: 'NutriX Data · base marocaine validée' + (notes.length ? ' (' + notes.join(', ') + ')' : ''),
        _estimated: p.values_source === 'photo_etiquette_ia',
        _nutrixdata: true
      }
    };
  }
  // on ne garde en cache que les réponses réussies (un échec réseau ne doit pas masquer un produit 5 minutes)
  if (rows !== null) cache.set(key, { t: Date.now(), v });
  return v;
}

/** Plats marocains validés, avec valeurs PAR PORTION calculées par la base (méthode des recettes), Nutri-Score, NOVA et photo. */
async function dishes() {
  const c = cache.get('dishes');
  if (c && Date.now() - c.t < TTL_DISHES) return c.v;
  const [nut, info] = await Promise.all([
    rest('dish_nutrition?select=*&status=eq.valide', 6000),
    rest('dishes?select=' + encodeURIComponent('id,name_fr,name_darija,name_ar,category,region,portion_g,image_url,image_credit,image_source,confidence,recipes(version,status,sources,recipe_ingredients(raw_label,grams,ingredients(name_fr)))') + '&status=eq.valide', 6000)
  ]);
  if (!Array.isArray(nut) || !Array.isArray(info)) return c ? c.v : null;
  const byId = Object.fromEntries(info.map(d => [d.id, d]));
  const r1 = x => Math.round(x * 10) / 10;
  // seulement les plats complets : un ingrédient non relié donnerait des calories fausses
  const list = nut.filter(n => n.energy_kcal_100g != null && Number(n.n_unlinked) === 0 && byId[n.dish_id]).map(n => {
    const d = byId[n.dish_id];
    const portion = Number(d.portion_g) || 250;
    const k = portion / 100;
    const rec = (d.recipes || []).filter(r => r.status !== 'rejete').sort((a, b) => b.version - a.version)[0] || {};
    const ing = (rec.recipe_ingredients || []).map(l => (l.ingredients && l.ingredients.name_fr) || l.raw_label).filter(Boolean)
      .map(s => String(s).split(',')[0].trim()).filter((s, i, a) => a.indexOf(s) === i).slice(0, 12);
    return {
      id: d.id, name: d.name_fr, darija: d.name_darija || '', ar: d.name_ar || '', category: d.category || '', region: d.region || '',
      portion_g: portion,
      kcal: Math.round(Number(n.energy_kcal_100g) * k), p: r1(Number(n.protein_g_100g) * k), c: r1(Number(n.carbs_g_100g) * k), f: r1(Number(n.fat_g_100g) * k),
      per100: { kcal: Number(n.energy_kcal_100g), p: Number(n.protein_g_100g), c: Number(n.carbs_g_100g), f: Number(n.fat_g_100g), fiber: Number(n.fiber_g_100g), salt: Number(n.salt_g_100g), sugars: Number(n.sugars_g_100g) },
      nutriscore: n.nutriscore_grade || '', nutriscore_score: n.nutriscore_score, nova: n.nova_group, nova_manual: !!n.nova_is_manual, rating: n.rating ?? null,
      image: /^https:\/\//.test(d.image_url || '') ? d.image_url : '', image_credit: d.image_credit || '', image_source: d.image_source || '',
      ing, sources: (rec.sources || []).filter(s => s && /^https?:\/\//.test(s.url || '')).slice(0, 5)
    };
  });
  cache.set('dishes', { t: Date.now(), v: list });
  return list;
}

/** Produits validés (liste légère) : sert à reconnaître un produit photographié dans le Studio. */
async function products() {
  const c = cache.get('products');
  if (c && Date.now() - c.t < TTL_DISHES) return c.v;
  const sel = 'id,barcode,name,brand,quantity,image_url,energy_kcal,protein_g,carbs_g,sugars_g,fat_g,sat_fat_g,fiber_g,salt_g,nutriscore_grade,nutriscore_score,scores_source,nova_group,nova_source,values_source,rating,category';
  const rows = await rest('products?select=' + encodeURIComponent(sel) + '&status=eq.valide&limit=1000', 6000);
  if (!Array.isArray(rows)) return c ? c.v : null;
  const list = rows.filter(p => p.name).map(p => ({
    id: p.id, barcode: String(p.barcode || ''), name: p.name, brand: p.brand || '', quantity: p.quantity || '', category: p.category || '',
    image: /^https:\/\//.test(p.image_url || '') ? p.image_url : '',
    per100: { kcal: num(p.energy_kcal), p: num(p.protein_g), c: num(p.carbs_g), sugar: num(p.sugars_g), f: num(p.fat_g), sat: num(p.sat_fat_g), fiber: num(p.fiber_g), salt: num(p.salt_g) },
    nutriscore: p.nutriscore_grade || '', nutriscore_estimated: p.scores_source === 'calcul', nova: num(p.nova_group) ?? null,
    nova_estimated: p.nova_source === 'estimation_ia', values_estimated: p.values_source === 'photo_etiquette_ia', rating: num(p.rating) ?? null
  }));
  cache.set('products', { t: Date.now(), v: list });
  return list;
}

module.exports = { product, dishes, products };
