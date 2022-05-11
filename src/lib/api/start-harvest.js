import crawlSitemap from '../tasks/crawl-sitemap.js';
import storage from '../storage.js';
import config from '../config.js';
import harvestDatabase from '../harvest-database.js';

async function startHarvest() {
  await harvestDatabase.harvest();

  let data = await crawlSitemap();
  await storage.writeJson(config.storage.indexFile, data);
  return data;
}

export default startHarvest;