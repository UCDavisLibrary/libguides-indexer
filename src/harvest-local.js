import startHarvest from "./lib/api/start-harvest.js";
import storage from "./lib/storage.js";
import puppeteer from "./lib/puppeteer.js";
import harvestPage from "./lib/tasks/harvest-page.js";
import harvestDatabase from "./lib/harvest-database.js";
import cleanupGCS from "./lib/tasks/cleanup-gcs.js"
import config from './lib/config.js';

// harvest databases
// await harvestDatabase.harvest();

console.log('Writing data to: '+config.storage.bucket);

// run the harvest process locally
let data = await startHarvest();

await puppeteer.init();

for( let item of data.urls ) {
  let content = await harvestPage(item.url, item.id);
  console.log('writing: '+item.id+'.json');
  await storage.writeJson(item.id+'.json', content);
}

await cleanupGCS(data);

console.log('done');

// let content = await harvestPage("https://guides.library.ucla.edu/data", "122345");
// let content = await harvestPage("https://guides.library.ucla.edu/c.php?g=833925&p=6039526", "122345");
// console.log(content);

// await puppeteer.browser.close();