import puppeteer from '../puppeteer.js';
import dcMetatags from '../harvest-page/dc-metatags.js';

async function harvestPage(url) {
  await puppeteer.page.goto(url);
  let dc = await dcMetatags();
  return dc;
}

export default harvestPage;