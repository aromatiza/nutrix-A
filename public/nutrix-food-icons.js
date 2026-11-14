/* NUTRIX — icônes des aliments (un seul style : trait 1.8, bouts arrondis,
   viewBox 24, currentColor) + correspondance mot-clé → icône en français,
   darija (latin) et arabe. Usage : NxFood.icon('Poulet grillé') → '<svg…>'.
   Pour ajouter un aliment : une entrée dans PATHS + ses mots-clés dans KEYS. */
(()=>{'use strict';
const PATHS={
  chicken:'<path d="M15.5 4.5a5 5 0 0 1 3.5 8.6c-1.6 1.6-3.9 1.9-5.6 1.4L9.6 18.3a2.2 2.2 0 1 1-2.9 2.6 2.2 2.2 0 1 1 1.6-3.4l3.8-3.8c-.5-1.7-.2-4 1.4-5.6a5 5 0 0 1 2-1.6"/>',
  egg:'<path d="M12 3c3.6 0 6.5 5.4 6.5 10.2A6.5 6.5 0 0 1 5.5 13.2C5.5 8.4 8.4 3 12 3Z"/><circle cx="12" cy="14" r="2.6"/>',
  rice:'<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z"/><path d="M8 20h8"/><path d="M8.5 8.2l.6-1.4M12 7.6V6M15.5 8.2l-.6-1.4"/>',
  semolina:'<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0Z"/><path d="M6.5 12c.6-3.4 2.9-5.5 5.5-5.5s4.9 2.1 5.5 5.5"/><path d="M10 9.5h.01M13 8.8h.01M14.6 10.6h.01M9.2 11h.01"/>',
  bread:'<path d="M5 10.5C3.6 10 3 8.9 3 7.8 3 5.7 5.2 4 8 4h8c2.8 0 5 1.7 5 3.8 0 1.1-.6 2.2-2 2.7V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z"/><path d="M9 10v5M15 10v5"/>',
  tomato:'<path d="M12 7c4.4 0 8 2.9 8 6.8S16.4 20.5 12 20.5 4 17.7 4 13.8 7.6 7 12 7Z"/><path d="M12 7V4.5M9 6.5l3 1.5 3-1.5"/>',
  carrot:'<path d="M14.5 9.5 5 19a1.4 1.4 0 0 1-2-2l9.5-9.5a3 3 0 0 1 4.2 0l-.2-.2a3 3 0 0 1 0 4.2Z"/><path d="M15.5 8.5 19 5M16 4.5l.8 3.2M19.5 8l-3.2-.8M8 13l1.5 1.5M11 10l1.5 1.5"/>',
  potato:'<path d="M7.5 5.5c3-2 8.6-1.5 10.8 1.8 2.3 3.3 1.3 8.6-2 10.9-3.3 2.4-8.6 2-10.9-1.3-2.2-3.2-1-9.2 2.1-11.4Z"/><path d="M9.5 9h.01M14 8.5h.01M15 13h.01M10 14h.01"/>',
  olive:'<ellipse cx="10" cy="14.5" rx="5" ry="5.8" transform="rotate(-20 10 14.5)"/><path d="M12.5 9.5c1-2.7 3.4-4.8 6.5-5.5-.3 3-2.3 5.4-5 6.3"/><circle cx="9.3" cy="14.8" r="1.2"/>',
  fish:'<path d="M3 12c2.6-3.6 6-5.5 9.5-5.5 3.3 0 6 1.9 7.5 5.5-1.5 3.6-4.2 5.5-7.5 5.5C9 17.5 5.6 15.6 3 12Z"/><path d="M3 12 1.5 8.5M3 12l-1.5 3.5"/><path d="M15.5 11h.01"/><path d="M11 9.5c.8 1.6.8 3.4 0 5"/>',
  meat:'<path d="M15.8 4.2c2.9 1.4 4.6 4.6 3.6 7.8-1.1 3.6-5.3 6.6-9.5 7.3-3.4.6-5.9-1.1-5.9-3.9 0-2.2 1.6-3.5 3.3-4.6 1.3-.8 2-1.6 2.4-3.1.8-3.2 3.3-4.9 6.1-3.5Z"/><circle cx="14.5" cy="9.5" r="2"/>',
  lentils:'<path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0Z"/><ellipse cx="8.5" cy="9.5" rx="1.6" ry="1.1"/><ellipse cx="12.5" cy="8.6" rx="1.6" ry="1.1"/><ellipse cx="16" cy="10" rx="1.6" ry="1.1"/>',
  chickpea:'<circle cx="8.5" cy="13" r="4"/><circle cx="15.5" cy="13" r="4"/><circle cx="12" cy="7.5" r="3.5"/><path d="M8 11.5c.5.6.6 1.3.3 2M15 11.5c.5.6.6 1.3.3 2M11.6 6c.5.6.6 1.3.3 2"/>',
  cheese:'<path d="M3 17V10l10-5.5L21 10v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M3 10h18"/><circle cx="8" cy="14" r="1.3"/><circle cx="15" cy="13.5" r="1"/><circle cx="12" cy="16" r=".7"/>',
  milk:'<path d="M8.5 3h7M9 3v3l-2.5 3.5V20a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.5L15 6V3"/><path d="M6.5 13c2-1 3.6-1 5.5 0s3.5 1 5.5 0"/>',
  yogurt:'<path d="M5 9h14l-1.5 10.5a1.8 1.8 0 0 1-1.8 1.5H8.3a1.8 1.8 0 0 1-1.8-1.5Z"/><path d="M4 9h16"/><path d="M8 9c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5"/>',
  fruit:'<path d="M12 7.5c-1.6-1-3.6-1.3-5.3-.4C4.2 8.4 3.7 12 5 15.3c1.3 3.3 3.9 5.6 6 4.7l1-.4 1 .4c2.1.9 4.7-1.4 6-4.7 1.3-3.3.8-6.9-1.7-8.2-1.7-.9-3.7-.6-5.3.4Z"/><path d="M12 7.5c0-2 .8-3.4 2.5-4.5"/>',
  banana:'<path d="M4 13c4 3 9.5 3 13.5-1.5C19.6 9 20.3 6.4 20 4l1-1"/><path d="M4 13c-.6 4.1 2.6 7 7 7 4.8 0 8.6-3.6 9.2-9"/>',
  citrus:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.5"/><path d="M12 6.5v11M6.5 12h11M8.1 8.1l7.8 7.8M15.9 8.1l-7.8 7.8"/>',
  salad:'<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0Z"/><path d="M7 12c-.4-2.6 1-4.6 3.5-5M11 12c.2-3 2.1-5.3 5-5.5.4 2.2-.6 4-2 5.5M17 12c.8-1 2-1.7 3-1.8"/>',
  soup:'<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z"/><path d="M8 20h8"/><path d="M9 3.5c-.8 1.2.8 2.3 0 3.5M12.5 3.5c-.8 1.2.8 2.3 0 3.5M16 3.5c-.8 1.2.8 2.3 0 3.5"/>',
  tagine:'<path d="M3 17h18M5 17a7 2.2 0 0 0 14 0"/><path d="M6 17c0-4.5 2.7-8.6 6-10.5 3.3 1.9 6 6 6 10.5"/><path d="M12 6.5V4.5M10.8 4.5h2.4"/>',
  sweets:'<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M4 13.5h16"/><path d="M9 9V6.5a3 3 0 0 1 6 0V9"/>',
  oil:'<path d="M10 3h4M10.5 3v3.5L8 10v9.5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5V10l-2.5-3.5V3"/><path d="M12 13c1 1.4 1.5 2.3 1.5 3a1.5 1.5 0 0 1-3 0c0-.7.5-1.6 1.5-3Z"/>',
  tea:'<path d="M5 9h11v5a5.5 5.5 0 0 1-11 0Z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5c-.6.9.6 1.6 0 2.5M11.5 3.5c-.6.9.6 1.6 0 2.5"/><path d="M4 21h13"/>',
  nuts:'<path d="M12 4c3.9 0 7 3 7 7 0 5-4.2 9-7 9s-7-4-7-9c0-4 3.1-7 7-7Z"/><path d="M12 4v16M8 9.5c1.3.8 2.7 1.2 4 1.2s2.7-.4 4-1.2"/>',
  pasta:'<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0Z"/><path d="M7 12c0-2 1.5-2 1.5-4S10 6 10 4M11 12c0-2 1.5-2 1.5-4S14 6 14 4M15 12c0-1.6 1.2-2 1.2-3.5"/>',
  burger:'<path d="M4 10.5C4 6.9 7.6 4.5 12 4.5s8 2.4 8 6Z"/><path d="M3.5 14h17"/><path d="M4.5 17.5h15a1 1 0 0 1-1 2h-13a1 1 0 0 1-1-2Z"/><path d="M4 14c1.2-1 2.4-1 3.6 0s2.4 1 3.6 0 2.4-1 3.6 0 2.4 1 3.6 0"/>',
  pizza:'<path d="M12 21 3.5 6.5C8.6 3.4 15.4 3.4 20.5 6.5Z"/><path d="M5 9c4.3-2.2 9.7-2.2 14 0"/><circle cx="11" cy="11.5" r="1.1"/><circle cx="14" cy="14.5" r="1"/>',
  plate:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>'
};
/* mots-clés (normalisés : minuscules, sans accents) */
const KEYS=[
  ['chicken','poulet,dinde,blanc de poulet,cuisse,djaj,jaj,دجاج,ديك رومي,بيبي'],
  ['egg','oeuf,oeufs,omelette,bid,بيض,اومليت'],
  ['rice','riz,quinoa,boulgour,كينوا,rouz,roz,ruz,أرز,رز,روز'],
  ['semolina','couscous,semoule,seksou,kesksou,berkoukes,سكسو,كسكس,كسكسو,سميدة,بركوكش'],
  ['bread','pain,khobz,khubz,msemen,baghrir,harcha,batbout,rghaif,toast,sandwich,خبز,مسمن,بغرير,حرشة,بطبوط,رغايف,كسرة'],
  ['tomato','tomate,tomatoes,matecha,maticha,طماطم,ماطيشة'],
  ['carrot','carotte,khizou,خيزو,جزر'],
  ['potato','pomme de terre,pommes de terre,patate,frites,btata,بطاطا,بطاطس'],
  ['olive','olive,olives,zitoun,زيتون'],
  ['fish','poisson,sardine,thon,saumon,merlan,salmon,hout,sardin,سلمون,حوت,سردين,طون,سمك'],
  ['meat','viande,boeuf,agneau,mouton,veau,kefta,kafta,merguez,lham,l7am,steak,لحم,كفتة,مرقاز,غنمي,بقري'],
  ['lentils','lentille,lentilles,3des,ades,adas,عدس'],
  ['chickpea','pois chiche,pois chiches,hommos,houmous,hummus,7ommos,loubia,haricot,haricots,حمص,لوبيا,فول'],
  ['cheese','fromage,jben,frmage,feta,mozzarella,جبن,فرماج,جبنة'],
  ['milk','lait,lben,leben,7lib,hlib,حليب,لبن,raib,رايب'],
  ['yogurt','yaourt,yogourt,yoghurt,danone,ياغورت,دانون'],
  ['banana','banane,banan,موز,بنان'],
  ['citrus','orange,citron,limoun,mandarine,clementine,pamplemousse,ليمون,لتشين,برتقال,حامض'],
  ['fruit','fruit,avocat,avocado,افوكا,أفوكا,pomme,poire,figue,datte,raisin,grenade,fraise,peche,abricot,melon,pasteque,tffa7,tfah,karmous,tmar,rumman,تفاح,فاكهة,كرموس,تمر,رمان,عنب,فراولة,دلاح,بطيخ'],
  ['salad','salade,crudites,laitue,concombre,poivron,legume,legumes,khodra,خضرة,سلطة,شلاضة,خيار,فلفل'],
  ['soup','soupe,harira,bissara,veloute,chorba,حريرة,بيصارة,شربة,صوبة'],
  ['tagine','tajine,tagine,tanjia,tangia,طاجين,طنجية'],
  ['sweets','gateau,chebakia,patisserie,dessert,biscuit,chocolat,sucre,miel,cornes,ghriba,briouat,shbakia,حلوة,شباكية,غريبة,كيك,شكلاط,عسل,سكر'],
  ['oil','huile,beurre,smen,زيت,زبدة,سمن'],
  ['tea','the,atay,cafe,coffee,اتاي,أتاي,قهوة,شاي'],
  ['nuts','amande,amandes,noix,cacahuete,pistache,loz,gerga3,لوز,كركاع,جوز,كاوكاو'],
  ['pasta','pates,spaghetti,macaroni,lasagne,vermicelle,chaariya,شعرية,مقارون,معكرونة'],
  ['burger','burger,hamburger,برغر'],
  ['pizza','pizza,بيتزا']
];
const norm=t=>String(t||'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’'\-_.]/g,' ').replace(/\s+/g,' ').trim();
const TABLE=[];KEYS.forEach(([k,list])=>list.split(',').forEach(w=>{w=norm(w);if(w)TABLE.push([w,k])}));
TABLE.sort((a,b)=>b[0].length-a[0].length); // le mot le plus long gagne (« pois chiche » avant « pois »)
function key(name){const t=" "+norm(name)+" ";let best=null,bp=1e9,bl=0;for(const [w,k] of TABLE){const ar=/[؀-ۿ]/.test(w);let i=ar?t.indexOf(w):t.indexOf(" "+w+" ");if(i<0&&!ar)i=t.indexOf(" "+w+"s ");if(i<0)continue;if(i<bp||(i===bp&&w.length>bl)){best=k;bp=i;bl=w.length}}return best||"plate"} // le 1er aliment cité gagne
function svg(k,size=22){return '<svg class="nx-food-ico" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(PATHS[k]||PATHS.plate)+'</svg>'}
window.NxFood={key,svg,icon:(name,size)=>svg(key(name),size),keys:Object.keys(PATHS)};
})();
