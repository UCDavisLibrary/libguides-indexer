import startHarvest from "./lib/api/start-harvest.js";
import storage from "./lib/storage.js";
import puppeteer from "./lib/puppeteer.js";
import harvestPage from "./lib/tasks/harvest-page.js";

// run the harvest process locally
let data = await startHarvest();

await puppeteer.init();

for( let item of data.urls ) {
  console.log('Harvesting: '+item.url);
  let content = await harvestPage(item.url);
  console.log('writing: '+item.id+'.json');
  await storage.writeJson(item.id+'.json', content);
}

await puppeteer.browser.close();