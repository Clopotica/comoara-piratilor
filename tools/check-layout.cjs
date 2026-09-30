const fs=require('fs'), http=require('http'), path=require('path'), assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const output=process.env.LAYOUT_OUTPUT||path.join(require('os').tmpdir(),'clopotica-layout');
fs.mkdirSync(output,{recursive:true});
async function checkLayout(page,label){
 const issues=await page.evaluate(()=>{
  const errors=[],box=e=>e.getBoundingClientRect(),describe=e=>(e.className+' '+(e.textContent||'').trim()).slice(0,90);
  const root=document.querySelector('#voal .foaie')||document.querySelector('#app');
  for(const panel of root.querySelectorAll('.rail,.pod,.cap,.corp')){
   const r=box(panel);
   if(r.left<-.5||r.right>innerWidth+.5)errors.push('Panel outside viewport: '+describe(panel));
   if(panel.scrollWidth>panel.clientWidth+1)errors.push('Horizontal overflow: '+describe(panel));
   if(panel.matches('.pod,.rail')&&(r.top<-.5||r.bottom>innerHeight+.5))errors.push('Controls outside viewport: '+describe(panel));
  }
  for(const b of root.querySelectorAll('button')){
   if(!b.offsetWidth)continue;const r=box(b);
   if(r.width<47.5||r.height<47.5)errors.push('Small target '+Math.round(r.width)+'x'+Math.round(r.height)+': '+describe(b));
   if(b.scrollWidth>b.clientWidth+1||b.scrollHeight>b.clientHeight+1)errors.push('Clipped control: '+describe(b));
  }
  const chart=document.querySelector('.chart');
  if(chart){
   const r=box(chart),islands=[...chart.querySelectorAll('.insula')];
   for(const e of islands){
    const b=box(e);if(b.left<r.left||b.right>r.right||b.top<r.top||b.bottom>r.bottom)errors.push('Island outside map: '+describe(e));
    for(const label of e.querySelectorAll('.et')){const t=box(label);if(t.left<r.left||t.right>r.right)errors.push('Label outside map: '+describe(label));}
   }
   for(let i=0;i<islands.length;i++)for(let j=i+1;j<islands.length;j++){
    const a=box(islands[i]),b=box(islands[j]);
    if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)errors.push('Islands overlap: '+i+'/'+j);
   }
  }
  const close=document.querySelector('.inchide'),title=document.querySelector('#voal h2');
  if(close&&title){const a=box(close),b=box(title);if(Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top))errors.push('Close button overlaps dialog heading');}
  return [...new Set(errors)];
 });
 return issues.map(issue=>label+': '+issue);
}
(async()=>{
 const server=http.createServer((q,r)=>{
  const pathname=decodeURIComponent(q.url.split('?')[0]),file=path.join(root,pathname==='/'?'index.html':pathname);
  fs.readFile(file,(error,data)=>{r.writeHead(error?404:200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'application/javascript':'audio/mpeg'});r.end(error?'':data)});
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 const failures=[],runtimeErrors=[];let checks=0;
 try{
  const page=await browser.newPage({hasTouch:true,reducedMotion:'reduce',viewport:{width:1920,height:1080}});
  page.on('pageerror',e=>runtimeErrors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(output,'login-1920.png')});
  assert(await page.locator('#login-wall').isVisible());
  await page.evaluate(()=>sessionStorage.setItem('clopotica-comoara-login-v1','user01'));
  await page.reload();await page.waitForFunction(()=>typeof S!=='undefined');await page.evaluate(()=>document.fonts.ready);
  const fixtures=await page.evaluate(()=>{
   const noop=function(){};
   ['spune','sOk','sNu','sClic','sPremiu','confetti','ton','preincarca','ambianta','opresteAmb','taci'].forEach(n=>window[n]=noop);
   const cases={};
   for(const niv of ['mus','cap'])for(let l=0;l<NR_LUMI;l++){
    S.niv=niv;INSULE=lumea(l);
    for(let i=0;i<INSULE.length;i++)coada(i).forEach((raw,p)=>{
     const step=R(raw),kind=step.t+(step.ceas?'-ceas':'')+(step.doc?'-doc':'')+(step.mod==='litere'?'-litere':'')+(step.jurnal?'-jurnal':'');
     const score=JSON.stringify(step).length+(step.rows||0)*300+(step.pool||[]).length*80;
     if(!cases[kind]||cases[kind].score<score)cases[kind]={l,i,p,niv,score,kind};
    });
   }
   S=stareNoua();INSULE=lumea(0);return Object.values(cases);
  });
  console.log('Fixtures:',fixtures.map(f=>f.kind).join(', '));
  for(const [width,height] of (process.env.LAYOUT_SIZES?JSON.parse(process.env.LAYOUT_SIZES):[[1920,1080],[1280,720],[1024,768],[3840,2160],[800,600],[390,844],[320,640]])){
   await page.setViewportSize({width,height});await page.evaluate(()=>{document.activeElement.blur();potriveste();S=stareNoua();S.sunet=false;S.voce=false;S.nume='Ana Ochi-de-Șoim';S.dub=12345;INSULE=lumea(0)});
   for(const screen of ['intro','setup','lumi','final']){
    await page.evaluate(screen=>{S.ecran=screen;render()},screen);failures.push(...await checkLayout(page,width+'/'+screen));checks++;
   }
   for(let l=0;l<100;l++){
    await page.evaluate(l=>{S.lume=l;INSULE=lumea(l);S.ecran='chart';S.gata=[];render()},l);
    failures.push(...await checkLayout(page,width+'/map'+l));checks++;
   }
   await page.screenshot({path:path.join(output,'map-'+width+'.png')});
   for(const fixture of fixtures){
    await page.evaluate(f=>{S.lume=f.l;S.niv=f.niv;S.ins=f.i;S.p=f.p;S.ecran='joc';INSULE=lumea(f.l);intraPas();if(A.pas.t==='memorie'){A.gen=-1;A.faza='raspunde'}render();if(A.pas.t==='film')terminaFilm(true)},fixture);
    failures.push(...await checkLayout(page,width+'/'+fixture.kind));checks++;
    await page.evaluate(()=>{
     if(A.pas.t==='cod'){A.buf=A.pas.ras.split('');verificaCod()}
     else if(A.pas.t==='alege')raspAlege(A.opt.findIndex(o=>o.ok));
     else if(A.pas.t==='harta')raspHarta(A.pas.ras);
     else if(A.pas.t==='decizie')raspDecizie(0);
     else if(A.pas.t==='memorie'){A.faza='raspunde';A.seq.slice().forEach(i=>tastaMem(i))}
     else if(A.pas.t==='ordine')A.pas.items.slice().sort((a,b)=>a-b).forEach(v=>tastaOrd(v));
    });
    failures.push(...await checkLayout(page,width+'/'+fixture.kind+'-answered'));checks++;
    if(fixture.kind==='cod-litere')await page.screenshot({path:path.join(output,'code-'+width+'.png')});
   }
   for(const dialog of ['jurnal','fereastraVoce']){
    await page.evaluate(dialog=>window[dialog](),dialog);failures.push(...await checkLayout(page,width+'/'+dialog));checks++;
    if(dialog==='jurnal')await page.screenshot({path:path.join(output,'journal-'+width+'.png')});
    await page.evaluate(()=>inchide());
   }
   console.log('Checked',width,height,'issues',failures.length);
  }
  assert.deepEqual(runtimeErrors,[],'Runtime errors');
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks,failures,runtimeErrors},null,2));
  console.log(JSON.stringify({checks,failures:failures.slice(0,35),totalFailures:failures.length,output},null,2));
  if(failures.length)process.exitCode=1;
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exit(1)});
