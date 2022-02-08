import crypto from 'crypto';
import puppeteer from '../puppeteer.js';
import dcMetatags from '../harvest-page/dc-metatags.js';
import ogMetatags from '../harvest-page/og-metatags.js';
import libBoxes from '../harvest-page/lib-boxes.js';
import breadcrumbs from '../harvest-page/breadcrumbs.js';
import childPages from '../harvest-page/child-pages.js';

async function harvestPage(url, parent=true) {
  console.log('Harvesting: '+url);

  // load url
  await puppeteer.goto(url);

  // main data harvest
  let dublinCore = await dcMetatags();
  let openGraph = await ogMetatags();
  let lb = await libBoxes();
  let bc = await breadcrumbs();

  // create response object, this will be stored, as is, in the google cloud bucket
  let data = {
    url, 
    id: crypto.createHash('md5').update(url).digest('hex'),
    breadcrumbs: bc,
    dublinCore,
    openGraph,
    libBoxes: lb,
    timestamp : new Date().toISOString()
  }

  if( parent ) {
    data.children = await childPages();
    for( let i = 0; i < data.children.length; i++ ) {
      data.children[i] = await harvestPage(data.children[i].href, false);
    }
  }

  return data;
}

export default harvestPage;