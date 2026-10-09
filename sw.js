/* Ficha Forte: guarda o app no celular para abrir mesmo sem internet.
   O index.html vem sempre da internet quando ela responde (assim a versao nova aparece logo)
   e do celular quando nao responde. Icones e fonte vem do celular e se atualizam por tras.
   Se mudar a lista CORE, suba o numero de CACHE para limpar o cache antigo. */
const CACHE='ficha-forte-1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

// pagina: tenta a internet por ate 4 segundos, senao usa a copia guardada
async function page(req){
  const c=await caches.open(CACHE);
  try{
    const res=await Promise.race([fetch(req),new Promise((_,no)=>setTimeout(()=>no(new Error('demorou')),4000))]);
    if(res.ok)c.put('./',res.clone());
    return res;
  }catch(e){
    return (await c.match('./'))||(await c.match('index.html'))||Response.error();
  }
}
// outros arquivos: entrega a copia guardada na hora e atualiza por tras
async function file(e){
  const c=await caches.open(CACHE),hit=await c.match(e.request);
  const net=fetch(e.request).then(res=>{if(res.ok||res.type==='opaque')c.put(e.request,res.clone());return res}).catch(()=>hit||Response.error());
  if(hit){e.waitUntil(net);return hit}
  return net;
}

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(req.mode==='navigate'||(u.origin===location.origin&&u.pathname.endsWith('.html'))){e.respondWith(page(req));return}
  if(u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com')e.respondWith(file(e));
});
