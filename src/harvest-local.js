import startHarvest from "./lib/api/start-harvest.js";
import storage from "./lib/storage.js";
import puppeteer from "./lib/puppeteer.js";
import harvestPage from "./lib/tasks/harvest-page.js";

// run the harvest process locally
// let data = await startHarvest();

await puppeteer.init();

// for( let item of data.urls ) {
//   console.log('Harvesting: '+item.url);
//   let content = await harvestPage(item.url, item.id);
//   console.log('writing: '+item.id+'.json');
//   await storage.writeJson(item.id+'.json', content);
// }


// let content = await harvestPage("https://guides.library.ucla.edu/hunger-strike", "122345");
let content = await harvestPage("https://guides.library.ucla.edu/c.php?g=833925&p=6039526", "122345");

console.log(content);

await puppeteer.browser.close();