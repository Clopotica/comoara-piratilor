const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),errors=[];
 const server=http.createServer((q,r)=>{const f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{r.writeHead(e?404:200,{'Content-Type':f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'application/javascript':'audio/mpeg'});r.end(e?'':d)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 try{
  const page=await browser.newPage({hasTouch:true,viewport:{width:1280,height:720}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#login-user').fill('invalid-account');await page.locator('#login-pass').fill('invalid');await page.locator('#login-submit').tap();
  await page.waitForFunction(()=>document.querySelector('#login-error').textContent.length>0);assert(!(await page.locator('#app').isVisible()));
  if(process.env.TEST_USER&&process.env.TEST_PASSWORD){
   await page.locator('#login-user').fill(process.env.TEST_USER);await page.locator('#login-pass').fill(process.env.TEST_PASSWORD);await page.locator('#login-submit').tap();
  }else{await page.evaluate(()=>sessionStorage.setItem('clopotica-comoara-login-v1','user01'));await page.reload()}
  await page.locator('#login-wall').waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Ecran complet',exact:true}).tap();await page.waitForFunction(()=>!!document.fullscreenElement);
  await page.getByRole('button',{name:'Ieși din ecran complet',exact:true}).tap();await page.waitForFunction(()=>!document.fullscreenElement);
  await page.getByRole('button',{name:/Pornesc în larg/}).tap();await page.locator('#nm').fill('Ana Ochi-de-Șoim');
  await page.getByRole('button',{name:'Semn 🦜',exact:true}).tap();await page.getByRole('button',{name:/Ridicați ancora/}).tap();
  await page.getByRole('button',{name:'Jurnalul de bord',exact:true}).tap();await page.getByRole('button',{name:'Închide jurnalul',exact:true}).tap();
  await page.getByRole('button',{name:'Naratoarea',exact:true}).tap();await page.getByRole('button',{name:/Naratoarea este PORNITĂ/}).tap();await page.getByRole('button',{name:'Gata',exact:true}).tap();
  await page.getByRole('button',{name:'Sunet',exact:true}).tap();assert.equal(await page.evaluate(()=>S.sunet),false);
  await page.getByRole('button',{name:'Alege altă lume',exact:true}).tap();await page.locator('.lume').nth(99).tap();assert.equal(await page.evaluate(()=>S.lume),99);
  await page.getByRole('button',{name:'Alege altă lume',exact:true}).tap();await page.locator('.lume').first().tap();
  const types=new Set();let rounds=0,fullFilm=false;
  while(await page.evaluate(()=>S.ecran!=='final')){
   assert(++rounds<150,'Game did not finish');
   if(await page.evaluate(()=>S.ecran==='chart')){await page.locator('#app .pod button').first().tap();continue}
   const step=await page.evaluate(()=>({t:A.pas.t,ras:A.pas.ras,items:A.pas.items,opt:A.opt||A.pas.opt}));types.add(step.t);
   if(step.t==='film'){
    if(!fullFilm){
     const t0=await page.evaluate(()=>A.t0);await page.getByRole('button',{name:'Ecran complet',exact:true}).tap();await page.waitForFunction(()=>!!document.fullscreenElement);
     assert.equal(await page.evaluate(()=>A.t0),t0);await page.getByRole('button',{name:'Ieși din ecran complet',exact:true}).tap();await page.waitForFunction(()=>!document.fullscreenElement);fullFilm=true;
    }
    if(await page.getByRole('button',{name:/Sari peste/}).count())await page.getByRole('button',{name:/Sari peste/}).tap();
   }else if(step.t==='alege')await page.locator('.opt').nth(step.opt.findIndex(o=>o.ok)).tap();
   else if(step.t==='decizie')await page.locator('.opt').nth(step.opt.findIndex(o=>o.v==='bun')).tap();
   else if(step.t==='harta')await page.getByRole('button',{name:step.ras,exact:true}).tap();
   else if(step.t==='cod'){
    for(const t of step.ras)await page.locator('.tasta').filter({hasText:new RegExp('^'+t+'$')}).tap();
    await page.getByRole('button',{name:/Verifică/}).tap();
   }else if(step.t==='memorie'){
    await page.waitForFunction(()=>A.faza==='raspunde');const seq=await page.evaluate(()=>A.seq);for(const i of seq)await page.locator('.tile').nth(i).tap();
   }else if(step.t==='ordine')for(const v of step.items.sort((a,b)=>a-b))await page.locator('.tile').filter({hasText:new RegExp('^'+v+'$')}).tap();
   await page.locator('#app .pod button').filter({hasText:/Mai departe|Continuă/}).first().tap();
  }
  assert.equal(await page.evaluate(()=>S.gata.length),6);console.log('Completed world using touch:',rounds,'steps;',Array.from(types).join(', '));
  await page.setViewportSize(process.env.TOUCH_VIEWPORT?JSON.parse(process.env.TOUCH_VIEWPORT):{width:390,height:650});
  await page.evaluate(()=>{
   potriveste();S.niv='cap';S.lume=0;INSULE=lumea(0);
   outer:for(let i=0;i<INSULE.length;i++)for(let p=0;p<coada(i).length;p++){const step=R(coada(i)[p]);if(step.t==='cod'&&step.hint){S.ins=i;S.p=p;break outer}}
   S.ecran='joc';intraPas();render();
  });
  await page.getByRole('button',{name:/Indiciu/}).tap();
  const key=page.locator('.tasta').first();await key.scrollIntoViewIfNeeded();const before=await key.boundingBox();await key.tap();const after=await page.locator('.tasta').first().boundingBox();
  assert(Math.abs(before.y-after.y)<2,'Keypad jumped after touch');
  await page.getByRole('button',{name:'Șterge ultimul simbol',exact:true}).tap();assert.equal(await page.evaluate(()=>A.buf.length),0);
  await page.reload();await page.locator('#login-wall').waitFor({state:'hidden'});await page.getByRole('button',{name:'Ieșire din cont',exact:true}).tap();await page.locator('#login-wall').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);console.log('PASS: login, touch targets, journal, voice, sound, world selection, all six islands, fullscreen labels and film continuity, keypad scroll, delete, session reload and logout; no runtime errors');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
