const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),output=process.env.CONTROL_OUTPUT||path.join(require('os').tmpdir(),'clopotica-controls');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const server=http.createServer((q,r)=>{const f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{r.writeHead(e?404:200,{'Content-Type':f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':'audio/mpeg'});r.end(e?'':d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768},hasTouch:true,reducedMotion:'reduce'}),runtime=[];page.on('pageerror',e=>runtime.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>sessionStorage.setItem('clopotica-comoara-login-v1','user01'));await page.reload();await page.waitForFunction(()=>typeof S!=='undefined');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{['spune','sOk','sNu','sClic','sPremiu','confetti','ton','preincarca','ambianta','opresteAmb','taci','salveaza'].forEach(n=>window[n]=()=>{});S.sunet=false;S.voce=false;S.nume='Ana Ochi-de-Șoim'});
  const reports=[];
  for(const [width,height] of (process.env.CONTROL_SIZES?JSON.parse(process.env.CONTROL_SIZES):[[1920,1080],[3840,2160],[1366,768],[1280,800],[1024,768],[1024,600],[960,540]])){
   await page.setViewportSize({width,height});await page.evaluate(()=>potriveste());
   const result=await page.evaluate(()=>{
    const failures=[];let checks=0;
    const box=b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}},brief=b=>(b.className+' '+(b.textContent||b.getAttribute('aria-label'))).slice(0,75);
    for(const niv of ['mus','cap'])for(const l of [0,1,24,50,99]){
     S.niv=niv;S.lume=l;INSULE=lumea(l);
     for(let i=0;i<INSULE.length;i++)for(let p=0;p<coada(i).length;p++){
      S.ins=i;S.p=p;S.ecran='joc';intraPas();if(A.pas.t==='memorie'){A.gen=-1;A.faza='raspunde'}render();if(A.pas.t==='film')terminaFilm(true);
      const f={l,niv,i,p,type:A.pas.t};checks++;
      for(const b of document.querySelectorAll('#app button:not(:disabled)')){
       const r=box(b);if(!r.width)continue;
       // Check the full bounds against clipping and the center against overlays.
       const corp=b.closest('.corp'),clip=corp&&corp.getBoundingClientRect();
       if(clip&&(r.y<clip.top-1||r.y+r.height>clip.bottom+1)||r.y<0||r.y+r.height>innerHeight+1||!b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))failures.push({...f,why:'clipped or covered button',button:brief(b)});
      }
      if(A.pas.hint&&!A.rezolvat){
       const before=[...document.querySelectorAll('#app .pod button')].map(b=>({text:b.textContent,box:box(b)}));cereIndiciu();
       const after=[...document.querySelectorAll('#app .pod button')].map(b=>({text:b.textContent,box:box(b)}));checks++;
       for(const b of before){const a=after.find(a=>a.text===b.text);if(!a||Math.abs(a.box.x-b.box.x)>1||Math.abs(a.box.y-b.box.y)>1)failures.push({...f,why:'toolbar moved after hint',button:b.text})}
      }
     }
    }
    return {checks,failures};
   });
   reports.push({width,height,...result});console.log(width,height,'checks',result.checks,'issues',result.failures.length,JSON.stringify(result.failures.slice(0,6)));
   const sample=result.failures[0]||{l:0,niv:'cap',i:0,p:1};
   await page.evaluate(f=>{S.lume=f.l;S.niv=f.niv;INSULE=lumea(f.l);S.ins=f.i;S.p=f.p;S.ecran='joc';intraPas();render()},sample);
   await page.screenshot({path:path.join(output,`${width}x${height}.jpg`),type:'jpeg',quality:75});
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({reports,runtime},null,2));assert.deepEqual(runtime,[]);assert.equal(reports.reduce((sum,r)=>sum+r.failures.length,0),0);console.log('PASS: visible game controls and stable toolbar after hints');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
