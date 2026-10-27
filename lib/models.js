'use strict';
// UN modèle par fonction. Pour changer le modèle d'une fonction dans Vercel : GEMINI_MODEL_<FONCTION> (ex. GEMINI_MODEL_CHAT).
// Les anciennes variables (GEMINI_MODEL, GEMINI_FAST_MODEL, GEMINI_CHAT_MODEL, GEMINI_VISION_MODEL, GEMINI_IMAGE_MODEL) marchent toujours.
const TIER={main:'gemini-3.5-flash',fast:'gemini-3.5-flash-lite',image:'gemini-nano-banana-2.1'};
const FUNCTIONS={
  chat:      {tier:'fast', legacy:['GEMINI_CHAT_MODEL','GEMINI_FAST_MODEL'],   info:'Chat Nutrix AI (réponses en direct)'},
  vision:    {tier:'fast', legacy:['GEMINI_VISION_MODEL','GEMINI_FAST_MODEL'], info:'Studio : analyse de photos (repas, frigo, produit, menu) et photo scanner'},
  voice:     {tier:'fast', legacy:['GEMINI_CHAT_MODEL','GEMINI_FAST_MODEL'],   info:'Message vocal → texte'},
  chef:      {tier:'main', legacy:['GEMINI_MODEL'],                            info:'Chef : recettes complètes'},
  dishsearch:{tier:'fast', legacy:['GEMINI_FAST_MODEL'],                       info:'Photos de plats : écrit les recherches'},
  dishjudge: {tier:'fast', legacy:['GEMINI_VISION_MODEL','GEMINI_FAST_MODEL'], info:'Photos de plats : choisit les meilleures photos'},
  image:     {tier:'image',legacy:['GEMINI_IMAGE_MODEL'],                       info:'Photo IA : dessine une image'}
};
const model=fn=>{const c=FUNCTIONS[fn];if(!c)throw new Error('Fonction IA inconnue : '+fn);const E=process.env;
  return E['GEMINI_MODEL_'+fn.toUpperCase()]||c.legacy.map(k=>E[k]).find(Boolean)||TIER[c.tier];};
const fallback=fn=>process.env['GEMINI_FALLBACK_'+fn.toUpperCase()]||process.env.GEMINI_FALLBACK_MODEL||(FUNCTIONS[fn].tier==='image'?'gemini-3.1-flash-image':TIER.fast);
const all=()=>Object.fromEntries(Object.entries(FUNCTIONS).map(([fn,c])=>[fn,{model:model(fn),fallback:fallback(fn),info:c.info}]));
module.exports={model,fallback,all,FUNCTIONS};
