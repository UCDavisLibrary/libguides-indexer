import crawlSitemap from '../tasks/crawl-sitemap.js';
import storage from '../storage.js';
import config from '../config.js';

async function startHarvest() {
  let data = await crawlSitemap();
  await storage.writeJson(config.storage.indexFile, data);
  return data;
}

export default startHarvest;