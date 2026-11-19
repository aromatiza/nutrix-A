'use strict';
const {send,parse}=require('../../lib/http');
const nutrixdata=require('../../lib/nutrixdata');
/** GET /api/data/dishes — plats marocains VALIDÉS de NutriX Data (Supabase), valeurs par portion, Nutri-Score, NOVA, photo */
module.exports=async function handler(req,res){
 const url=parse(req,res);if(!url)return;
 if(req.method!=='GET')return send(res,405,{error:'Méthode incorrecte'});
 const list=await nutrixdata.dishes();
 if(!list)return send(res,502,{error:'NutriX Data indisponible',dishes:[]});
 return send(res,200,{source:'NutriX Data',count:list.length,dishes:list},{'Cache-Control':'public, s-maxage=600, stale-while-revalidate=3600'});
};
