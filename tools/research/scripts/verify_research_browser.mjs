// Browser acceptance tests. Requires Playwright; operates only on the supplied
// research site. Uses an isolated browser profile and never submits live actions.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:8767/';
const output=process.argv[3]||'work/research-browser-qa';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
const checks=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const initialResponses=[];page.on('response',r=>initialResponses.push({url:r.url(),bytes:Number(r.headers()['content-length']||0)}));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Find the moments worth making for.'}).waitFor();
 const bytes=initialResponses.reduce((sum,r)=>sum+r.bytes,0);
 assert(bytes<500000,`Initial view loaded ${bytes} bytes`);
 assert(!initialResponses.some(r=>/\/assets\/(?:data.json|views\/)/.test(r.url)),'Legacy bulk data loaded on startup');
 checks.push({name:'small dated bootstrap',bytes});
 await page.screenshot({path:path.join(output,'overview.png'),fullPage:true});
 await page.getByRole('link',{name:'Competitors',exact:true}).click();
 const search=page.getByLabel('Find competitors',{exact:true});await search.waitFor();
 await search.fill('CaitlynMinimalist');
 await page.getByRole('button',{name:'CaitlynMinimalist',exact:true}).waitFor();
 await page.getByRole('button',{name:'Add CaitlynMinimalist to watchlist',exact:true}).click();
 await page.reload({waitUntil:'networkidle'});
 await page.getByLabel('Watchlist only',{exact:true}).check();
 await page.getByRole('button',{name:'Remove CaitlynMinimalist from watchlist',exact:true}).waitFor();
 checks.push({name:'search and watchlist reload persistence',ok:true});
 await page.getByRole('button',{name:'CaitlynMinimalist',exact:true}).click();
 await page.locator('dialog[open] svg').waitFor();
 assert((await page.locator('dialog').innerText()).includes('Review'),'Missing review evidence explanation');
 await page.screenshot({path:path.join(output,'competitor.png'),fullPage:true});
 await page.keyboard.press('Escape');
 await page.getByLabel('Find competitors',{exact:true}).fill('__no_such_shop_9283__');
 assert((await page.locator('main').innerText()).includes('No shops'),'Missing empty result state');
 checks.push({name:'profile chart and empty search',ok:true});
 await page.getByRole('link',{name:'Buyer moments',exact:true}).click();
 await page.getByRole('button',{name:/^September,/}).waitFor();
 await page.getByRole('button',{name:/^September,/}).click();
 await page.getByPlaceholder('Wedding, teacher, birthday…').fill('birthday');
 await page.locator('.moment-title').first().click();
 await page.getByRole('link',{name:'Open detailed buyer-moment research →',exact:true}).waitFor();
 assert((await page.locator('dialog').innerText()).includes('Planning window'));
 await page.keyboard.press('Escape');
 await page.getByPlaceholder('Wedding, teacher, birthday…').fill('');
 await page.screenshot({path:path.join(output,'buyer-moments.png'),fullPage:true});
 checks.push({name:'month and buyer-intent exploration',ok:true});
 await page.getByRole('link',{name:'Evidence & health',exact:true}).click();
 await page.getByText('eRank competitor snapshot',{exact:true}).waitFor();
 await page.screenshot({path:path.join(output,'evidence.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 for(const view of ['overview','competitors','moments','evidence']) {
   await page.goto(base+'#'+view,{waitUntil:'networkidle'});
   await page.waitForTimeout(150);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Mobile overflow ${view}`);
 }
 await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
 checks.push({name:'four mobile views without page overflow',ok:true});
 const corrupt=await browser.newPage();
 await corrupt.route('**/assets/research/shops.json*',async route=>{
   const r=await route.fetch();const body=await r.body();const altered=Buffer.from(body);const i=altered.indexOf(Buffer.from('CaitlynMinimalist'));assert(i>=0);altered[i]=88;await route.fulfill({response:r,body:altered});
 });
 await corrupt.goto(base+'#competitors',{waitUntil:'networkidle'});
 await corrupt.getByText('The snapshot changed while loading. Reload to obtain matching data.',{exact:true}).waitFor();
 checks.push({name:'same-length corrupted shard rejected by hash',ok:true});await corrupt.close();
 await page.goto(base+'?view=company',{waitUntil:'domcontentloaded'});
 await page.waitForURL('**/classic.html?view=company');
 checks.push({name:'legacy shared query preserved',ok:true});
 assert.deepEqual(errors,[]);
 const report={ok:true,checks,javascriptErrors:errors};await fs.writeFile(path.join(output,'browser-qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
